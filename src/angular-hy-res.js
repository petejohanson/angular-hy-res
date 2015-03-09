'use strict';

var HyRes = require('hy-res');

angular.module('angular-hy-res', [])
  .factory('hrHttp', function($http) {
    return function(options) {
      return $http(options).then(function(resp) {
        resp.headers = resp.headers();
        return resp;
      });
    };
  })
  .provider('hrRoot', function() {
    this.extensions = [];
    this.$get = function(hrHttp, $injector) {
      var exts = [];
      angular.forEach(this.extensions, function(val) {
        exts.push($injector.get(val));
      });

      return function(url, options) {
        return {
          follow: function() {
            return new HyRes.Root(url, hrHttp, exts).follow(options);
          }
        };
      };
    };
  });
