/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.9 - 2015-03-05
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
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