'use strict';

var angular = require('angular');
var LinkHeader = require('hy-res').LinkHeaderExtension;

angular.module('hrLinkHeader', [require('./core')])
  .service('hrLinkHeaderExtension', function() {
    return new LinkHeader();
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrLinkHeaderExtension');
  }]);

module.exports='hrLinkHeader';
