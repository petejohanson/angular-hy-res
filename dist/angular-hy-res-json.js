/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.12 - 2015-03-26
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var Json = require("hy-res").JsonExtension;

angular.module("angular-hy-res-json", ["angular-hy-res"]).service("hrJsonExtension", function () {
  return new Json();
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrJsonExtension");
}]);