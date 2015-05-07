'use strict';

var Siren = require('hy-res').SirenExtension;

angular.module('hrSiren', ['hrCore'])
  .provider('hrSirenExtension', function() {
    this.mediaTypes = [];
    this.$get = function() {
      return new Siren(this.mediaTypes);
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrSirenExtension');
  }]);
