'use strict';

var angular = require('angular');
var Json = require('hy-res').JsonExtension;
var hrCore = require('./core');

angular.module('hrJson', [hrCore])
  .service('hrJsonExtension', function() {
    return new Json();
  }).config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrJsonExtension');
  }]);

module.exports='hrJson';
