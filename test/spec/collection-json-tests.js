'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var HyRes = require('hy-res');
var hrCollectionJson = require('../../collection-json');

describe('angular-hy-res: hrCollectionJsonExtension', function () {
  describe('the extension', function() {
    var hrCollectionJsonExtension;

    // load the controller's module
    beforeEach(angular.mock.module(hrCollectionJson));

    beforeEach(angular.mock.inject(function(_hrCollectionJsonExtension_) {
      hrCollectionJsonExtension = _hrCollectionJsonExtension_;
    }));

    xit('should be an instance of the HyRes C+J extension', function() {
      hrCollectionJsonExtension.should.be.an.instanceof(HyRes.CollectionJsonExtension);
    });

    describe('extension applicability', function() {
      it('should apply to application/vnd.collection+json content type', function() {
        hrCollectionJsonExtension.applies({}, { 'content-type': 'application/vnd.collection+json' }).should.be.true;
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module(hrCollectionJson, function(hrCollectionJsonExtensionProvider) {
        hrCollectionJsonExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrCollectionJsonExtension) {
        hrCollectionJsonExtension.applies({}, { 'content-type': 'application/vnd.myco.blog' }).should.be.true;
      });
    });
  });
});
