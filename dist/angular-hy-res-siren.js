/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.13 - 2015-04-18
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var Siren = require("hy-res").SirenExtension;

angular.module("angular-hy-res-siren", ["angular-hy-res"]).provider("hrSirenExtension", function () {
  this.mediaTypes = [];
  this.$get = function () {
    return new Siren(this.mediaTypes);
  };
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrSirenExtension");
}]);