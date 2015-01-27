'use strict';

var Json = require('hy-res').JsonExtension;

angular.module('angular-hy-res-json', ['angular-hy-res'])
  .service('hrJsonExtension', function() {
    return new Json();
  }).config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrJsonExtension');
  }]);

