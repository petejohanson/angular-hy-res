/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.27 - 2015-07-23
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var angular = require("angular");
var Siren = require("hy-res").SirenExtension;

angular.module("hrSiren", [require("./core")]).provider("hrSirenExtension", function () {
  this.mediaTypes = [];
  this.$get = function () {
    return new Siren(this.mediaTypes);
  };
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrSirenExtension");
}]);

module.exports = "hrSiren";