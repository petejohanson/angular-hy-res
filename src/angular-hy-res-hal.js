'use strict';

var Hal = require('hy-res').HalExtension;

angular.module('hrHal', ['hrCore'])
  .provider('hrHalExtension', function() {
    this.mediaTypes = [];
    this.$get = function() {
      return new Hal(this.mediaTypes);
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrHalExtension');
  }]);

