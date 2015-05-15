'use strict';

var angular = require('angular');
var Hal = require('hy-res').HalExtension;

angular.module('hrHal', [require('./core')])
  .provider('hrHalExtension', function() {
    this.mediaTypes = [];
    this.$get = function() {
      return new Hal(this.mediaTypes);
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrHalExtension');
  }]);

module.exports='hrHal';
