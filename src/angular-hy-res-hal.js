'use strict';

angular.module('angular-hy-res-hal', ['angular-hy-res'])
  .provider('hrHalExtension', function() {
    this.mediaTypes = ['application/hal+json'];
    this.$get = function(hrWebLinkFactory, hrLinkCollection) {
      var mediaTypeSet = {};
      for (var i = 0; i < this.mediaTypes.length; i++) {
        mediaTypeSet[this.mediaTypes[i]] = true;
      }

      var HalExtension = function() {
        this.applies = function(data, headers) {
          return mediaTypeSet[headers('Content-Type')] !==  undefined;
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
      };

      return new HalExtension();
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrHalExtension');
  }]);

