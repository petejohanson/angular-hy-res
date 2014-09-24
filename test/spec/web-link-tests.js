'use strict';

var resourceAssertions = require('./resource-assertions');

describe('angular-hy-res: hrWebLink', function () {
  var hrWebLinkFactory, hrResource, rootScope, httpBackend;

  // load the controller's module
  beforeEach(angular.mock.module('angular-hy-res'));

  beforeEach(angular.mock.inject(function(_hrWebLinkFactory_, _hrResource_, $rootScope, $httpBackend) {
    hrWebLinkFactory = _hrWebLinkFactory_;
    hrResource = _hrResource_;
    rootScope = $rootScope;
    httpBackend = $httpBackend;
  }));

  describe('creating a web link', function() {
    var link;

    beforeEach(function() {
      link = hrWebLinkFactory({
        href: '/posts/123',
        title: 'Hypermedia and AngularJS'
      }, hrResource);
    });

    it('had the data properties', function() {
      expect(link.href).toBe('/posts/123');
      expect(link.title).toBe('Hypermedia and AngularJS');
    });

    describe('following the link', function() {
      var resource;
      var context = {};

      beforeEach(function() {
        httpBackend.expectGET('/posts/123').respond('{\"title\":\"Hypermedia and AngularJS\"}');
        resource = link.follow();
        context.rootScope = rootScope;
        context.resource = resource;
      });

      resourceAssertions.unresolvedResourceBehavior(context);

      describe('once the request completes', function() {
        beforeEach(function() {
          httpBackend.flush();
        });

        resourceAssertions.resolvedResourceBehavior(context);
        it('has the expected properties', function() {
          expect(resource.title).toBe('Hypermedia and AngularJS');
        });
      });
    });
  });

  describe('creating a templated web link', function() {
    var link;

    beforeEach(function() {
      link = hrWebLinkFactory({
        href: '/posts{/id}',
        templated: true
      }, {});
    });

    it('is templated', function() {
      expect(link.templated).toBe(true);
    });

    describe('following the link without providing data in options', function() {
      it('should throw an exception', function() {
        var follow = function() {
          link.follow();
        };

        expect(follow).toThrow();
      });
    });
  });
});
