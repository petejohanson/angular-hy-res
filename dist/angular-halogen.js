'use strict';
angular.module('angular-halogen', []).factory('URITemplate', [
  '$window',
  function ($window) {
    return $window.URITemplate;
  }
]).provider('ahParser', function () {
  this.$get = [
    '$http',
    '$q',
    'URITemplate',
    function ($http, $q, URITemplate) {
      var Resource = function (data, links, embedded, parser) {
        this.embedded = {};
        angular.extend(this, data);
        this.$link = function (rel) {
          if (!links.hasOwnProperty(rel)) {
            return null;
          }
          return links[rel];
        };
        this.$embedded = function (rel) {
          if (!this.embedded.hasOwnProperty(rel)) {
            return null;
          }
          return this.embedded[rel];
        };
        this.$follow = function (rel, options) {
          var link = this.$link(rel);
          if (link === null) {
            return $q.reject('Link relation not found');
          }
          var url = link.href;
          if (link.templated) {
            url = new URITemplate(url).expand(options.data);
          }
          return $http(angular.extend(options || {}, { url: url }));
        };
        for (var name in embedded) {
          var e = embedded[name];
          if (angular.isArray(e)) {
            var arr = [];
            for (var i = 0, len = e.length; i < len; ++i) {
              arr.push(parser.parse(e[i]));
            }
            this.embedded[name] = arr;
          } else {
            this.embedded[name] = parser.parse(e);
          }
        }
      };
      var Parser = function () {
        this.parse = function (s) {
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
      return new Parser();
    }
  ];
});