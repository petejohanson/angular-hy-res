'use strict';

angular.module('angular-hy-res-siren', ['angular-hy-res'])
  .provider('hrSirenExtension', function() {
    this.mediaTypes = ['application/vnd.siren+json'];
    this.$get = function(hrWebLinkFactory, hrLinkCollection) {
      var mediaTypeSet = {};
      for (var i = 0; i < this.mediaTypes.length; i++) {
        mediaTypeSet[this.mediaTypes[i]] = true;
      }

      var SirenExtension = function() {
        this.applies = function(data, headers) {
          return mediaTypeSet[headers('Content-Type')] !==  undefined;
        };

        this.dataParser = function(data, headers) {
          var ret = data.properties || {};
          if (data.title) {
            ret.title = data.title;
          }

          return ret;
        };

        this.linkParser = function(data, headers, Resource) {
          if (!angular.isObject(data.links)) {
            return {};
          }

          var ret = {};
          angular.forEach(data.links, function(val) {
            var link = hrWebLinkFactory(val);
            for (var li = 0; li < val.rel.length; li++) {
              ret[val.rel[li]] = link;
            }
          });
          return ret;
        };

        this.embeddedParser = function(data, headers) {
          return {};
        };
      };

      return new SirenExtension();
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrSirenExtension');
  }]);

