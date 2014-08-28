'use strict';

angular.module('angular-hy-res-hal', ['angular-hy-res'])
  .service('hrHalExtension', function() {
    this.applies = function(data, headers) {
      return headers('Content-Type') === 'application/hal+json';
    };
    this.linkParser = function(data, headers) {
      return data._links;
    };

    this.embeddedParser = function(data, headers) {
      return data._embedded;
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrHalExtension');
  }]);

