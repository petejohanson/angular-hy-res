'use strict';

var httpLink = require('http-link');

angular.module('angular-hy-res-link-header', ['angular-hy-res'])
  .service('hrLinkHeaderExtension', function() {
    this.applies = function(data, headers) {
      return headers('Link') !== null;
//      return !angular.isNull(headers('Link'));
    };

    this.linkParser = function(data, headers) {
      var links = httpLink.parse(headers('Link'));

      var ret = {};
      for(var i = 0; i < links.length; i++) {
        var l = links[i];
        ret[l.rel] = l;
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

