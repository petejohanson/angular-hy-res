'use strict';

describe('angular-hy-res: hrLinkHeaderExtension', function () {
  var hrLinkHeaderExtension, httpBackend, hrResource;

  // load the controller's module
  beforeEach(angular.mock.module('angular-hy-res'));
  beforeEach(angular.mock.module('angular-hy-res-link-header'));

  beforeEach(angular.mock.inject(function(_hrLinkHeaderExtension_, $httpBackend, _hrResource_) {
    hrLinkHeaderExtension = _hrLinkHeaderExtension_;
    httpBackend = $httpBackend;
    hrResource = _hrResource_;
  }));

  describe('extension applicability', function() {
    it('should apply when Link header(s) found', function() {
      expect(hrLinkHeaderExtension.applies({}, function(header) {
        return header === 'Link' ? '</posts?page=2>; rel=next' : null;
      }, 200)).toBe(true);
    });
  });
  describe('links parser', function() {
    var links;

    beforeEach(function() {
      links = hrLinkHeaderExtension.linkParser({}, function(header) {
        return header === 'Link' ? '</posts?page=3>; rel=next, </posts?page=1>; rel="prev"' : null;
      }, hrResource);
    });

    it('should return the links', function() {
      expect(links.next.href).toEqual('/posts?page=3');
      expect(links.prev.href).toEqual('/posts?page=1');
    });

    describe('following a link', function() {

      it('should GET the expected URL', function() {
          httpBackend.expectGET('/posts?page=3').respond({});

          links.next.follow();
          httpBackend.flush();
      });
    });
  });

  describe('embedded parser', function() {
    it('should return an empty array', function() {
      var embedded = hrLinkHeaderExtension.embeddedParser({}, {});
      expect(embedded).toEqual([]);
    });
  });
});