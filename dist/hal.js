/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.34 - 2016-09-14
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var angular = require("angular");
var Hal = require("hy-res").HalExtension;

angular.module("hrHal", [require("./core")]).provider("hrHalExtension", function () {
  this.mediaTypes = [];
  this.$get = function () {
    return new Hal(this.mediaTypes);
  };
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrHalExtension");
}]);

module.exports = "hrHal";