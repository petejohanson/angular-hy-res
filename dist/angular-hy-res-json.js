/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.11 - 2015-03-09
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

angular.module("angular-hy-res-json", ["angular-hy-res"]).service("hrJsonExtension", function () {
  this.applies = function (data, headers) {
    return headers("Content-Type") === "application/json";
  };

  this.dataParser = function (data) {
    return data;
  };

  this.linkParser = function (data, headers, Resource) {
    return {};
  };

  this.embeddedParser = function (data, headers) {
    return [];
  };
}).config(["hrResourceProvider", function (hrResourceProvider) {
  hrResourceProvider.extensions.push("hrJsonExtension");
}]);