'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var HyRes = require('hy-res');
var hrText = require('../../text');

describe('angular-hy-res: hrTextExtension', function () {
  describe('the extension', function() {
    var hrTextExtension;

    // load the controller's module
    beforeEach(angular.mock.module(hrText));

    beforeEach(angular.mock.inject(function(_hrTextExtension_) {
      hrTextExtension = _hrTextExtension_;
    }));

    xit('should be an instance of the HyRes HAL extension', function() {
      hrTextExtension.should.be.an.instanceof(HyRes.TextExtension);
    });

    describe('extension applicability', function() {
      it('should apply to text/plain content type', function() {
        hrTextExtension.applies({}, { 'content-type': 'text/plain' }).should.be.true;
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media sub types', function() {
      angular.mock.module(hrText, function(hrTextExtensionProvider) {
        hrTextExtensionProvider.subTypes.push('rtf');
      });

      inject(function(hrTextExtension) {
        hrTextExtension.applies({}, { 'content-type': 'text/rtf' }).should.be.true;
      });
    });

    it('handles all text types in wildcard mode', function() {
      angular.mock.module(hrText, function(hrTextExtensionProvider) {
        hrTextExtensionProvider.wildcard = true;
      });

      inject(function(hrTextExtension) {
        hrTextExtension.applies({}, { 'content-type': 'text/rtf' }).should.be.true;
        hrTextExtension.applies({}, { 'content-type': 'text/xml' }).should.be.true;
      });
    });
  });
});
