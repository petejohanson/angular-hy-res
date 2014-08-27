'use strict';

angular.module('angular-hyper-resource-hal', ['angular-hyper-resource'])
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

