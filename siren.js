'use strict';

var angular = require('angular');
var Siren = require('hy-res').SirenExtension;

angular.module('hrSiren', [require('./core')])
  .provider('hrSirenExtension', function() {
    this.mediaTypes = [];
    this.$get = function() {
      return new Siren(this.mediaTypes);
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrSirenExtension');
  }]);

module.exports='hrSiren';
