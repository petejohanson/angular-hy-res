  'use strict';

var resourceAssertions = require('./resource-assertions');

describe('Module: angular-hy-res', function () {
  var hrResource, httpBackend, rootScope;

  // load the controller's module
  beforeEach(angular.mock.module('angular-hy-res'));
  beforeEach(angular.mock.module('angular-hy-res-hal'));

  beforeEach(angular.mock.inject(function(_hrRoot_, $httpBackend, $rootScope) {
    hrResource = _hrRoot_;
    httpBackend = $httpBackend;
    rootScope = $rootScope;
  }));

  describe('an unresolved root resource', function() {
    var context = {};
    var resource;

    beforeEach(function() {
      var raw = {
        type:'promo',
        _links:{
          self: { href: '/orders/123'},
          customer: { href: '/customers/321' },
          'customer-search': { href: '/customers/{id}', templated: true },
          'shipping-address': { href: '/address/1234' },
          stores: [
            { href: '/stores/123' },
            { href: '/stores/456' }
          ]
        },
        _embedded: {
          payment: {
            amount: '$10.50',
            _links: {
              self: { href: '/orders/123/payment' }
            }
          },
          'shipping-address': {
            street1: '123 Wilkes Lane',
            _links: {
              self: { href: '/address/1234' }
            }
          },
          discounts: [
            {
              name: 'New User Discount',
              _links: {
                self: { href: '/discounts/123' }
              }
            },
            {
              name: 'SPRING20 Coupon Code',
              _links: {
                self: { href: '/discounts/321' }
              }
            }
          ]
        }
      };

      httpBackend
        .expectGET('/orders/123')
        .respond(raw,{'Content-Type': 'application/hal+json'});
      resource = new hrResource('/orders/123').follow();
      context.resource = resource;
      context.rootScope = rootScope;
    });

    resourceAssertions.unresolvedResourceBehavior(context);

    describe('a resolved resource', function() {
      beforeEach(function () {
        httpBackend.flush();
      });

      resourceAssertions.resolvedResourceBehavior(context);

      it('should contain the parsed properties', function () {
        expect(resource.type).toBe('promo');
      });

      describe('$if', function() {
        it('should return false if not embedded or linked', function() {
          expect(resource.$if('nada')).toBeFalsy();
        });

        it('should return true if a link is present', function() {
          expect(resource.$if('self')).toBeTruthy();
        });

        it('should return true if an embedded resource is present', function() {
          expect(resource.$if('payment')).toBeTruthy();
        })
      });

      describe('$link', function() {
        it('should return the link for single links', function() {
          expect(resource.$link('self').href).toEqual('/orders/123');
        });

        it('should return null for a rel not present', function() {
          expect(resource.$link('blah')).toBeNull();
        });

        it('should throw an exception for a multiple valued rel', function() {
          expect(function() { resource.$link('stores'); }).toThrow();
        });
      });

      describe('$links', function() {
        it('should return the links for single links', function() {
          var links = resource.$links('self');
          expect(links.length).toBe(1);
          expect(resource.$links('self')[0].href).toEqual('/orders/123');
        });

        it('should return empty array for a rel not present', function() {
          expect(resource.$links('blah')).toEqual([]);
        });

        it('should return an array for multiple links present', function() {
          var links = resource.$links('stores');
          expect(links.length).toBe(2);
        });
      });

      describe('embedded resources', function () {
        var payment;
        beforeEach(function () {
          payment = resource.$sub('payment');
          context.resource = payment;
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should not be null', function () {
          expect(payment).not.toBeNull();
        });

        it('should have the basic properties', function () {
          expect(payment.amount).toBe('$10.50');
        });
      });

      describe('an array of embedded resources', function () {
        var discounts;
        beforeEach(function () {
          discounts = resource.$subs('discounts');
          context.resource = discounts;
        });

        it('should contain two resources', function () {
          expect(discounts.length).toBe(2);
        });

        it('should contain resolved resources', function () {
          for (var r in discounts) {
            context.resource = r;
            resourceAssertions.resolvedResourceBehavior(context);
          }
        });

        it('should have a resolved $promise on the array', function (done) {
          discounts.$promise.then(function (a) {
            expect(a).toBe(discounts);
            done();
          });

          rootScope.$apply();
        });

        it('should have a true $resolved property', function () {
          expect(discounts.$resolved).toBe(true);
        });
      });

      describe('$followOne', function() {
        describe('with a single link relation', function () {
          var raw = {
            _links: {
              self: { href: '/customers/321' }
            },
            name: 'John Wayne'
          };

          var customerResource;

          beforeEach(function () {
            httpBackend
              .expectGET('/customers/321')
              .respond(raw, {'Content-Type': 'application/hal+json'});
            customerResource = resource.$followOne('customer');
            context.resource = customerResource;
          });

          resourceAssertions.unresolvedResourceBehavior(context);

          describe('and then resolved', function () {
            beforeEach(function () {
              httpBackend.flush();
            });

            resourceAssertions.resolvedResourceBehavior(context);

            it('should have the raw properties', function () {
              expect(customerResource.name).toBe('John Wayne');
            });
          });
        });

        describe('following a link relation when embedded present', function() {
          var shippingResource;

          beforeEach(function() {
            shippingResource = resource.$followOne('shipping-address');
            context.resource = shippingResource;
          });

          resourceAssertions.resolvedResourceBehavior(context);

          it ('should have the embedded resource properties', function() {
            expect(shippingResource.street1).toBe('123 Wilkes Lane');
          });
        });
      });

      describe('$followAll', function() {
        describe('following an link relation that is an array', function () {
          var stores;
          beforeEach(function() {
            var rawStore = {};
            httpBackend
              .expectGET('/stores/123')
              .respond(rawStore, {'Content-Type': 'application/hal+json'});
            httpBackend
              .expectGET('/stores/456')
              .respond(rawStore, {'Content-Type': 'application/hal+json'});
            stores = resource.$followAll('stores');
          });

          it('has a false $resolved', function() {
            expect(stores.$resolved).toBe(false);
          });

          it('has a length of 2', function() {
            expect(stores.length).toBe(2);
          });

          it('is an array of unresolved resources', function() {
            for (var s in stores) {
              context.resource = s;
              resourceAssertions.unresolvedResourceBehavior(context);
            }
          });

          describe('when the background requests complete', function() {
            beforeEach(function() {
              httpBackend.flush();
            });

            it('has a true $resolved property', function() {
              expect(stores.$resolved).toBe(true);
            });

            it('has a $promise that returns the array that completes', function(done) {
              stores.$promise.then(function(s) {
                expect(s).toEqual(stores);
                done();
              });

              rootScope.$apply();
            });
          });
        });
      });

      describe('following a link object', function() {
        var raw = {
          _links: {
            self: { href: '/customers/321' }
          },
          name: 'John Wayne'
        };

        var customerResource;

        beforeEach(function() {
          httpBackend
            .expectGET('/customers/321')
            .respond(raw,{'Content-Type': 'application/hal+json'});
          var link = resource.$link('customer');
          customerResource = link.follow();
          context.resource = customerResource;
        });

        resourceAssertions.unresolvedResourceBehavior(context);

        describe('and then resolved', function() {
          beforeEach(function() {
            httpBackend.flush();
          });

          resourceAssertions.resolvedResourceBehavior(context);

          it('should have the raw properties', function() {
            expect(customerResource.name).toBe('John Wayne');
          });
        });
      });

      describe('following a templated link relation', function() {
        var raw = {
          _links: {
            self: { href: '/customers/666' }
          },
          name: 'Bruce Lee'
        };

        var customerResource;

        beforeEach(function() {
          httpBackend
            .expectGET('/customers/666')
            .respond(raw,{'Content-Type': 'application/hal+json'});
          customerResource = resource.$followOne('customer-search', { data: { id: '666' } });
          context.resource = customerResource;
        });

        resourceAssertions.unresolvedResourceBehavior(context);

        describe('and then resolved', function() {
          beforeEach(function() {
            httpBackend.flush();
          });

          resourceAssertions.resolvedResourceBehavior(context);

          it('should have the raw properties', function() {
            expect(customerResource.name).toBe('Bruce Lee');
          });
        });
      });
    });
    describe('a series of $followOne calls', function() {
      var profileResource;

      var rawCustomer = {
        _links: {
          self: { href: '/customers/321' },
          profile: { href: '/customers/321/profile' }
        },
        name: 'John Wayne'
      };

      var rawProfile = {
        _links: {
          self: { href: '/customers/321/profile' }
        },
        location: 'Anytown, USA'
      };

      beforeEach(function() {
        httpBackend
          .expectGET('/customers/321')
          .respond(rawCustomer,{'Content-Type': 'application/hal+json'});
        httpBackend
          .expectGET('/customers/321/profile')
          .respond(rawProfile,{'Content-Type': 'application/hal+json'});

        profileResource = resource.$followOne('customer').$followOne('profile');
        context.resource = profileResource;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResource.location).toBe('Anytown, USA');
        });
      });
    });

    describe('a series of $followOne calls with embedded resource', function() {
      var profileResource;

      var rawCustomer = {
        _links: {
          self: { href: '/customers/321' },
          profile: { href: '/customers/321/profile' }
        },
        _embedded: {
          profile: {
            _links: {
              self: { href: '/customers/321/profile' }
            },
            location: 'Anytown, USA'
          }
        },
        name: 'John Wayne'
      };

      beforeEach(function() {
        httpBackend
          .expectGET('/customers/321')
          .respond(rawCustomer,{'Content-Type': 'application/hal+json'});

        profileResource = resource.$followOne('customer').$followOne('profile');
        context.resource = profileResource;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResource.location).toBe('Anytown, USA');
        });
      });
    });

    describe('a $followAll call on an unresolved resource', function() {
      var profileResources;

      var rawCustomer = {
        _links: {
          self: { href: '/customers/321' },
          profile: { href: '/customers/321/profile' }
        },
        name: 'John Wayne'
      };

      var rawProfile = {
        _links: {
          self: { href: '/customers/321/profile' }
        },
        location: 'Anytown, USA'
      };

      beforeEach(function() {
        httpBackend
          .expectGET('/customers/321')
          .respond(rawCustomer,{'Content-Type': 'application/hal+json'});
        httpBackend
          .expectGET('/customers/321/profile')
          .respond(rawProfile,{'Content-Type': 'application/hal+json'});

        profileResources = resource.$followOne('customer').$followAll('profile');
        context.resource = profileResources;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResources[0].location).toBe('Anytown, USA');
        });
      });
    });

    describe('a $followAll call on an unresolved resource with embedded items', function() {
      var profileResources;

      var rawCustomer = {
        _links: {
          self: { href: '/customers/321' },
          profile: { href: '/customers/321/profile' }
        },
        _embedded: {
          profile: {
            _links: {
              self: { href: '/customers/321/profile' }
            },
            location: 'Anytown, USA'
          }
        },
        name: 'John Wayne'
      };

      beforeEach(function() {
        httpBackend
          .expectGET('/customers/321')
          .respond(rawCustomer,{'Content-Type': 'application/hal+json'});

        profileResources = resource.$followOne('customer').$followAll('profile');
        context.resource = profileResources;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        resourceAssertions.resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResources[0].location).toBe('Anytown, USA');
        });
      });
    });
  });
});
