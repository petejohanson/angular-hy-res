'use strict';

/*jshint expr: true*/

describe('angular-hy-res: hrLinkHeaderExtension', function () {
  var hrLinkHeaderExtension;

  // load the controller's module
  beforeEach(angular.mock.module('angular-hy-res'));
  beforeEach(angular.mock.module('angular-hy-res-link-header'));

  beforeEach(angular.mock.inject(function(_hrLinkHeaderExtension_, hrHttp) {
    hrLinkHeaderExtension = _hrLinkHeaderExtension_;
    hrLinkHeaderExtension.initialize(hrHttp, [hrLinkHeaderExtension]);
  }));

  describe('extension applicability', function() {
    it('should apply when Link header(s) found', function() {
      hrLinkHeaderExtension.applies({}, { 'link': '</posts?page=2>; rel=next' }).should.be.true;
    });
  });
});
