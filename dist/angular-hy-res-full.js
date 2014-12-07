/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.6 - 2014-12-06
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
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

        this.dataParser = function(data, headers) {
          var ret = {};
          angular.copy(data, ret);
          delete ret._links;
          delete ret._embedded;
          return ret;
        };

        this.linkParser = function(data, headers, Resource) {
          if (!angular.isObject(data._links)) {
            return null;
          }

          var ret = {};
          angular.forEach(data._links, function(val, key) {
            if (!angular.isArray(val)) {
              val = [val];
            }

            var linkArray = [];
            angular.forEach(val, function(l) {
              linkArray.push(hrWebLinkFactory(l, Resource));
            });

            ret[key] = hrLinkCollection.fromArray(linkArray);
          });
          return ret;
        };

        this.embeddedParser = function(data, headers) {
          var ret = {};
          angular.forEach(data._embedded || {}, function(val, key) {
            if (!angular.isArray(val)) {
              val = [val];
            }

            ret[key] = val;
          });

          return ret;
        };
      };

      return new HalExtension();
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrHalExtension');
  }]);


'use strict';

var httpLink = require('http-link');

angular.module('angular-hy-res-link-header', ['angular-hy-res'])
  .service('hrLinkHeaderExtension', function(hrWebLinkFactory) {
    this.applies = function(data, headers) {
      return headers('Link') !== null;
    };

    this.dataParser = function() {
      return {};
    };

    this.linkParser = function(data, headers, Resource) {
      var links = httpLink.parse(headers('Link'));

      var ret = {};
      for(var i = 0; i < links.length; i++) {
        var l = links[i];
        var wl = hrWebLinkFactory(l, Resource);
        if (!angular.isUndefined(ret[l.rel])) {
          ret[l.rel].push(wl);
        } else {
          ret[l.rel] = [wl];
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
              var link = hrWebLinkFactory(val, Resource);
              for (var li = 0; li < val.rel.length; li++) {
                var r = val.rel[li];
                if (ret.hasOwnProperty(r)) {
                  ret[r].push(link);
                } else {
                  ret[r] = [link];
                }
              }
            });
          }

          if (angular.isObject(data.entities)) {
            angular.forEach(data.entities, function(val) {
              if (!val.href) {
                return;
              }

              var link = hrWebLinkFactory(val, Resource);
              for (var li = 0; li < val.rel.length; li++) {
                //ret[val.rel[li]] = link;
                var r = val.rel[li];
                if (ret.hasOwnProperty(r)) {
                  ret[r].push(link);
                } else {
                  ret[r] = [link];
                }
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
              var r = val.rel[li];
              if (!ret.hasOwnProperty(r)) {
                ret[r] = [];
              }
              ret[r].unshift(val);
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


'use strict';

var WebLink = function(data, $http, Resource, URITemplate) {
  angular.extend(this, data);
  this.$$http = $http;
  this.$$Resource = Resource;
  this.$$URITemplate = URITemplate;
};

WebLink.prototype.follow = function(options) {
  var url = this.href;

  if (this.templated) {
    url = new this.$$URITemplate(url).expand(options.data);
  }

  options = (options || {});
  options.headers = (options.headers || {});

  if(this.type && !options.headers.Accept) {
    options.headers.Accept = this.type;
  }

  var httpConfig = angular.extend(options || {}, { url: url });
  return this.$$Resource.fromRequest(this.$$http(httpConfig));
};



angular.module('angular-hy-res', [])
  .factory('URITemplate', function($window) {
    return $window.URITemplate;
  })
  .constant('hrWebLink', WebLink)
  .factory('hrLinkCollection', function($q) {
    function LinkCollection() {
      var coll = Object.create(Array.prototype);
      coll = (Array.apply(coll, arguments) || coll);

      LinkCollection.injectClassMethods(coll);
      return (coll);
    }

    LinkCollection.injectClassMethods = function(c) {
      for (var method in LinkCollection.prototype) {
        if (LinkCollection.prototype.hasOwnProperty(method)) {
          c[method] = LinkCollection.prototype[method];
        }
      }

      return c;
    };

    LinkCollection.fromArray = function(links) {
      return LinkCollection.apply(null, links);
    };

    LinkCollection.prototype = {
      follow:  function(options) {
        var res = this.map(function(l) {
          return l.follow(options);
        });
        res.$promise = $q.all(res.map(function(r) { return r.$promise; }));
        res.$resolved = false;
        res.$promise.then(function(r) {
          res.$resolved = true;
        }, function(err) {
          res.$resolved = true;
          res.$error = err;
        });

        return res;
      }
    };

    return (LinkCollection);
  })
  .factory('hrWebLinkFactory', function(hrWebLink, $http, URITemplate) {
    return function(data, resource) {
      return new hrWebLink(data, $http, resource, URITemplate);
    };
  })
  .provider('hrResource', function() {
    this.extensions = [];
    this.$get = function($http, $q, URITemplate, hrLinkCollection, $injector) {
      var exts = [];
      angular.forEach(this.extensions, function(e) {
        exts.push($injector.get(e));
      });

      var Resource = function() {
        this.$resolved = false;
        this.$error = null;
        this.$$links = {};
        this.$$embedded = {};

        this.$link = function(rel) {
          var ret = this.$links(rel);
          if (ret.length === 0) {
            return null;
          }
          if (ret.length > 1) {
            throw 'Multiple links present';
          }

          return ret[0];
        };

        this.$links = function(rel) {
          if (!this.$$links.hasOwnProperty(rel)) {
            return [];
          }

          return this.$$links[rel];
        };

        this.$followOne = function(rel, options) {
          // TODO: Make follow for embedded work when
          // called on unresolved resources.
          var res = this.$sub(rel);

          if (res !== null) {
            return res;
          }

          if (this.$resolved) {
            var l = this.$link(rel);
            if (l === null) {
              return null; // TODO: Return a resource w/ an error?s
            }

            return l.follow(options);
          }

          // This resource may not be resolved yet,
          // so we follow a *future* link by chaining our
          // own promise.
          var ret = new Resource();
          ret.$promise =
              this.$promise.then(function(r) {
                return r.$link(rel);
              })
              .then(function(l) {
                return l.follow(options).$promise;
              }).then(function(r) {
                var promise = ret.$promise;
                angular.copy(r, ret);
                ret.$promise = promise;
                return ret;
              });

          return ret;
        };

        this.$followAll = function(rel, options) {
          var subs = this.$subs(rel);
          if (subs.length > 0) {
            return subs;
          }

          if (this.$resolved) {
            return hrLinkCollection.fromArray(this.$links(rel)).follow(options);
          }

          // TODO: Handle future embedded resources too.

          var ret = [];
          ret.$resolved = false;
          var d = $q.defer();
          ret.$promise = d.promise;
          ret.$error = null;
          var coll = new hrLinkCollection();
          this.$promise.then(function(r) {
            Array.prototype.push.apply(coll, r.$links(rel));
            var resources = coll.follow(options);
            Array.prototype.push.apply(ret, resources);
            return resources.$promise;
          }).then(function(r) {
            d.resolve(ret);
            ret.$resolved = true;
          }, function(err) {
            d.reject(err);
            ret.$resolved = true;
            ret.$error = err;
          });

          return ret;
        };
      };

      Resource.prototype.$subs = function(rel) {
        if (!this.$$embedded.hasOwnProperty(rel)) {
          return [];
        }

        return this.$$embedded[rel];
      };


      Resource.prototype.$sub = function(rel) {
        var ret = this.$subs(rel);
        if (ret.length === 0) {
          return null;
        }
        if (ret.length > 1) {
          throw 'Multiple sub-resources present';
        }

        return ret[0];
      };

      Resource.prototype.$embedded = Resource.prototype.$sub;
      Resource.prototype.$embeddeds = Resource.prototype.$subs;

      Resource.prototype.$$resolve = function(data, headers) {
        angular.forEach(exts, function(e) {
          if (!e.applies(data, headers)) {
            return;
          }

          angular.extend(this, e.dataParser(data, headers));

          angular.extend(this.$$links, e.linkParser(data, headers, Resource));
          angular.forEach(e.embeddedParser(data, headers, Resource), function(raw, rel) {
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

      Resource.embedded = function(raw, headers) {
        var ret = new Resource();
        ret.$$resolve(raw, headers);
        var deferred = $q.defer();
        ret.$promise = deferred.promise;
        deferred.resolve(ret);
        return ret;
      };

      Resource.fromRequest = function(request) {
        var res = new Resource();
        res.$promise =
          request.then(function(response) {
              res.$$resolve(response.data, response.headers);
              return res;
            }, function(response) {
              // TODO: What to do for failure case?
            });

        return res;
      };

      return Resource;
    };
  }).factory('hrRoot', function(hrWebLink, hrResource, $http) {
    return function(url, options) {
      this.follow = function() {
        return new hrWebLink({ href: url }, $http, hrResource).follow(options);
      };
    };
  });
