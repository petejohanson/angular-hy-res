/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.13 - 2015-04-20
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var HyRes = require("hy-res");

angular.module("angular-hy-res", []).factory("hrHttp", ["$http", function ($http) {
  return function (options) {
    return $http(options).then(function (resp) {
      resp.headers = resp.headers();
      return resp;
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