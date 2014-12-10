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
      expect(links.next[0].href).toEqual('/posts?page=3');
      expect(links.prev[0].href).toEqual('/posts?page=1');
    });

    describe('following a link', function() {

      it('should GET the expected URL', function() {
          httpBackend.expectGET('/posts?page=3').respond({});

          links.next[0].follow();
          httpBackend.flush();
      });
    });
  });

  describe('parsing multiple links with the same rel', function() {
    var links;
    beforeEach(function() {
      links = hrLinkHeaderExtension.linkParser({}, function(header) {
        return header === 'Link' ? '</posts?page=1>; rel="section"; title="Page 1", </posts?page=2>; rel="section"; title="Page 2"' : null;
      }, hrResource);
    });

    it('has the first link', function() {
      expect(links.section[0].href).toBe('/posts?page=1');
      expect(links.section[0].title).toBe('Page 1');
    });

    it('has the second link', function() {
      expect(links.section[1].href).toBe('/posts?page=2');
      expect(links.section[1].title).toBe('Page 2');
    });
  });

  describe('embedded parser', function() {
    it('should return an empty array', function() {
      var embedded = hrLinkHeaderExtension.embeddedParser({}, {});
      expect(embedded).toEqual([]);
    });
  });

  describe('data parser', function() {
    it('should return an empty object', function() {
      var data = hrLinkHeaderExtension.dataParser({ name: 'John Doe' }, {});
      expect(data).toEqual({});
    });
  });
});
