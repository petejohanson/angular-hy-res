'use strict';

var angular = require('angular');
var Hal = require('hy-res').CollectionJsonExtension;

angular.module('hrCollectionJson', [require('./core')])
  .provider('hrCollectionJsonExtension', function() {
    this.mediaTypes = [];
    this.$get = function() {
      return new Hal(this.mediaTypes);
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrCollectionJsonExtension');
  }]);

module.exports='hrCollectionJson';
