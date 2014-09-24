'use strict';

angular.module('angular-hy-res-hal', ['angular-hy-res'])
  .service('hrHalExtension', function(hrWebLinkFactory, hrLinkCollection) {
    this.applies = function(data, headers) {
      return headers('Content-Type') === 'application/hal+json';
    };
    this.linkParser = function(data, headers, Resource) {
      if (!angular.isObject(data._links)) {
        return null;
      }

      var ret = {};
      angular.forEach(data._links, function(val, key) {
        if (angular.isArray(val)) {
          var linkArray = [];
          angular.forEach(val, function(l) {
            linkArray.push(hrWebLinkFactory(l, Resource));
          });
          ret[key] = hrLinkCollection.fromArray(linkArray);
        } else {
          ret[key] = hrWebLinkFactory(val, Resource);
        }
      });
      return ret;
    };

    this.embeddedParser = function(data, headers) {
      return data._embedded;
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrHalExtension');
  }]);

