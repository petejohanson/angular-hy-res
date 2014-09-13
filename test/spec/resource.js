'use strict';

function unresolvedResourceBehavior(context) {
  describe('(shared)', function() {
    beforeEach(function() {
      this.resource = context.resource;
    });

    it('should not be $resolved', function() {
      expect(this.resource.$resolved).toBe(false);
    });
  
    it('should have a $promise', function() {
      expect(this.resource.$promise).not.toBe(null);
    });

    it('should not have an $error', function() {
      expect(this.resource.$error).toBeNull();
    });
  });
}

function resolvedResourceBehavior(context) {
  describe('(shared)', function() {
    beforeEach(function() {
      this.resource = context.resource;
      this.rootScope = context.rootScope;
    });

    it('should be $resolved', function() {
      expect(this.resource.$resolved).toBe(true);
    });
  
    it('should not have an $error', function() {
      expect(this.resource.$error).toBe(null);
    });

    it('should have a completed promise', function(done) {
      var res = this.resource;
      this.resource.$promise.then(function(r) {
        expect(res).toBe(r);
        done();
      });

      this.rootScope.$digest();
    });
  });
}

describe('Module: angular-hy-res', function () {
  var hrResource, httpBackend, rootScope;

  // load the controller's module
  beforeEach(module('angular-hy-res'));
  beforeEach(module('angular-hy-res-hal'));

  beforeEach(inject(function(_hrResource_, $httpBackend, $rootScope) {
    hrResource = _hrResource_;
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
      resource = hrResource('/orders/123').get();
      context.resource = resource;
      context.rootScope = rootScope;
    });

    unresolvedResourceBehavior(context);

    describe('a resolved resource', function() {
      beforeEach(function () {
        httpBackend.flush();
      });

      resolvedResourceBehavior(context);

      it('should contain the parsed properties', function () {
        expect(resource.type).toBe('promo');
      });

      it('should have the self link', function () {
        expect(resource.$link('self')).toEqual({ href: '/orders/123' });
      });

      it('should have other link be null', function () {
        expect(resource.$link('blah')).toBe(null);
      });

      describe('embedded resources', function () {
        var payment;
        beforeEach(function () {
          payment = resource.$embedded('payment');
          context.resource = payment;
        });

        resolvedResourceBehavior(context);

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
          discounts = resource.$embedded('discounts');
          context.resource = discounts;
        });

        it('should contain two resources', function () {
          expect(discounts.length).toBe(2);
        });

        it('should contain resolved resources', function () {
          for (var r in discounts) {
            context.resource = r;
            resolvedResourceBehavior(context);
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

      describe('following a link relation', function () {
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
          customerResource = resource.$follow('customer');
          context.resource = customerResource;
        });

        unresolvedResourceBehavior(context);

        describe('and then resolved', function () {
          beforeEach(function () {
            httpBackend.flush();
          });

          resolvedResourceBehavior(context);

          it('should have the raw properties', function () {
            expect(customerResource.name).toBe('John Wayne');
          });
        });
      });

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
          stores = resource.$follow('stores');
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
            unresolvedResourceBehavior(context);
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

      describe('following a link relation when embedded present', function() {
        var shippingResource;

        beforeEach(function() {
          shippingResource = resource.$follow('shipping-address');
          context.resource = shippingResource;
        });

        resolvedResourceBehavior(context);

        it ('should have the embedded resource properties', function() {
          expect(shippingResource.street1).toBe('123 Wilkes Lane');
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
          customerResource = resource.$followLink(link);
          context.resource = customerResource;
        });

        unresolvedResourceBehavior(context);
        
        describe('and then resolved', function() {
          beforeEach(function() {
            httpBackend.flush();
          });
        
          resolvedResourceBehavior(context);
        
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
          customerResource = resource.$follow('customer-search', { data: { id: '666' } });
          context.resource = customerResource;
        });

        unresolvedResourceBehavior(context);
        
        describe('and then resolved', function() {
          beforeEach(function() {
            httpBackend.flush();
          });
        
          resolvedResourceBehavior(context);
        
          it('should have the raw properties', function() {
            expect(customerResource.name).toBe('Bruce Lee');
          });
        });
      });
    });
    describe('a series of $follows', function() {
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

        profileResource = resource.$follow('customer').$follow('profile');
        context.resource = profileResource;
      });

      unresolvedResourceBehavior(context);

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        resolvedResourceBehavior(context);

        it('should have the profile location', function() {
          expect(profileResource.location).toBe('Anytown, USA');
        });
      });
    });
  });
});
