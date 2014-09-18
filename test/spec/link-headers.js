'use strict';

describe('angular-hy-res: hrLinkHeaderExtension', function () {
  var hrLinkHeaderExtension;

  // load the controller's module
  beforeEach(module('angular-hy-res-link-header'));

  beforeEach(inject(function(_hrLinkHeaderExtension_) {
    hrLinkHeaderExtension = _hrLinkHeaderExtension_;
  }));

  describe('extension applicability', function() {
    it('should apply to application/hal+json content type', function() {
      expect(hrLinkHeaderExtension.applies({}, function(header) {
        return header === 'Link' ? '</posts?page=2>; rel=next' : null;
      }, 200)).toBe(true);
    });
  });
  describe('links parser', function() {
    it('should return the links', function() {
      var links = hrLinkHeaderExtension.linkParser({}, function(header) {
        return header === 'Link' ? '</posts?page=3>; rel=next, </posts?page=1>; rel="prev"' : null;
      }, 200);
      expect(links).toEqual({
        next: { href: '/posts?page=3' },
        prev: { href: '/posts?page=1' }
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
