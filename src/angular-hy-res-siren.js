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

          var ret = {};

          if (angular.isObject(data.links)) {
            angular.forEach(data.links, function (val) {
              var link = hrWebLinkFactory(val);
              for (var li = 0; li < val.rel.length; li++) {
                ret[val.rel[li]] = link;
              }
            });
          }

          if (angular.isObject(data.entities)) {
            angular.forEach(data.entities, function(val) {
              if (!val.href) {
                return;
              }

              var link = hrWebLinkFactory(val);
              for (var li = 0; li < val.rel.length; li++) {
                ret[val.rel[li]] = link;
              }
            });
          }
          return ret;
        };

        this.embeddedParser = function(data, headers) {
          var ret = {};
          if (!angular.isArray(data.entities)) {
            return ret;
          }

          angular.forEach(data.entities, function(val) {
            if (val.href) {
              return;
            }

            for (var li = 0; li < val.rel.length; li++) {
              ret[val.rel[li]] = val;
            }
          });
          return ret;
        };
      };

      return new SirenExtension();
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrSirenExtension');
  }]);

