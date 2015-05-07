'use strict';

var Json = require('hy-res').JsonExtension;

angular.module('hrJson', ['hrCore'])
  .service('hrJsonExtension', function() {
    return new Json();
  }).config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrJsonExtension');
  }]);

