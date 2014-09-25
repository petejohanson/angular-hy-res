'use strict';

var httpLink = require('http-link');

angular.module('angular-hy-res-link-header', ['angular-hy-res'])
  .service('hrLinkHeaderExtension', function(hrWebLinkFactory) {
    this.applies = function(data, headers) {
      return headers('Link') !== null;
    };

    this.linkParser = function(data, headers, Resource) {
      var links = httpLink.parse(headers('Link'));

      var ret = {};
      for(var i = 0; i < links.length; i++) {
        var l = links[i];
        var wl = hrWebLinkFactory(l, Resource);
        if (!angular.isUndefined(ret[l.rel])) {
          var current = ret[l.rel];
          if (!angular.isArray(current)) {
            current = [current];
            ret[l.rel] = current;
          }

          current.push(wl);
        } else {
          ret[l.rel] = wl;
        }

        delete l.rel;
      }
      return ret;
    };

    this.embeddedParser = function(data, headers) {
      return [];
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrLinkHeaderExtension');
  }]);

