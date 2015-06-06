'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var hrCore = require('../../core');
var hrJson = require('../../json');

describe('angular-hy-res: hrJsonExtension', function () {
  var hrJsonExtension;

  // load the controller's module
  beforeEach(angular.mock.module(hrCore));
  beforeEach(angular.mock.module(hrJson));

  beforeEach(angular.mock.inject(function(_hrJsonExtension_) {
    hrJsonExtension = _hrJsonExtension_;
  }));

  describe('extension applicability', function() {
    it('should apply when application/json content type', function() {
      hrJsonExtension.applies({}, { 'content-type': 'application/json' }).should.be.true;
    });
  });

  describe('data parser', function() {
    it('should return the data', function() {
      var data = hrJsonExtension.dataParser({ name: 'John Doe' }, {});
      data.should.eql([{ name: 'name', value: 'John Doe' }]);
    });
  });
});
