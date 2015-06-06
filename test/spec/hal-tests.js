'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var HyRes = require('hy-res');
var hrHal = require('../../hal');

describe('angular-hy-res: hrHalExtension', function () {
  describe('the extension', function() {
    var hrHalExtension;

    // load the controller's module
    beforeEach(angular.mock.module(hrHal));

    beforeEach(angular.mock.inject(function(_hrHalExtension_) {
      hrHalExtension = _hrHalExtension_;
    }));

    xit('should be an instance of the HyRes HAL extension', function() {
      hrHalExtension.should.be.an.instanceof(HyRes.HalExtension);
    });

    describe('extension applicability', function() {
      it('should apply to application/hal+json content type', function() {
        hrHalExtension.applies({}, { 'content-type': 'application/hal+json' }).should.be.true;
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module(hrHal, function(hrHalExtensionProvider) {
        hrHalExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrHalExtension) {
        hrHalExtension.applies({}, { 'content-type': 'application/vnd.myco.blog' }).should.be.true;
      });
    });
  });
});
