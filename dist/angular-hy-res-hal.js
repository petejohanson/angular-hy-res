/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.5 - 2014-09-24
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

angular.module('angular-hy-res-hal', ['angular-hy-res'])
  .service('hrHalExtension', ['hrWebLinkFactory', 'hrLinkCollection', function(hrWebLinkFactory, hrLinkCollection) {
    this.applies = function(data, headers) {
      return headers('Content-Type') === 'application/hal+json';
    };
    this.linkParser = function(data, headers, Resource) {
      if (!angular.isObject(data._links)) {
        return null;
      }

      var ret = {};
      angular.forEach(data._links, function(val, key) {
        if (angular.isArray(val)) {
          var linkArray = [];
          angular.forEach(val, function(l) {
            linkArray.push(hrWebLinkFactory(l, Resource));
          });
          ret[key] = hrLinkCollection.fromArray(linkArray);
        } else {
          ret[key] = hrWebLinkFactory(val, Resource);
        }
      });
      return ret;
    };

    this.embeddedParser = function(data, headers) {
      return data._embedded;
    };
  }])
  .config(['hrResourceProvider', function(hrResourceProvider) {
    hrResourceProvider.extensions.push('hrHalExtension');
  }]);

