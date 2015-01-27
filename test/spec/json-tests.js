'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.should();
chai.use(chaiAsPromised);

describe('angular-hy-res: hrJsonExtension', function () {
  var hrJsonExtension;

  // load the controller's module
  beforeEach(angular.mock.module('angular-hy-res'));
  beforeEach(angular.mock.module('angular-hy-res-json'));

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
      data.should.eql({ name: 'John Doe' });
    });
  });
});
