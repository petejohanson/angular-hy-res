'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

describe('angular-hy-res: hrHalExtension', function () {
  describe('the extension', function() {
    var hrHalExtension;

    // load the controller's module
    beforeEach(angular.mock.module('hrHal'));

    beforeEach(angular.mock.inject(function(_hrHalExtension_) {
      hrHalExtension = _hrHalExtension_;
    }));

    describe('extension applicability', function() {
      it('should apply to application/hal+json content type', function() {
        hrHalExtension.applies({}, { 'content-type': 'application/hal+json' }).should.be.true;
      });
    });
    describe('links parser', function() {
      it('should return the links', function() {
        var links = hrHalExtension.linkParser({_links: { self: { href: '/orders/123' } } }, {}, 200);
        links.self[0].href.should.eql('/orders/123');
      });
    });

    describe('data parser', function() {
      it('should return the properties without _links or _embedded', function() {
        var data = hrHalExtension.dataParser({
          _links: { self: { href: '/orders/123' } },
          name: 'John Doe'
        }, {});

        data.should.eql({ name: 'John Doe' });
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module('hrHal', function(hrHalExtensionProvider) {
        hrHalExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrHalExtension) {
        hrHalExtension.applies({}, { 'content-type': 'application/vnd.myco.blog' }).should.be.true;
      });
    });
  });
});
