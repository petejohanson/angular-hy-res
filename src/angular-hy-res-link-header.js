'use strict';

var LinkHeader = require('hy-res').LinkHeaderExtension;

angular.module('angular-hy-res-link-header', ['angular-hy-res'])
  .service('hrLinkHeaderExtension', function() {
    return new LinkHeader();
  })
  .config(['hrRootProvider', function(hrRootProvider) {
    hrRootProvider.extensions.push('hrLinkHeaderExtension');
  }]);

