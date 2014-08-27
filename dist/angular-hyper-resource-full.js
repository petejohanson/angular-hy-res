/**
 * angular-hyper-resource
 * @version v0.0.1 - 2014-08-26
 * @link https://github.com/petejohanson/angular-hyper-resource
 * @author Pete Johanson <latexer@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
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

        this.$follow = function(rel) {
          var link = this.$link(rel);
          if(link === null) {
            return null; // TODO: Something else to return? Resource w/ rejected promise and error?
          }
          return Resource.get(link);
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

/*
      var Resource = function(data, links, embedded, parser) {
        this.embedded = {};
        angular.extend(this, data);
        
        this.$link = function(rel) {
          if (!links.hasOwnProperty(rel)) {
            return null;
          }
          
          return links[rel];
        };

        this.$embedded = function(rel) {
          if(!this.embedded.hasOwnProperty(rel)) {
            return null;
          }

          return this.embedded[rel];
        };

        this.$follow = function(rel, options) {
          var link = this.$link(rel);
          if (link === null) {
            return $q.reject('Link relation not found');
          }
          var url = link.href;
          if (link.templated) {
            url = new URITemplate(url).expand(options.data);
          }

          return $http(angular.extend(options || {}, { url: url }))
            .then(function(resp) {
              if (resp.headers('Content-Type') === 'application/hal+json') {
                resp.data = parser.parse(resp.data);
              }
              return resp;
            });
        };

        for (var name in embedded) {
          var e = embedded[name];
          if (angular.isArray(e)) {
            var arr = [];
            for(var i = 0, len = e.length; i< len; ++i) {
              arr.push(parser.parse(e[i]));
            }
            this.embedded[name] = arr;
          } else {
            this.embedded[name] = parser.parse(e);
          }
        }
      };

      var Parser = function() {
        this.parse = function(s) {
          if (angular.isString(s)) {
            s = JSON.parse(s);
          }
  
          var links = s._links;
          var embedded = s._embedded;
  
          delete s._links;
          delete s._embedded;
  
          return new Resource(s, links, embedded, this);
        };
      };
*/

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

angular.module('angular-hyper-resource-hal', ['angular-hyper-resource'])
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

