'use strict';

var angular = require('angular');
var Text = require('hy-res').TextExtension;

angular.module('hrText', [require('./core')])
  .provider('hrTextExtension', function() {
    this.subTypes = [];
    this.wildcard = false;
    this.$get = function() {
      return new Text({ wildcard: this.wildcard, subTypes: this.subTypes });
    };
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrTextExtension');
  }]);

module.exports='hrText';
