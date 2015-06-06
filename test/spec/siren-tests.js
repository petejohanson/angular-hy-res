'use strict';

/*jshint expr: true*/

require('es6-promise').polyfill();

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var HyRes = require('hy-res');
var hrSiren = require('../../siren');

describe('angular-hy-res: hrSirenExtension', function () {
  describe('the extension', function() {
    var hrSirenExtension;

    // load the controller's module
    beforeEach(angular.mock.module(hrSiren));

    beforeEach(angular.mock.inject(function(_hrSirenExtension_) {
      hrSirenExtension = _hrSirenExtension_;
    }));

    xit('should be an instance of the HyRes Siren extension', function() {
      hrSirenExtension.should.be.an.instanceof(HyRes.SirenExtension);
    });

    describe('extension applicability', function() {
      it('should apply to application/vnd.siren+json content type', function() {
        hrSirenExtension.applies({}, { 'content-type': 'application/vnd.siren+json' }).should.be.true;
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module(hrSiren, function(hrSirenExtensionProvider) {
        hrSirenExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrSirenExtension) {
        hrSirenExtension.applies({}, { 'content-type': 'application/vnd.myco.blog' }).should.be.true;
      });
    });
  });
});
