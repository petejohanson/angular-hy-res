/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.9 - 2014-12-12
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

angular.module('angular-hy-res-hal', ['angular-hy-res'])
  .provider('hrHalExtension', function() {
    this.mediaTypes = ['application/hal+json'];
    this.$get = ['hrWebLinkFactory', 'hrLinkCollection', function(hrWebLinkFactory, hrLinkCollection) {
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
    }];
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrHalExtension');
  }]);


'use strict';

angular.module('angular-hy-res-json', ['angular-hy-res'])
  .service('hrJsonExtension', function() {
    this.applies = function(data, headers) {
      return headers('Content-Type') === 'application/json';
    };

    this.dataParser = function(data) {
      return data;
    };

    this.linkParser = function(data, headers, Resource) {
      return {};
    };

    this.embeddedParser = function(data, headers) {
      return [];
    };
  })
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrJsonExtension');
  }]);


'use strict';

angular.module('angular-hy-res-siren', ['angular-hy-res'])
  .provider('hrSirenExtension', function() {
    this.mediaTypes = ['application/vnd.siren+json'];
    this.$get = ['hrWebLinkFactory', 'hrLinkCollection', function(hrWebLinkFactory, hrLinkCollection) {
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
    }];
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
  .factory('URITemplate', ['$window', function($window) {
    return $window.URITemplate;
  }])
  .constant('hrWebLink', WebLink)
  .factory('hrLinkCollection', ['$q', function($q) {
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
  }])
  .factory('hrWebLinkFactory', ['hrWebLink', '$http', 'URITemplate', function(hrWebLink, $http, URITemplate) {
    return function(data, resource) {
      return new hrWebLink(data, $http, resource, URITemplate);
    };
  }])
  .provider('hrResource', function() {
    this.extensions = [];
    this.$get = ['$http', '$q', 'URITemplate', 'hrLinkCollection', '$injector', function($http, $q, URITemplate, hrLinkCollection, $injector) {
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
          if (this.$resolved) {
            var res = this.$sub(rel);
            if (res !== null) {
              return res;
            }

            var l = this.$link(rel);
            if (l === null) {
              return null; // TODO: Return a resource w/ an error?s
            }

            return l.follow(options);
          }

          var ret = new Resource();
          ret.$promise =
              this.$promise.then(function(r) {
                return r.$followOne(rel, options).$promise;
              }).then(function(r) {
                var promise = ret.$promise;
                angular.copy(r, ret);
                ret.$promise = promise;
                return ret;
              });

          return ret;
        };

        this.$followAll = function(rel, options) {
          if (this.$resolved) {
            var subs = this.$subs(rel);
            if (subs.length > 0) {
              return subs;
            }

            return hrLinkCollection.fromArray(this.$links(rel)).follow(options);
          }

          var ret = [];
          ret.$resolved = false;
          var d = $q.defer();
          ret.$promise = d.promise;
          ret.$error = null;

          this.$promise.then(function(r) {
            var resources = r.$followAll(rel);
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

      Resource.prototype.$has = function(rel) {
        return this.$links(rel).length > 0 || this.$subs(rel).length > 0;
      };

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
    }];
  }).factory('hrRoot', ['hrWebLink', 'hrResource', '$http', function(hrWebLink, hrResource, $http) {
    return function(url, options) {
      this.follow = function() {
        return new hrWebLink({ href: url }, $http, hrResource).follow(options);
      };
    };
  }]);

var hrLinkHeader =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var httpLink = __webpack_require__(1);

	angular.module('angular-hy-res-link-header', ['angular-hy-res'])
	  .service('hrLinkHeaderExtension', function(hrWebLinkFactory) {
	    this.applies = function(data, headers) {
	      return headers('Link') !== null;
	    };

	    this.dataParser = function(data) {
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



/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function() {

	const HT = '\t';
	const SP = ' ';
	const CR = '\r';
	const NF = '\n';

	const SPACES = [SP, HT, CR, NF];

	const SEPARATORS = [
	    '(', ')', '<', '>', '@', 
	    ',', ';', ':', '\\', '"',
	    '/', '[', ']', '?', '=',
	    '{', '}', SP, HT
	];

	function skipSpaces(value, pos) {
	    while (pos < value.length && SPACES.indexOf(value.charAt(pos)) >= 0) pos++;

	    return pos;
	}

	function readToken(value, pos) {
	    var start = pos;
	    while (pos < value.length && SEPARATORS.indexOf(value.charAt(pos)) == -1) {
	        pos++;
	    }
	    
	    return value.substring(start, pos);
	}

	function readQuotedString(value, pos) {
	    var ch;
	    var start = pos;
	    
	    pos++;
	    while (pos < value.length) {
	        ch = value.charAt(pos);
	        if (ch === '"') break;
	        if (ch === '\\') pos++;
	        pos++;
	    }
	    
	    return value.substring(start, pos + 1);
	}

	function decodeQuotedString(value) { 
	    value = value.substr(1, value.length - 2);
	    var start = 0, p;
	    var result = '';
	    
	    while((p = value.indexOf('\\', start)) != -1) {
	        result += value.substring(start, p);
	        start = p + 2;
	    }
	    
	    result += value.substring(start);
	    
	    return result;
	}

	function readLinkParam(value, pos, link) {
	    var pname = readToken(value, pos);
	    pos = skipSpaces(value, pos + pname.length);
	    if (value.charAt(pos) !== '=')
	        throw new Error('Unexpected token: ' + pos);

	    pos++;
	    
	    var isQuotedString = value.charAt(pos) === '"';
	    var pvalue;
	    if (isQuotedString) {
	        pvalue = readQuotedString(value, pos);
	        pos += pvalue.length;
	        pvalue = decodeQuotedString(pvalue);
	        
	    } else {
	        pvalue = readToken(value, pos);
	        pos += pvalue.length;
	        
	        if (pname == 'type') {
	            if (value.charAt(pos) !== '/')
	                throw new Error('Unexpected token: ' + pos);
	            pos++;
	            var subtype = readToken(value, pos);
	            pos += subtype.length;
	            pvalue += '/' + subtype;
	        }
	    }
	    link[pname] = pvalue;
	    
	    return pos;
	}

	function readLink(value, pos, link) {
	    if (value.charAt(pos) !== '<')
	        throw new Error('Unexpected token: ' + pos);
	    
	    var p = value.indexOf('>', pos);
	    if (p === -1) throw new Error('Unexpected token: ' + pos);

	    link.href = value.substring(pos + 1, p);
	    pos = skipSpaces(value, p + 1);
	    
	    while(pos < value.length && value.charAt(pos) === ';') {
	        pos = skipSpaces(value, pos + 1);
	        pos = readLinkParam(value, pos, link);
	        pos = skipSpaces(value, pos);
	    }
	    
	    return pos;
	}

	var httpLink = {};

	/**
	 * Parse the given string.
	 * @param {String} value string as defined in http://www.w3.org/wiki/LinkHeader
	 * @return {Array} array of link objects
	 * @example '<http://example.com/TheBook/chapter2>; rel="previous"' -> [{href: 'http://example.com/TheBook/chapter2', rel: 'previous'}]
	 */
	httpLink.parse = function(value) {
	    var pos = 0;
	    
	    var links = [];
	    var link;
	    
	    while (pos < value.length && (pos === 0 || value.charAt(pos) === ',' && pos++)) {
	        link = {};
	        pos = skipSpaces(value, pos);
	        pos = readLink(value, pos, link);
	        links.push(link);
	        pos = skipSpaces(value, pos);
	    }
	    
	    if (pos < value.length)
	        throw new Error('Unexpected token: ' + pos);
	    
	    return links;
	};

	httpLink.stringify = function(array) {
	    return array.map(function(obj) {
	        var href = obj.href;
	        var attr = Object.keys(obj).filter(function(key) {
	            return key !== 'href';
	        }).map(function(key) {
	            return key + '=' + JSON.stringify(obj[key]);
	        });

	        return ['<' + obj.href + '>'].concat(attr).join('; ');
	    }).join(', ');
	}

	if (true) { // RequireJS AMD
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return httpLink;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    
	} else if (typeof module === 'object' && module.exports) { // NodeJS, CommonJS
	    module.exports = httpLink;

	} else { // browser <script>
	    this.httpLink = httpLink;
	}

	})();


/***/ }
/******/ ])