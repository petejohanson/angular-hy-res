/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.34 - 2016-09-14
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var angular = require("angular");
var Text = require("hy-res").TextExtension;

angular.module("hrText", [require("./core")]).provider("hrTextExtension", function () {
  this.subTypes = [];
  this.wildcard = false;
  this.$get = function () {
    return new Text({ wildcard: this.wildcard, subTypes: this.subTypes });
  };
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrTextExtension");
}]);

module.exports = "hrText";