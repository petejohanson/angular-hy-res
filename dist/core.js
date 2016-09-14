/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.34 - 2016-09-14
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var angular = require("angular");
var HyRes = require("hy-res");

angular.module("hrCore", []).factory("hrHttp", ["$http", function ($http) {
  var headersProcessor = function headersProcessor(resp) {
    resp.headers = resp.headers();
    return resp;
  };

  return function (options) {
    return $http(options).then(headersProcessor, function (resp) {
      throw headersProcessor(resp);
    });
  };
}]).provider("hrRoot", function () {
  this.extensions = [];
  this.$get = ["hrHttp", "$injector", function (hrHttp, $injector) {
    var exts = [];
    angular.forEach(this.extensions, function (val) {
      exts.push($injector.get(val));
    });

    return function (url) {
      return new HyRes.Root(url, hrHttp, exts);
    };
  }];
});

module.exports = "hrCore";