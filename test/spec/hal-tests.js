'use strict';

describe('angular-hy-res: hrHalExtension', function () {
  describe('the extension', function() {
    var hrHalExtension;

    // load the controller's module
    beforeEach(angular.mock.module('angular-hy-res-hal'));

    beforeEach(angular.mock.inject(function(_hrHalExtension_) {
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
        expect(links.self.href).toEqual('/orders/123');
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module('angular-hy-res-hal', function(hrHalExtensionProvider) {
        hrHalExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrHalExtension) {
        expect(hrHalExtension.applies({}, function(header) {
          return header === 'Content-Type' ? 'application/vnd.myco.blog' : null;
        })).toBeTruthy();
      });
    });
  });
});
