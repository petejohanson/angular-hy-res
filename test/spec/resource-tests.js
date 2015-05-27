'use strict';

/*jshint expr: true*/

require('es6-promise').polyfill();

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

var should = chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var hrCore = require('../../core');
var hrHal = require('../../hal');

describe('Module: angular-hy-res', function () {
  var hrResource, httpBackend, rootScope;

  // load the controller's module
  beforeEach(angular.mock.module(hrCore));
  beforeEach(angular.mock.module(hrHal));

  beforeEach(angular.mock.inject(function(_hrRoot_, $httpBackend, $rootScope) {
    hrResource = _hrRoot_;
    httpBackend = $httpBackend;
    rootScope = $rootScope;
  }));

  describe('an unresolved root resource', function() {
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
      resource = hrResource('/orders/123').follow();
    });

    it('should be an unresolved resource', function() {
      resource.should.be.an.unresolved.resource;
    });

    describe('a resolved resource', function() {
      beforeEach(function () {
        httpBackend.flush();
      });

      it('should be an resolved resource', function() {
        resource.$promise.should.eventually.be.a.resolved.resource;
      });

      it('should contain the parsed properties', function () {
        resource.$promise.should.eventually.have.property('type', 'promo');
      });

      describe('$has', function() {
        it('should return false if not embedded or linked', function() {
          resource.$has('nada').should.be.false;
        });

        it('should return true if a link is present', function() {
          resource.$has('self').should.be.true;
        });

        it('should return true if an embedded resource is present', function() {
          resource.$has('payment').should.be.true;
        });
      });

      describe('$link', function() {
        it('should return the link for single links', function() {
          resource.$link('self').href.should.eql('/orders/123');
        });

        it('should return null for a rel not present', function() {
          should.not.exist(resource.$link('blah'));
        });

        it('should throw an exception for a multiple valued rel', function() {
          should.Throw(function() { resource.$link('stores'); });
        });
      });

      describe('$links', function() {
        it('should return the links for single links', function() {
          var links = resource.$links('self');
          links.length.should.eql(1);
          resource.$links('self')[0].href.should.eql('/orders/123');
        });

        it('should return empty array for a rel not present', function() {
          resource.$links('blah').should.eql([]);
        });

        it('should return an array for multiple links present', function() {
          var links = resource.$links('stores');
          links.length.should.eql(2);
        });
      });

      describe('embedded resources', function () {
        var payment;
        beforeEach(function () {
          payment = resource.$sub('payment');
        });

        it('should be an resolved resource', function() {
          resource.should.be.a.resolved.resource;
        });

        it('should not be null', function () {
          payment.should.not.be.null;
        });

        it('should have the basic properties', function () {
          payment.amount.should.eql('$10.50');
        });
      });

      describe('an array of embedded resources', function () {
        var discounts;
        beforeEach(function () {
          discounts = resource.$subs('discounts');
        });

        it('should contain two resources', function () {
          discounts.length.should.eql(2);
        });

        it('should contain resolved resources', function () {
          for (var i = 0; i < discounts.length; i++) {
            discounts[i].should.be.a.resolved.resource;
          }
        });

        it('should have a resolved $promise on the array', function () {
          rootScope.$apply();
          discounts.$promise.should.eventually.eql(discounts);
        });

        it('should have a true $resolved property', function () {
          discounts.$resolved.should.eql(true);
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
              .respond(raw, {'content-type': 'application/hal+json'});
            customerResource = resource.$followOne('customer');
          });

          it('should be an unresolved resource', function() {
            customerResource.should.be.an.unresolved.resource;
          });

          describe('and then resolved', function () {
            beforeEach(function () {
              httpBackend.flush();
            });

            it('should be an resolved resource', function() {
              resource.should.be.a.resolved.resource;
            });

            it('should have the raw properties', function () {
              customerResource.$promise.should.eventually.have.property('name', 'John Wayne');
            });
          });
        });

        describe('following a link relation when embedded present', function() {
          var shippingResource;

          beforeEach(function() {
            shippingResource = resource.$followOne('shipping-address');
          });

          it('should be an resolved resource', function() {
            resource.should.be.a.resolved.resource;
          });

          it ('should have the embedded resource properties', function() {
            shippingResource.street1.should.eql('123 Wilkes Lane');
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
              .respond(rawStore, {'content-type': 'application/hal+json'});
            httpBackend
              .expectGET('/stores/456')
              .respond(rawStore, {'content-type': 'application/hal+json'});
            stores = resource.$followAll('stores');
          });

          it('has a false $resolved', function() {
            stores.$resolved.should.be.false;
          });

          it('has a length of 2', function() {
            stores.length.should.eql(2);
          });

          it('is an array of unresolved resources', function() {
            for (var i = 0; i < stores.length; i++) {
              stores[i].should.be.an.unresolved.resource;
            }
          });

          describe('when the background requests complete', function() {
            beforeEach(function() {
              httpBackend.flush();
            });

            it('has a true $resolved property', function() {
              rootScope.$digest();

              stores.$promise.should.eventually.have.property('$resolved', true);
            });

            it('has a $promise that returns the array that completes', function() {
              rootScope.$digest();

              stores.$promise.should.eventually.eql(stores);
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
            .respond(raw,{'content-type': 'application/hal+json'});
          var link = resource.$link('customer');
          customerResource = link.follow();
        });

        it('should be an unresolved resource', function() {
          customerResource.should.be.an.unresolved.resource;
        });

        describe('and then resolved', function() {
          beforeEach(function() {
            httpBackend.flush();
          });

          it('should be an resolved resource', function() {
            customerResource.should.be.a.resolved.resource;
          });

          it('should have the raw properties', function() {
            customerResource.$promise.should.eventually.have.property('name', 'John Wayne');
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
            .respond(raw,{'content-type': 'application/hal+json'});
          customerResource = resource.$followOne('customer-search', { data: { id: '666' } });
        });

        it('should be an unresolved resource', function() {
          customerResource.should.be.an.unresolved.resource;
        });

        describe('and then resolved', function() {
          beforeEach(function() {
            httpBackend.flush();
          });

          it('should be an resolved resource', function() {
            customerResource.should.be.a.resolved.resource;
          });

          it('should have the raw properties', function() {
            customerResource.$promise.should.eventually.have.property('name', 'Bruce Lee');
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
          .respond(rawCustomer,{'content-type': 'application/hal+json'});
        httpBackend
          .expectGET('/customers/321/profile')
          .respond(rawProfile,{'content-type': 'application/hal+json'});

        profileResource = resource.$followOne('customer').$followOne('profile');
      });

      it('should be an unresolved resource', function() {
        profileResource.should.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        it('should be an resolved resource', function() {
          profileResource.$promise.should.eventually.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          profileResource.$promise.should.eventually.have.property('location', 'Anytown, USA');
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
          .respond(rawCustomer,{'content-type': 'application/hal+json'});

        profileResource = resource.$followOne('customer').$followOne('profile');
      });

      it('should be an unresolved resource', function() {
        profileResource.should.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        it('should be an resolved resource', function() {
          profileResource.$promise.should.eventually.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          profileResource.$promise.should.eventually.have.property('location', 'Anytown, USA');
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
          .respond(rawCustomer,{'content-type': 'application/hal+json'});
        httpBackend
          .expectGET('/customers/321/profile')
          .respond(rawProfile,{'content-type': 'application/hal+json'});

        profileResources = resource.$followOne('customer').$followAll('profile');
      });

      it('should be an unresolved resource', function() {
        profileResources.should.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        it('should be an resolved resource', function() {
          profileResources.$promise.should.eventually.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          profileResources.$promise.should.eventually.have.deep.property('[0].location', 'Anytown, USA');
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
          .respond(rawCustomer,{'content-type': 'application/hal+json'});

        profileResources = resource.$followOne('customer').$followAll('profile');
      });

      it('should be an unresolved resource', function() {
        profileResources.should.be.an.unresolved.resource;
      });

      describe('when the chain resolves', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        it('should be an resolved resource', function() {
          profileResources.$promise.should.eventually.be.a.resolved.resource;
        });

        it('should have the profile location', function() {
          profileResources.$promise.should.eventually.have.deep.property('[0].location', 'Anytown, USA');
        });
      });
    });
  });
});
