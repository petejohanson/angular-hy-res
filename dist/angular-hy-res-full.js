/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.34 - 2016-09-14
 * @link https://github.com/petejohanson/angular-hy-res
 * @author Pete Johanson <peter@peterjohanson.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
"use strict";

var hrRoot = (function (modules) {
	var installedModules = {};
	function __webpack_require__(moduleId) {
		if (installedModules[moduleId]) {
			return installedModules[moduleId].exports;
		}var module = installedModules[moduleId] = { exports: {}, id: moduleId, loaded: false
		};
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
		module.loaded = true;
		return module.exports;
	}
	__webpack_require__.m = modules;
	__webpack_require__.c = installedModules;
	__webpack_require__.p = "";
	return __webpack_require__(0);
})([function (module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	module.exports = __webpack_require__(8);
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var Hal = __webpack_require__(10).CollectionJsonExtension;

	angular.module("hrCollectionJson", [__webpack_require__(2)]).provider("hrCollectionJsonExtension", function () {
		this.mediaTypes = [];
		this.$get = function () {
			return new Hal(this.mediaTypes);
		};
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrCollectionJsonExtension");
	}]);

	module.exports = "hrCollectionJson";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var HyRes = __webpack_require__(10);

	angular.module("hrCore", []).factory("hrHttp", ["$http", function ($http) {
		var headersProcessor = function headersProcessor(resp) {
			resp.headers = resp.headers();
			return resp;
		};

		return function (options) {
			return $http(options).then(headersProcessor, function (resp) {
				throw headersProcessor(resp);
			});
		};
	}]).provider("hrRoot", function () {
		this.extensions = [];
		this.$get = ["hrHttp", "$injector", function (hrHttp, $injector) {
			var exts = [];
			angular.forEach(this.extensions, function (val) {
				exts.push($injector.get(val));
			});

			return function (url) {
				return new HyRes.Root(url, hrHttp, exts);
			};
		}];
	});

	module.exports = "hrCore";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var Hal = __webpack_require__(10).HalExtension;

	angular.module("hrHal", [__webpack_require__(2)]).provider("hrHalExtension", function () {
		this.mediaTypes = [];
		this.$get = function () {
			return new Hal(this.mediaTypes);
		};
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrHalExtension");
	}]);

	module.exports = "hrHal";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);

	angular.module("hrHyRes", [__webpack_require__(2), __webpack_require__(3), __webpack_require__(7), __webpack_require__(6), __webpack_require__(5)]);

	module.exports = "hrHyRes";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var Json = __webpack_require__(10).JsonExtension;
	var hrCore = __webpack_require__(2);

	angular.module("hrJson", [hrCore]).service("hrJsonExtension", function () {
		return new Json();
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrJsonExtension");
	}]);

	module.exports = "hrJson";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var LinkHeader = __webpack_require__(10).LinkHeaderExtension;

	angular.module("hrLinkHeader", [__webpack_require__(2)]).service("hrLinkHeaderExtension", function () {
		return new LinkHeader();
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrLinkHeaderExtension");
	}]);

	module.exports = "hrLinkHeader";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var Siren = __webpack_require__(10).SirenExtension;

	angular.module("hrSiren", [__webpack_require__(2)]).provider("hrSirenExtension", function () {
		this.mediaTypes = [];
		this.$get = function () {
			return new Siren(this.mediaTypes);
		};
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrSirenExtension");
	}]);

	module.exports = "hrSiren";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(9);
	var Text = __webpack_require__(10).TextExtension;

	angular.module("hrText", [__webpack_require__(2)]).provider("hrTextExtension", function () {
		this.subTypes = [];
		this.wildcard = false;
		this.$get = function () {
			return new Text({ wildcard: this.wildcard, subTypes: this.subTypes });
		};
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrTextExtension");
	}]);

	module.exports = "hrText";
}, function (module, exports, __webpack_require__) {

	module.exports = angular;
}, function (module, exports, __webpack_require__) {

	module.exports = HyRes;
}]);