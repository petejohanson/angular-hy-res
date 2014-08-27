'use strict';

describe('angular-hyper-resource: hrHalExtension', function () {
  var hrHalExtension;

  // load the controller's module
  beforeEach(module('angular-hyper-resource-hal'));

  beforeEach(inject(function(_hrHalExtension_) {
    hrHalExtension = _hrHalExtension_;
  }));

  describe('extension applicability', function() {
    it('should apply to application/hal+json content type', function() {
      expect(hrHalExtension.applies({}, function(header) {
        return header === 'Content-Type' ? 'application/hal+json' : null;
      }, 200)).toBe(true);
    });
  });
  describe('links parser', function() {
    it('should return the links', function() {
      var links = hrHalExtension.linkParser({_links: { self: { href: '/orders/123' } } }, {}, 200);
      expect(links.self).toEqual({ href: '/orders/123' });
    });
  });
});
