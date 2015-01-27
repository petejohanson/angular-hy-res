'use strict';

var Siren = require('hy-res').SirenExtension;

angular.module('angular-hy-res-siren', ['angular-hy-res'])
  .provider('hrSirenExtension', function() {
    this.mediaTypes = [];
    this.$get = function() {
      return new Siren(this.mediaTypes);
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrSirenExtension');
  }]);
