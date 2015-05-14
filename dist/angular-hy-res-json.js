/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.16 - 2015-05-13
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var angular = require("angular");
var Json = require("hy-res").JsonExtension;

angular.module("hrJson", ["hrCore"]).service("hrJsonExtension", function () {
  return new Json();
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrJsonExtension");
}]);