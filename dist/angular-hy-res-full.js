/**
 * angular-hy-res
 * @version v0.0.4 - 2014-09-13
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <latexer@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

angular.module('angular-hy-res', [])
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
              if (angular.isArray(raw)) {
                var embeds = raw.map(function(e) { return Resource.embedded(e, headers); });

                embeds.$promise = $q.when(embeds);
                embeds.$resolved = true;
                this.$$embedded[rel] = embeds;
              } else {
                this.$$embedded[rel] = Resource.embedded(raw, headers);
              }
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

        this.$followLink = function(link, options) {
          if(link === null) {
            return null; // TODO: Something else to return? Resource w/ rejected promise and error?
          }

          if (angular.isArray(link)) {
            var res = link.map(function(l) { return Resource.get(l, options); });
            res.$promise = $q.all(res.map(function(r) { return r.$promise; }));
            res.$resolved = false;
            res.$promise.then(function(r) { res.$resolved = true; });

            return res;
          }

          return Resource.get(link, options);
        };

        this.$follow = function(rel, options) {
          // TODO: Make follow for embedded work when
          // called on unresolved resources.
          var res = this.$embedded(rel);

          if (res !== null) {
            return res;
          }

          if (this.$resolved) {
            return this.$followLink(this.$link(rel), options);
          }

          // This resource may not be resolved yet,
          // so we follow a *future* link by chaining our
          // own promise.
          return this.$followLink(this.$promise.then(function(r) {
            return r.$link(rel);
          }), options);
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

        res.$promise =
          $q.when(link)
          .then(function(l) {
            var url = l.href;
    
            if (l.templated) {
              url = new URITemplate(url).expand(options.data);
            }

            var httpConfig = angular.extend(options || {}, { url: url });
            return $http(httpConfig);
          })
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

'use strict';

angular.module('angular-hy-res-hal', ['angular-hy-res'])
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

