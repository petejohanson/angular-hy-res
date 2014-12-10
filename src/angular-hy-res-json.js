'use strict';

angular.module('angular-hy-res-json', ['angular-hy-res'])
  .service('hrJsonExtension', function() {
    this.applies = function(data, headers) {
      return headers('Content-Type') === 'application/json';
    };

    this.dataParser = function(data) {
      return data;
    };

    this.linkParser = function(data, headers, Resource) {
      return {};
    };

    this.embeddedParser = function(data, headers) {
      return [];
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrJsonExtension');
  }]);

