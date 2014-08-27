'use strict';

angular.module('angular-hyper-resource', [])
  .factory('URITemplate', ['$window', function($window) {
    return $window.URITemplate;
  }])
  .provider('hrResource', function() {
    this.extensions = [];
    this.$get = ['$http', '$q', 'URITemplate', '$injector', function($http, $q, URITemplate, $injector) {
      var exts = [];
      angular.forEach(this.extensions, function(e) {
        exts.push($injector.get(e));
      });

      var Resource = function() {
        this.$resolved = false;
        this.$error = null;
        this.$$links = {};
        this.$$embedded = {};

        this.$$resolve = function(data, headers) {
          angular.extend(this, data);
          var embedded = {};
          angular.forEach(exts, function(e) {
            if (!e.applies(data, headers)) {
              return;
            }

            angular.extend(this.$$links, e.linkParser(data, headers));
            angular.forEach(e.embeddedParser(data, headers), function(raw, rel) {
              this.$$embedded[rel] = Resource.embedded(raw, headers);
            }, this);
          }, this);

          this.$resolved = true;
        };

        this.$link = function(rel) {
          if (!this.$$links.hasOwnProperty(rel)) {
            return null;
          }

          return this.$$links[rel];
        };
        
        this.$embedded = function(rel) {
          if (!this.$$embedded.hasOwnProperty(rel)) {
            return null;
          }

          return this.$$embedded[rel];
        };

        this.$follow = function(rel, options) {
          var link = this.$link(rel);
          if(link === null) {
            return null; // TODO: Something else to return? Resource w/ rejected promise and error?
          }
          return Resource.get(link, options);
        };
      };

      Resource.embedded = function(raw, headers) {
        var ret = new Resource();
        ret.$$resolve(raw, headers);
        var deferred = $q.defer();
        ret.$promise = deferred.promise;
        deferred.resolve(ret);
        return ret;
      };

      Resource.get = function(link, options) {
        var res = new Resource();
        var url = link.href;

        if (link.templated) {
          url = new URITemplate(url).expand(options.data);
        }

        var httpConfig = angular.extend(options || {}, { url: url });

        res.$promise =
          $http(httpConfig)
          .then(function(response) {
            res.$$resolve(response.data, response.headers);
            return res;
          }, function(response) {
            // TODO: What to do for failure case?
        });

        return res;
      };

      var hrResourceFactory = function(url, options) {
        return {
          get: function() {
            return Resource.get({ href: url }, options);
          }
        };
      };

      return hrResourceFactory;
    }];
  });
