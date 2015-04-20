/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.15 - 2015-04-20
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var LinkHeader = require("hy-res").LinkHeaderExtension;

angular.module("angular-hy-res-link-header", ["angular-hy-res"]).service("hrLinkHeaderExtension", function () {
  return new LinkHeader();
}).config(["hrRootProvider", function (hrRootProvider) {
  hrRootProvider.extensions.push("hrLinkHeaderExtension");
}]);