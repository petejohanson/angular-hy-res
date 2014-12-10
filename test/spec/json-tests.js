'use strict';

describe('angular-hy-res: hrJsonExtension', function () {
  var hrJsonExtension, httpBackend, hrResource;

  // load the controller's module
  beforeEach(angular.mock.module('angular-hy-res'));
  beforeEach(angular.mock.module('angular-hy-res-json'));

  beforeEach(angular.mock.inject(function(_hrJsonExtension_, $httpBackend, _hrResource_) {
    hrJsonExtension = _hrJsonExtension_;
    httpBackend = $httpBackend;
    hrResource = _hrResource_;
  }));

  describe('extension applicability', function() {
    it('should apply when application/json content type', function() {
      expect(hrJsonExtension.applies({}, function(header) {
        return header === 'Content-Type' ? 'application/json' : null;
      }, 200)).toBe(true);
    });
  });

  describe('data parser', function() {
    it('should return the data', function() {
      var data = hrJsonExtension.dataParser({ name: 'John Doe' }, {});
      expect(data).toEqual({ name: 'John Doe' });
    });
  });
});
