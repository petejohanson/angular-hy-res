'use strict';

var angular = require('angular');
var LinkHeader = require('hy-res').LinkHeaderExtension;

angular.module('hrLinkHeader', ['hrCore'])
  .service('hrLinkHeaderExtension', function() {
    return new LinkHeader();
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrLinkHeaderExtension');
  }]);

