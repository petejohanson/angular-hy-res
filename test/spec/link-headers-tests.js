'use strict';

/*jshint expr: true*/

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var chaiResources = require('chai-hy-res');

chai.should();
chai.use(chaiResources);
chai.use(chaiAsPromised);

var hrLinkHeader = require('../../link-header');

describe('angular-hy-res: hrLinkHeaderExtension', function () {
  var hrLinkHeaderExtension;

  // load the controller's module
  //beforeEach(angular.mock.module(hrCore));
  beforeEach(angular.mock.module(hrLinkHeader));

  beforeEach(angular.mock.inject(function(_hrLinkHeaderExtension_, hrHttp) {
    hrLinkHeaderExtension = _hrLinkHeaderExtension_;
  }));

  describe('extension applicability', function() {
    it('should apply when Link header(s) found', function() {
      hrLinkHeaderExtension.applies({}, { 'link': '</posts?page=2>; rel=next' }).should.be.true;
    });
  });
});
