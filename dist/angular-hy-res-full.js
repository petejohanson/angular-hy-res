/**
 * angular-hy-res - Hypermedia client for AngularJS inspired by $resource
 * @version v0.0.27 - 2015-07-23
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
	module.exports = __webpack_require__(7);
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(8);
	var Hal = __webpack_require__(9).CollectionJsonExtension;

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

	var angular = __webpack_require__(8);
	var HyRes = __webpack_require__(9);

	angular.module("hrCore", []).factory("hrHttp", ["$http", function ($http) {
		return function (options) {
			return $http(options).then(function (resp) {
				resp.headers = resp.headers();
				return resp;
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

	var angular = __webpack_require__(8);
	var Hal = __webpack_require__(9).HalExtension;

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

	var angular = __webpack_require__(8);

	angular.module("hrHyRes", [__webpack_require__(2), __webpack_require__(3), __webpack_require__(7), __webpack_require__(6), __webpack_require__(5)]);

	module.exports = "hrHyRes";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(8);
	var Json = __webpack_require__(9).JsonExtension;
	var hrCore = __webpack_require__(2);

	angular.module("hrJson", [hrCore]).service("hrJsonExtension", function () {
		return new Json();
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrJsonExtension");
	}]);

	module.exports = "hrJson";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(8);
	var LinkHeader = __webpack_require__(9).LinkHeaderExtension;

	angular.module("hrLinkHeader", [__webpack_require__(2)]).service("hrLinkHeaderExtension", function () {
		return new LinkHeader();
	}).config(["hrRootProvider", function (hrRootProvider) {
		hrRootProvider.extensions.push("hrLinkHeaderExtension");
	}]);

	module.exports = "hrLinkHeader";
}, function (module, exports, __webpack_require__) {

	"use strict";

	var angular = __webpack_require__(8);
	var Siren = __webpack_require__(9).SirenExtension;

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

	module.exports = angular;
}, function (module, exports, __webpack_require__) {

	module.exports = {
		Root: __webpack_require__(10),
		WebLink: __webpack_require__(11),
		Resource: __webpack_require__(12),
		Form: __webpack_require__(13),
		HalExtension: __webpack_require__(14),
		JsonExtension: __webpack_require__(15),
		LinkHeaderExtension: __webpack_require__(16),
		SirenExtension: __webpack_require__(17),
		CollectionJsonExtension: __webpack_require__(18)
	};
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var Context = __webpack_require__(19);
	var WebLink = __webpack_require__(11);

	var Root = function Root(url, http, extensions, defaultOptions) {
		var ctx = new Context(http, extensions, defaultOptions);

		WebLink.call(this, { href: url }, ctx.forResource({ url: url }));
	};

	Root.prototype = _.create(WebLink.prototype, {
		constructor: Root
	});

	module.exports = Root;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var Resource = __webpack_require__(12);
	var UriTemplate = __webpack_require__(25);

	var WebLink = function WebLink(data, context) {
		_.extend(this, data);
		this.$$context = context;
	};

	WebLink.prototype.follow = function (options) {
		options = this.$$context.withDefaults(options);
		var opts = _.get(options, "protocol", {});
		opts.headers = opts.headers || {};

		if (!opts.headers.Accept) {
			if (this.type) {
				opts.headers.Accept = this.type;
			} else {
				opts.headers.Accept = this.$$context.acceptHeader();
			}
		}

		var requestOptions = _.extend(opts, { url: this.resolvedUrl(_.get(options, "data")) });
		return Resource.fromRequest(this.$$context.http(requestOptions), this.$$context);
	};

	WebLink.prototype.resolvedUrl = function (data) {
		var url = this.href;

		if (this.templated) {
			url = new UriTemplate(url).expand(data);
		}

		return this.$$context.resolveUrl(url);
	};

	module.exports = WebLink;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var Context = __webpack_require__(19);
	var LinkCollection = __webpack_require__(20);

	var Resource = (function (_Resource) {
		var _ResourceWrapper = function Resource() {
			return _Resource.apply(this, arguments);
		};

		_ResourceWrapper.toString = function () {
			return _Resource.toString();
		};

		return _ResourceWrapper;
	})(function () {
		this.$promise = null;

		this.$resolved = false;

		this.$error = null;

		this.$$links = {};
		this.$$embedded = {};
		this.$$forms = {};

		this.$link = function (rel) {
			var ret = this.$links(rel);
			if (ret.length === 0) {
				return null;
			}
			if (ret.length > 1) {
				throw "Multiple links present";
			}

			return ret[0];
		};

		this.$links = function (rel) {
			if (!rel) {
				return LinkCollection.fromArray(_.flatten(_.values(this.$$links)));
			}

			return _.get(this.$$links, rel, []);
		};

		this.$form = function (rel) {
			var ret = _.get(this.$$forms, rel, []);

			if (ret.length === 0) {
				return null;
			}

			if (ret.length > 1) {
				throw "Multiple forms present";
			}

			return ret[0].clone();
		};

		this.$forms = function (rel) {
			if (!rel) {
				return _.invoke(_.flatten(_.values(this.$$forms)), "clone");
			}

			return _.invoke(_.get(this.$$forms, rel, []), "clone");
		};

		this.$followOne = function (rel, options) {
			if (this.$resolved) {
				var res = this.$sub(rel);
				if (res !== null) {
					return res;
				}

				var l = this.$link(rel);
				if (l === null) {
					return null;
				}

				return l.follow(options);
			}

			var ret = new Resource();
			ret.$promise = this.$promise.then(function (r) {
				return r.$followOne(rel, options).$promise;
			}).then(function (r) {
				var promise = ret.$promise;
				_.assign(ret, r);
				ret.$promise = promise;
				return ret;
			});

			return ret;
		};

		this.$followAll = function (rel, options) {
			if (this.$resolved) {
				var subs = this.$subs(rel);
				if (subs.length > 0) {
					return subs;
				}

				return LinkCollection.fromArray(this.$links(rel)).follow(options);
			}

			var ret = [];
			ret.$resolved = false;
			ret.$error = null;
			ret.$promise = this.$promise.then(function (r) {
				var resources = r.$followAll(rel, options);
				Array.prototype.push.apply(ret, resources);
				return resources.$promise["catch"](function (err) {
					ret.$resolved = true;
					ret.$error = { message: "One or more resources failed to load for $followAll(" + rel + ")", inner: err };
					throw ret;
				});
			}, function (err) {
				ret.$resolved = true;
				ret.$error = { message: "Parent resolution failed, unable to $followAll(" + rel + ")", inner: err };
				throw ret;
			}).then(function () {
				ret.$resolved = true;
				return ret;
			});

			return ret;
		};
	});

	Resource.prototype.$subs = function (rel) {
		if (!this.$$embedded.hasOwnProperty(rel)) {
			return [];
		}

		return this.$$embedded[rel];
	};

	Resource.prototype.$sub = function (rel) {
		var ret = this.$subs(rel);
		if (ret.length === 0) {
			return null;
		}
		if (ret.length > 1) {
			throw "Multiple sub-resources present";
		}

		return ret[0];
	};

	Resource.prototype.$embedded = Resource.prototype.$sub;

	Resource.prototype.$embeddeds = Resource.prototype.$subs;

	Resource.prototype.$has = function (rel) {
		return this.$links(rel).length > 0 || this.$subs(rel).length > 0;
	};

	Resource.prototype.$delete = function () {
		return this.$followOne("self", { protocol: { method: "DELETE" } });
	};

	var defaultParser = _.constant({});

	Resource.prototype.$$resolve = function (data, headers, context) {
		_.forEach(context.extensions, function (e) {
			if (!e.applies(data, headers, context)) {
				return;
			}

			var fields = (e.dataParser || _.constant([])).apply(e, [data, headers, context]);

			_.assign(this, _.reduce(fields, function (result, val) {
				result[val.name] = val.value;
				return result;
			}, {}));

			_.assign(this.$$links, (e.linkParser || defaultParser).apply(e, [data, headers, context]));
			_.assign(this.$$forms, (e.formParser || defaultParser).apply(e, [data, headers, context]));
			_.assign(this.$$embedded, (e.embeddedParser || defaultParser).apply(e, [data, headers, context]));
		}, this);

		this.$resolved = true;
	};

	Resource.prototype.$$reject = function (error) {
		this.$error = error;
		this.$resolved = true;
	};

	Resource.embedded = function (raw, headers, context) {
		var ret = new Resource();
		ret.$$resolve(raw, headers, context);
		ret.$promise = Promise.resolve(ret);
		return ret;
	};

	Resource.embeddedCollection = function (items, headers, context) {
		var embeds = items.map(function (e) {
			return Resource.embedded(e, headers, context);
		}, this);

		embeds.$promise = Promise.resolve(embeds);
		embeds.$resolved = true;

		return embeds;
	};

	Resource.fromRequest = function (request, context) {
		var res = new Resource();
		res.$promise = request.then(function (response) {
			context = context.baseline();
			if (response.config && response.config.url) {
				context = context.forResource({
					url: response.config.url,
					headers: response.headers
				});
			}
			res.$$resolve(response.data, response.headers, context);
			return res;
		}, function (response) {
			res.$$reject({ message: "HTTP request to load resource failed", inner: response });
			throw res;
		});

		return res;
	};

	module.exports = Resource;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var FormUrlEncoded = __webpack_require__(23);
	var Resouce = __webpack_require__(12);

	var Form = function Form(data, context) {
		_.merge(this, _.cloneDeep(data));

		this.$$data = data;
		this.$$context = context;
	};

	Form.prototype.field = function (name) {
		return _.find(this.fields, "name", name);
	};

	var ContentTypeDataTransformers = {
		"application/json": function applicationJson(data) {
			return JSON.stringify(data);
		},
		"application/x-www-form-urlencoded": function applicationXWwwFormUrlencoded(data) {
			return data ? FormUrlEncoded.encode(data) : undefined;
		},
		"multipart/form-data": function multipartFormData(data) {
			var fd = new FormData();
			_.forEach(data, function (val, key) {
				fd.append(key, val);
			});

			return fd;
		}
	};

	Form.prototype.submit = function (options) {
		options = this.$$context.withDefaults(options);
		var config = _.get(options, "protocol", {});

		config = _.merge({}, config, {
			url: this.$$context.resolveUrl(this.href),
			method: this.method,
			transformRequest: [(function (d, h) {
				if (h instanceof Function) {
					h = h();
				}
				var extEncoders = _(this.$$context.extensions).pluck("encoders").compact();
				var encoders = _(ContentTypeDataTransformers).concat(extEncoders.flatten().value()).reduce(_.merge);

				var ct = h["content-type"] || h["Content-Type"];
				var trans = encoders[ct];
				return trans ? trans(d) : d;
			}).bind(this)],
			headers: { "Content-Type": this.type || "application/x-www-form-urlencoded" }
		});

		if (!config.headers.Accept) {
			config.headers.Accept = this.$$context.acceptHeader();
		}

		if (this.fields) {
			var fieldValues = _.map(this.fields, function (f) {
				var ret = {};ret[f.name] = f.value;return ret;
			});
			var vals = _.assign.apply(this, _.flatten([{}, fieldValues]));

			var prop = this.method === "GET" ? "params" : "data";
			config[prop] = vals;
		}

		var ctx = this.$$context;
		var resp = ctx.http(config).then(function (r) {
			if (r.status !== 201 || !r.headers.location) {
				return r;
			}

			var loc = r.headers.location;
			ctx = ctx.forResource({ url: config.url });
			return ctx.http({ method: "GET", url: ctx.resolveUrl(loc), headers: config.headers });
		});
		return Resouce.fromRequest(resp, ctx);
	};

	Form.prototype.clone = function () {
		return new Form(this.$$data, this.$$context);
	};

	module.exports = Form;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var WebLink = __webpack_require__(11);
	var LinkCollection = __webpack_require__(20);
	var Resource = __webpack_require__(12);

	var HalExtension = function HalExtension(mediaTypes) {
		var mediaTypeSet = { "application/hal+json": true };

		mediaTypes = mediaTypes || [];
		for (var i = 0; i < mediaTypes.length; i++) {
			mediaTypeSet[mediaTypes[i]] = true;
		}

		this.mediaTypes = _.keys(mediaTypeSet);

		this.applies = function (data, headers) {
			var h = headers["content-type"];
			if (!h) {
				return false;
			}

			var type = h.split(";")[0];
			return mediaTypeSet[type] !== undefined;
		};

		this.dataParser = function (data, headers) {
			return _.transform(data, function (res, val, key) {
				if (key === "_links" || key === "_embedded") return;
				res.unshift({ name: key, value: val });
			}, []);
		};

		this.linkParser = function (data, headers, context) {
			if (!_.isObject(data._links)) {
				return null;
			}

			var ret = {};
			_.forEach(data._links, function (val, key) {
				if (!_.isArray(val)) {
					val = [val];
				}

				var linkArray = [];
				_.forEach(val, function (l) {
					l.rel = key;
					linkArray.push(new WebLink(l, context));
				}, this);

				ret[key] = LinkCollection.fromArray(linkArray);
			}, this);
			return ret;
		};

		this.embeddedParser = function (data, headers, context) {
			var ret = {};
			_.forEach(data._embedded || {}, function (val, key) {
				if (!_.isArray(val)) {
					val = [val];
				}

				ret[key] = Resource.embeddedCollection(val, headers, context);
			});

			return ret;
		};
	};

	module.exports = HalExtension;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var fieldUtils = __webpack_require__(21);

	var JsonExtension = function JsonExtension() {
		this.mediaTypes = ["application/json"];

		this.applies = function (data, headers) {
			var h = headers["content-type"];
			if (!h) {
				return false;
			}

			var type = h.split(";")[0];
			return type === "application/json";
		};

		this.dataParser = fieldUtils.extractFields;
	};

	module.exports = JsonExtension;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var httpLink = __webpack_require__(24);

	var _ = __webpack_require__(22);
	var WebLink = __webpack_require__(11);

	var LinkHeaderExtension = function LinkHeaderExtension() {
		this.applies = function (data, headers) {
			return _.isString(headers.link);
		};

		this.linkParser = function (data, headers, context) {
			var links = httpLink.parse(headers.link);

			var ret = {};
			for (var i = 0; i < links.length; i++) {
				var l = links[i];
				var wl = new WebLink(l, context);
				if (!_.isUndefined(ret[l.rel])) {
					ret[l.rel].push(wl);
				} else {
					ret[l.rel] = [wl];
				}

				delete l.rel;
			}
			return ret;
		};
	};

	module.exports = LinkHeaderExtension;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var Form = __webpack_require__(13);
	var Resource = __webpack_require__(12);
	var WebLink = __webpack_require__(11);
	var LinkCollection = __webpack_require__(20);

	var SirenExtension = function SirenExtension(mediaTypes) {
		var formDefaults = {
			method: "GET",
			type: "application/x-www-form-urlencoded"
		};

		var mediaTypeSet = { "application/vnd.siren+json": true };

		mediaTypes = mediaTypes || [];
		for (var i = 0; i < mediaTypes.length; i++) {
			mediaTypeSet[mediaTypes[i]] = true;
		}

		this.mediaTypes = _.keys(mediaTypeSet);

		this.applies = function (data, headers) {
			var h = headers["content-type"];
			if (!h) {
				return false;
			}

			var type = h.split(";")[0];
			return mediaTypeSet[type] !== undefined;
		};

		this.dataParser = function (data, headers) {
			var ret = _.transform(data.properties, function (res, val, key) {
				res.unshift({ name: key, value: val });
			}, []);
			if (data.title) {
				ret.unshift({ name: "title", value: data.title });
			}

			return ret;
		};

		this.linkParser = function (data, headers, context) {
			var ret = {};

			if (_.isObject(data.links)) {
				_.forEach(data.links, function (val) {
					var link = new WebLink(val, context);
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

			if (_.isObject(data.entities)) {
				_.forEach(data.entities, function (val) {
					if (!val.href) {
						return;
					}

					var link = new WebLink(val, context);
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
			return ret;
		};

		this.embeddedParser = function (data, headers, context) {
			var ret = {};
			if (!_.isArray(data.entities)) {
				return ret;
			}

			_.forEach(data.entities, function (val) {
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
			return _.mapValues(ret, function (items) {
				return Resource.embeddedCollection(items, headers, context);
			});
		};

		this.formParser = function (data, headers, context) {
			var formFactory = function formFactory(f) {
				return new Form(_.defaults(f, formDefaults), context);
			};

			return _.groupBy(_.map(data.actions, formFactory), "name");
		};
	};

	module.exports = SirenExtension;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);
	var FieldUtils = __webpack_require__(21);
	var Form = __webpack_require__(13);
	var WebLink = __webpack_require__(11);
	var Resource = __webpack_require__(12);
	var LinkCollection = __webpack_require__(20);

	var cjObjectLinkParser = function cjObjectLinkParser(obj, headers, context) {

		var links = (obj.links || []).concat([{ rel: "self", href: obj.href }]);

		return _(links).map(function (l) {
			return new WebLink(l, context);
		}).groupBy("rel").value();
	};

	var CollectionJsonItemExtension = function CollectionJsonItemExtension(parentCollection) {
		this.applies = _.constant(true);

		this.linkParser = cjObjectLinkParser;

		this.dataParser = function (data) {
			return data.data || [];
		};

		this.formParser = function (data, headers, context) {
			var templateData = _.get(parentCollection, "collection.template.data") || [];

			var fields = _(templateData.concat(data.data || [])).indexBy("name").values().value();

			return {
				"edit-form": [new Form({
					href: data.href,
					method: "PUT",
					type: "application/vnd.collection+json",
					fields: fields
				}, context)]
			};
		};
	};

	var CollectionJsonExtension = function CollectionJsonExtension(mediaTypes) {
		var mediaTypeSet = { "application/vnd.collection+json": true };

		mediaTypes = mediaTypes || [];
		for (var i = 0; i < mediaTypes.length; i++) {
			mediaTypeSet[mediaTypes[i]] = true;
		}

		this.encoders = {
			"application/vnd.collection+json": function applicationVndCollectionJson(data) {
				return JSON.stringify({
					template: {
						data: FieldUtils.extractFields(data)
					}
				});
			}
		};

		this.mediaTypes = _.keys(mediaTypeSet);

		this.applies = function (data, headers) {
			var h = headers["content-type"];
			if (!h) {
				return false;
			}

			var type = h.split(";")[0];
			return mediaTypeSet[type] !== undefined;
		};

		this.dataParser = function (data) {
			return data.data || [];
		};

		this.linkParser = function (data, headers, context) {
			return cjObjectLinkParser(data.collection, headers, context);
		};

		var queryFormDefaults = {
			method: "GET",
			type: "application/x-www-form-urlencoded"
		};

		this.formParser = function (data, headers, context) {
			var coll = data.collection;

			var formFactory = function formFactory(q) {
				var q2 = _.clone(q);
				q2.fields = q2.data;
				delete q2.data;
				return new Form(_.defaults(q2, queryFormDefaults), context);
			};

			var forms = _.groupBy(_.map(coll.queries || [], formFactory), "rel");

			if (coll.template) {
				forms["create-form"] = [new Form({
					href: coll.href,
					method: "POST",
					type: "application/vnd.collection+json",
					fields: coll.template.data
				}, context)];
			}
			return forms;
		};

		this.embeddedParser = function (data, headers, context) {
			return {
				item: Resource.embeddedCollection(_.cloneDeep(data.collection.items), headers, context.withExtensions([new CollectionJsonItemExtension(data)]))
			};
		};
	};

	module.exports = CollectionJsonExtension;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var URI = __webpack_require__(26);
	var _ = __webpack_require__(22);

	var Context = function Context(http, extensions, defaultOptions) {
		this.http = http;
		this.extensions = extensions;
		this.defaultOptions = defaultOptions || {};
		this.headers = {};
	};

	Context.prototype.resolveUrl = function (url) {
		if (this.url) {
			url = new URI(url).absoluteTo(this.url).toString();
		}
		return url;
	};

	Context.prototype.acceptHeader = function () {
		var mediaTypes = _(this.extensions).pluck("mediaTypes").flatten().compact();
		if (this.headers["content-type"]) {
			var preferred = this.headers["content-type"];
			mediaTypes = mediaTypes.map(function (mt) {
				return mt === preferred ? mt : mt + ";q=0.5";
			});
		}
		return mediaTypes.join(",");
	};

	Context.prototype.baseline = function () {
		return this.forResource(undefined);
	};

	Context.prototype.forResource = function (resource) {
		var c = new Context(this.http, this.extensions, this.defaultOptions);
		resource = resource || {};
		c.url = resource.url;
		c.headers = resource.headers || {};

		return c;
	};

	Context.prototype.withDefaults = function (options) {
		var ret = {};

		return _.merge({}, this.defaultOptions, options || {});
	};

	Context.prototype.withExtensions = function (extensions) {
		return new Context(this.http, extensions, this.defaultOptions);
	};

	module.exports = Context;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);

	var LinkCollection = (function (_LinkCollection) {
		var _LinkCollectionWrapper = function LinkCollection() {
			return _LinkCollection.apply(this, arguments);
		};

		_LinkCollectionWrapper.toString = function () {
			return _LinkCollection.toString();
		};

		return _LinkCollectionWrapper;
	})(function () {
		var coll = Object.create(Array.prototype);
		coll = Array.apply(coll, arguments) || coll;

		LinkCollection.injectClassMethods(coll);
		return coll;
	});

	LinkCollection.injectClassMethods = function (c) {
		for (var method in LinkCollection.prototype) {
			if (LinkCollection.prototype.hasOwnProperty(method)) {
				c[method] = LinkCollection.prototype[method];
			}
		}

		return c;
	};

	LinkCollection.fromArray = function (links) {
		return LinkCollection.apply(null, links);
	};

	LinkCollection.prototype.follow = function (options) {
		var res = _.invoke(this, "follow", options);
		res.$promise = Promise.all(_.pluck(res, "$promise"));
		res.$resolved = false;
		res.$error = null;
		res.$promise.then(function (r) {
			res.$resolved = true;
		}, function (err) {
			res.$resolved = true;
			res.$error = err;
		});

		return res;
	};

	module.exports = LinkCollection;
}, function (module, exports, __webpack_require__) {

	"use strict";

	var _ = __webpack_require__(22);

	module.exports.extractFields = function (data) {
		return _.transform(data, function (res, val, key) {
			res.unshift({ name: key, value: val });
		}, []);
	};
}, function (module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function (module, global) {
		;(function () {
			var undefined;

			var VERSION = "3.10.0";

			var BIND_FLAG = 1,
			    BIND_KEY_FLAG = 2,
			    CURRY_BOUND_FLAG = 4,
			    CURRY_FLAG = 8,
			    CURRY_RIGHT_FLAG = 16,
			    PARTIAL_FLAG = 32,
			    PARTIAL_RIGHT_FLAG = 64,
			    ARY_FLAG = 128,
			    REARG_FLAG = 256;

			var DEFAULT_TRUNC_LENGTH = 30,
			    DEFAULT_TRUNC_OMISSION = "...";

			var HOT_COUNT = 150,
			    HOT_SPAN = 16;

			var LARGE_ARRAY_SIZE = 200;

			var LAZY_FILTER_FLAG = 1,
			    LAZY_MAP_FLAG = 2;

			var FUNC_ERROR_TEXT = "Expected a function";

			var PLACEHOLDER = "__lodash_placeholder__";

			var argsTag = "[object Arguments]",
			    arrayTag = "[object Array]",
			    boolTag = "[object Boolean]",
			    dateTag = "[object Date]",
			    errorTag = "[object Error]",
			    funcTag = "[object Function]",
			    mapTag = "[object Map]",
			    numberTag = "[object Number]",
			    objectTag = "[object Object]",
			    regexpTag = "[object RegExp]",
			    setTag = "[object Set]",
			    stringTag = "[object String]",
			    weakMapTag = "[object WeakMap]";

			var arrayBufferTag = "[object ArrayBuffer]",
			    float32Tag = "[object Float32Array]",
			    float64Tag = "[object Float64Array]",
			    int8Tag = "[object Int8Array]",
			    int16Tag = "[object Int16Array]",
			    int32Tag = "[object Int32Array]",
			    uint8Tag = "[object Uint8Array]",
			    uint8ClampedTag = "[object Uint8ClampedArray]",
			    uint16Tag = "[object Uint16Array]",
			    uint32Tag = "[object Uint32Array]";

			var reEmptyStringLeading = /\b__p \+= '';/g,
			    reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
			    reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

			var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
			    reUnescapedHtml = /[&<>"'`]/g,
			    reHasEscapedHtml = RegExp(reEscapedHtml.source),
			    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

			var reEscape = /<%-([\s\S]+?)%>/g,
			    reEvaluate = /<%([\s\S]+?)%>/g,
			    reInterpolate = /<%=([\s\S]+?)%>/g;

			var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
			    reIsPlainProp = /^\w*$/,
			    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

			var reRegExpChars = /^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,
			    reHasRegExpChars = RegExp(reRegExpChars.source);

			var reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g;

			var reEscapeChar = /\\(\\)?/g;

			var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

			var reFlags = /\w*$/;

			var reHasHexPrefix = /^0[xX]/;

			var reIsHostCtor = /^\[object .+?Constructor\]$/;

			var reIsUint = /^\d+$/;

			var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;

			var reNoMatch = /($^)/;

			var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

			var reWords = (function () {
				var upper = "[A-Z\\xc0-\\xd6\\xd8-\\xde]",
				    lower = "[a-z\\xdf-\\xf6\\xf8-\\xff]+";

				return RegExp(upper + "+(?=" + upper + lower + ")|" + upper + "?" + lower + "|" + upper + "+|[0-9]+", "g");
			})();

			var contextProps = ["Array", "ArrayBuffer", "Date", "Error", "Float32Array", "Float64Array", "Function", "Int8Array", "Int16Array", "Int32Array", "Math", "Number", "Object", "RegExp", "Set", "String", "_", "clearTimeout", "isFinite", "parseFloat", "parseInt", "setTimeout", "TypeError", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap"];

			var templateCounter = -1;

			var typedArrayTags = {};
			typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
			typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

			var cloneableTags = {};
			cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
			cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[mapTag] = cloneableTags[setTag] = cloneableTags[weakMapTag] = false;

			var deburredLetters = {
				À: "A", Á: "A", Â: "A", Ã: "A", Ä: "A", Å: "A",
				à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a",
				Ç: "C", ç: "c",
				Ð: "D", ð: "d",
				È: "E", É: "E", Ê: "E", Ë: "E",
				è: "e", é: "e", ê: "e", ë: "e",
				Ì: "I", Í: "I", Î: "I", Ï: "I",
				ì: "i", í: "i", î: "i", ï: "i",
				Ñ: "N", ñ: "n",
				Ò: "O", Ó: "O", Ô: "O", Õ: "O", Ö: "O", Ø: "O",
				ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
				Ù: "U", Ú: "U", Û: "U", Ü: "U",
				ù: "u", ú: "u", û: "u", ü: "u",
				Ý: "Y", ý: "y", ÿ: "y",
				Æ: "Ae", æ: "ae",
				Þ: "Th", þ: "th",
				ß: "ss"
			};

			var htmlEscapes = {
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"\"": "&quot;",
				"'": "&#39;",
				"`": "&#96;"
			};

			var htmlUnescapes = {
				"&amp;": "&",
				"&lt;": "<",
				"&gt;": ">",
				"&quot;": "\"",
				"&#39;": "'",
				"&#96;": "`"
			};

			var objectTypes = {
				"function": true,
				object: true
			};

			var regexpEscapes = {
				"0": "x30", "1": "x31", "2": "x32", "3": "x33", "4": "x34",
				"5": "x35", "6": "x36", "7": "x37", "8": "x38", "9": "x39",
				A: "x41", B: "x42", C: "x43", D: "x44", E: "x45", F: "x46",
				a: "x61", b: "x62", c: "x63", d: "x64", e: "x65", f: "x66",
				n: "x6e", r: "x72", t: "x74", u: "x75", v: "x76", x: "x78"
			};

			var stringEscapes = {
				"\\": "\\",
				"'": "'",
				"\n": "n",
				"\r": "r",
				"\u2028": "u2028",
				"\u2029": "u2029"
			};

			var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

			var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

			var freeGlobal = freeExports && freeModule && typeof global == "object" && global && global.Object && global;

			var freeSelf = objectTypes[typeof self] && self && self.Object && self;

			var freeWindow = objectTypes[typeof window] && window && window.Object && window;

			var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

			var root = freeGlobal || freeWindow !== (this && this.window) && freeWindow || freeSelf || this;

			function baseCompareAscending(value, other) {
				if (value !== other) {
					var valIsNull = value === null,
					    valIsUndef = value === undefined,
					    valIsReflexive = value === value;

					var othIsNull = other === null,
					    othIsUndef = other === undefined,
					    othIsReflexive = other === other;

					if (value > other && !othIsNull || !valIsReflexive || valIsNull && !othIsUndef && othIsReflexive || valIsUndef && othIsReflexive) {
						return 1;
					}
					if (value < other && !valIsNull || !othIsReflexive || othIsNull && !valIsUndef && valIsReflexive || othIsUndef && valIsReflexive) {
						return -1;
					}
				}
				return 0;
			}

			function baseFindIndex(array, predicate, fromRight) {
				var length = array.length,
				    index = fromRight ? length : -1;

				while (fromRight ? index-- : ++index < length) {
					if (predicate(array[index], index, array)) {
						return index;
					}
				}
				return -1;
			}

			function baseIndexOf(array, value, fromIndex) {
				if (value !== value) {
					return indexOfNaN(array, fromIndex);
				}
				var index = fromIndex - 1,
				    length = array.length;

				while (++index < length) {
					if (array[index] === value) {
						return index;
					}
				}
				return -1;
			}

			function baseIsFunction(value) {
				return typeof value == "function" || false;
			}

			function baseToString(value) {
				return value == null ? "" : value + "";
			}

			function charsLeftIndex(string, chars) {
				var index = -1,
				    length = string.length;

				while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
				return index;
			}

			function charsRightIndex(string, chars) {
				var index = string.length;

				while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
				return index;
			}

			function compareAscending(object, other) {
				return baseCompareAscending(object.criteria, other.criteria) || object.index - other.index;
			}

			function compareMultiple(object, other, orders) {
				var index = -1,
				    objCriteria = object.criteria,
				    othCriteria = other.criteria,
				    length = objCriteria.length,
				    ordersLength = orders.length;

				while (++index < length) {
					var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
					if (result) {
						if (index >= ordersLength) {
							return result;
						}
						var order = orders[index];
						return result * (order === "asc" || order === true ? 1 : -1);
					}
				}

				return object.index - other.index;
			}

			function deburrLetter(letter) {
				return deburredLetters[letter];
			}

			function escapeHtmlChar(chr) {
				return htmlEscapes[chr];
			}

			function escapeRegExpChar(chr, leadingChar, whitespaceChar) {
				if (leadingChar) {
					chr = regexpEscapes[chr];
				} else if (whitespaceChar) {
					chr = stringEscapes[chr];
				}
				return "\\" + chr;
			}

			function escapeStringChar(chr) {
				return "\\" + stringEscapes[chr];
			}

			function indexOfNaN(array, fromIndex, fromRight) {
				var length = array.length,
				    index = fromIndex + (fromRight ? 0 : -1);

				while (fromRight ? index-- : ++index < length) {
					var other = array[index];
					if (other !== other) {
						return index;
					}
				}
				return -1;
			}

			function isObjectLike(value) {
				return !!value && typeof value == "object";
			}

			function isSpace(charCode) {
				return charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160 || charCode == 5760 || charCode == 6158 || charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279);
			}

			function replaceHolders(array, placeholder) {
				var index = -1,
				    length = array.length,
				    resIndex = -1,
				    result = [];

				while (++index < length) {
					if (array[index] === placeholder) {
						array[index] = PLACEHOLDER;
						result[++resIndex] = index;
					}
				}
				return result;
			}

			function sortedUniq(array, iteratee) {
				var seen,
				    index = -1,
				    length = array.length,
				    resIndex = -1,
				    result = [];

				while (++index < length) {
					var value = array[index],
					    computed = iteratee ? iteratee(value, index, array) : value;

					if (!index || seen !== computed) {
						seen = computed;
						result[++resIndex] = value;
					}
				}
				return result;
			}

			function trimmedLeftIndex(string) {
				var index = -1,
				    length = string.length;

				while (++index < length && isSpace(string.charCodeAt(index))) {}
				return index;
			}

			function trimmedRightIndex(string) {
				var index = string.length;

				while (index-- && isSpace(string.charCodeAt(index))) {}
				return index;
			}

			function unescapeHtmlChar(chr) {
				return htmlUnescapes[chr];
			}

			function runInContext(context) {
				context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

				var Array = context.Array,
				    Date = context.Date,
				    Error = context.Error,
				    Function = context.Function,
				    Math = context.Math,
				    Number = context.Number,
				    Object = context.Object,
				    RegExp = context.RegExp,
				    String = context.String,
				    TypeError = context.TypeError;

				var arrayProto = Array.prototype,
				    objectProto = Object.prototype,
				    stringProto = String.prototype;

				var fnToString = Function.prototype.toString;

				var hasOwnProperty = objectProto.hasOwnProperty;

				var idCounter = 0;

				var objToString = objectProto.toString;

				var oldDash = root._;

				var reIsNative = RegExp("^" + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");

				var ArrayBuffer = context.ArrayBuffer,
				    clearTimeout = context.clearTimeout,
				    parseFloat = context.parseFloat,
				    pow = Math.pow,
				    propertyIsEnumerable = objectProto.propertyIsEnumerable,
				    Set = getNative(context, "Set"),
				    setTimeout = context.setTimeout,
				    splice = arrayProto.splice,
				    Uint8Array = context.Uint8Array,
				    WeakMap = getNative(context, "WeakMap");

				var nativeCeil = Math.ceil,
				    nativeCreate = getNative(Object, "create"),
				    nativeFloor = Math.floor,
				    nativeIsArray = getNative(Array, "isArray"),
				    nativeIsFinite = context.isFinite,
				    nativeKeys = getNative(Object, "keys"),
				    nativeMax = Math.max,
				    nativeMin = Math.min,
				    nativeNow = getNative(Date, "now"),
				    nativeParseInt = context.parseInt,
				    nativeRandom = Math.random;

				var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
				    POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

				var MAX_ARRAY_LENGTH = 4294967295,
				    MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
				    HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

				var MAX_SAFE_INTEGER = 9007199254740991;

				var metaMap = WeakMap && new WeakMap();

				var realNames = {};

				function lodash(value) {
					if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
						if (value instanceof LodashWrapper) {
							return value;
						}
						if (hasOwnProperty.call(value, "__chain__") && hasOwnProperty.call(value, "__wrapped__")) {
							return wrapperClone(value);
						}
					}
					return new LodashWrapper(value);
				}

				function baseLodash() {}

				function LodashWrapper(value, chainAll, actions) {
					this.__wrapped__ = value;
					this.__actions__ = actions || [];
					this.__chain__ = !!chainAll;
				}

				var support = lodash.support = {};

				lodash.templateSettings = {
					escape: reEscape,
					evaluate: reEvaluate,
					interpolate: reInterpolate,
					variable: "",
					imports: {
						_: lodash
					}
				};

				function LazyWrapper(value) {
					this.__wrapped__ = value;
					this.__actions__ = [];
					this.__dir__ = 1;
					this.__filtered__ = false;
					this.__iteratees__ = [];
					this.__takeCount__ = POSITIVE_INFINITY;
					this.__views__ = [];
				}

				function lazyClone() {
					var result = new LazyWrapper(this.__wrapped__);
					result.__actions__ = arrayCopy(this.__actions__);
					result.__dir__ = this.__dir__;
					result.__filtered__ = this.__filtered__;
					result.__iteratees__ = arrayCopy(this.__iteratees__);
					result.__takeCount__ = this.__takeCount__;
					result.__views__ = arrayCopy(this.__views__);
					return result;
				}

				function lazyReverse() {
					if (this.__filtered__) {
						var result = new LazyWrapper(this);
						result.__dir__ = -1;
						result.__filtered__ = true;
					} else {
						result = this.clone();
						result.__dir__ *= -1;
					}
					return result;
				}

				function lazyValue() {
					var array = this.__wrapped__.value(),
					    dir = this.__dir__,
					    isArr = isArray(array),
					    isRight = dir < 0,
					    arrLength = isArr ? array.length : 0,
					    view = getView(0, arrLength, this.__views__),
					    start = view.start,
					    end = view.end,
					    length = end - start,
					    index = isRight ? end : start - 1,
					    iteratees = this.__iteratees__,
					    iterLength = iteratees.length,
					    resIndex = 0,
					    takeCount = nativeMin(length, this.__takeCount__);

					if (!isArr || arrLength < LARGE_ARRAY_SIZE || arrLength == length && takeCount == length) {
						return baseWrapperValue(isRight && isArr ? array.reverse() : array, this.__actions__);
					}
					var result = [];

					outer: while (length-- && resIndex < takeCount) {
						index += dir;

						var iterIndex = -1,
						    value = array[index];

						while (++iterIndex < iterLength) {
							var data = iteratees[iterIndex],
							    iteratee = data.iteratee,
							    type = data.type,
							    computed = iteratee(value);

							if (type == LAZY_MAP_FLAG) {
								value = computed;
							} else if (!computed) {
								if (type == LAZY_FILTER_FLAG) {
									continue outer;
								} else {
									break outer;
								}
							}
						}
						result[resIndex++] = value;
					}
					return result;
				}

				function MapCache() {
					this.__data__ = {};
				}

				function mapDelete(key) {
					return this.has(key) && delete this.__data__[key];
				}

				function mapGet(key) {
					return key == "__proto__" ? undefined : this.__data__[key];
				}

				function mapHas(key) {
					return key != "__proto__" && hasOwnProperty.call(this.__data__, key);
				}

				function mapSet(key, value) {
					if (key != "__proto__") {
						this.__data__[key] = value;
					}
					return this;
				}

				function SetCache(values) {
					var length = values ? values.length : 0;

					this.data = { hash: nativeCreate(null), set: new Set() };
					while (length--) {
						this.push(values[length]);
					}
				}

				function cacheIndexOf(cache, value) {
					var data = cache.data,
					    result = typeof value == "string" || isObject(value) ? data.set.has(value) : data.hash[value];

					return result ? 0 : -1;
				}

				function cachePush(value) {
					var data = this.data;
					if (typeof value == "string" || isObject(value)) {
						data.set.add(value);
					} else {
						data.hash[value] = true;
					}
				}

				function arrayConcat(array, other) {
					var index = -1,
					    length = array.length,
					    othIndex = -1,
					    othLength = other.length,
					    result = Array(length + othLength);

					while (++index < length) {
						result[index] = array[index];
					}
					while (++othIndex < othLength) {
						result[index++] = other[othIndex];
					}
					return result;
				}

				function arrayCopy(source, array) {
					var index = -1,
					    length = source.length;

					array || (array = Array(length));
					while (++index < length) {
						array[index] = source[index];
					}
					return array;
				}

				function arrayEach(array, iteratee) {
					var index = -1,
					    length = array.length;

					while (++index < length) {
						if (iteratee(array[index], index, array) === false) {
							break;
						}
					}
					return array;
				}

				function arrayEachRight(array, iteratee) {
					var length = array.length;

					while (length--) {
						if (iteratee(array[length], length, array) === false) {
							break;
						}
					}
					return array;
				}

				function arrayEvery(array, predicate) {
					var index = -1,
					    length = array.length;

					while (++index < length) {
						if (!predicate(array[index], index, array)) {
							return false;
						}
					}
					return true;
				}

				function arrayExtremum(array, iteratee, comparator, exValue) {
					var index = -1,
					    length = array.length,
					    computed = exValue,
					    result = computed;

					while (++index < length) {
						var value = array[index],
						    current = +iteratee(value);

						if (comparator(current, computed)) {
							computed = current;
							result = value;
						}
					}
					return result;
				}

				function arrayFilter(array, predicate) {
					var index = -1,
					    length = array.length,
					    resIndex = -1,
					    result = [];

					while (++index < length) {
						var value = array[index];
						if (predicate(value, index, array)) {
							result[++resIndex] = value;
						}
					}
					return result;
				}

				function arrayMap(array, iteratee) {
					var index = -1,
					    length = array.length,
					    result = Array(length);

					while (++index < length) {
						result[index] = iteratee(array[index], index, array);
					}
					return result;
				}

				function arrayPush(array, values) {
					var index = -1,
					    length = values.length,
					    offset = array.length;

					while (++index < length) {
						array[offset + index] = values[index];
					}
					return array;
				}

				function arrayReduce(array, iteratee, accumulator, initFromArray) {
					var index = -1,
					    length = array.length;

					if (initFromArray && length) {
						accumulator = array[++index];
					}
					while (++index < length) {
						accumulator = iteratee(accumulator, array[index], index, array);
					}
					return accumulator;
				}

				function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
					var length = array.length;
					if (initFromArray && length) {
						accumulator = array[--length];
					}
					while (length--) {
						accumulator = iteratee(accumulator, array[length], length, array);
					}
					return accumulator;
				}

				function arraySome(array, predicate) {
					var index = -1,
					    length = array.length;

					while (++index < length) {
						if (predicate(array[index], index, array)) {
							return true;
						}
					}
					return false;
				}

				function arraySum(array, iteratee) {
					var length = array.length,
					    result = 0;

					while (length--) {
						result += +iteratee(array[length]) || 0;
					}
					return result;
				}

				function assignDefaults(objectValue, sourceValue) {
					return objectValue === undefined ? sourceValue : objectValue;
				}

				function assignOwnDefaults(objectValue, sourceValue, key, object) {
					return objectValue === undefined || !hasOwnProperty.call(object, key) ? sourceValue : objectValue;
				}

				function assignWith(object, source, customizer) {
					var index = -1,
					    props = keys(source),
					    length = props.length;

					while (++index < length) {
						var key = props[index],
						    value = object[key],
						    result = customizer(value, source[key], key, object, source);

						if ((result === result ? result !== value : value === value) || value === undefined && !(key in object)) {
							object[key] = result;
						}
					}
					return object;
				}

				function baseAssign(object, source) {
					return source == null ? object : baseCopy(source, keys(source), object);
				}

				function baseAt(collection, props) {
					var index = -1,
					    isNil = collection == null,
					    isArr = !isNil && isArrayLike(collection),
					    length = isArr ? collection.length : 0,
					    propsLength = props.length,
					    result = Array(propsLength);

					while (++index < propsLength) {
						var key = props[index];
						if (isArr) {
							result[index] = isIndex(key, length) ? collection[key] : undefined;
						} else {
							result[index] = isNil ? undefined : collection[key];
						}
					}
					return result;
				}

				function baseCopy(source, props, object) {
					object || (object = {});

					var index = -1,
					    length = props.length;

					while (++index < length) {
						var key = props[index];
						object[key] = source[key];
					}
					return object;
				}

				function baseCallback(func, thisArg, argCount) {
					var type = typeof func;
					if (type == "function") {
						return thisArg === undefined ? func : bindCallback(func, thisArg, argCount);
					}
					if (func == null) {
						return identity;
					}
					if (type == "object") {
						return baseMatches(func);
					}
					return thisArg === undefined ? property(func) : baseMatchesProperty(func, thisArg);
				}

				function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
					var result;
					if (customizer) {
						result = object ? customizer(value, key, object) : customizer(value);
					}
					if (result !== undefined) {
						return result;
					}
					if (!isObject(value)) {
						return value;
					}
					var isArr = isArray(value);
					if (isArr) {
						result = initCloneArray(value);
						if (!isDeep) {
							return arrayCopy(value, result);
						}
					} else {
						var tag = objToString.call(value),
						    isFunc = tag == funcTag;

						if (tag == objectTag || tag == argsTag || isFunc && !object) {
							result = initCloneObject(isFunc ? {} : value);
							if (!isDeep) {
								return baseAssign(result, value);
							}
						} else {
							return cloneableTags[tag] ? initCloneByTag(value, tag, isDeep) : object ? value : {};
						}
					}

					stackA || (stackA = []);
					stackB || (stackB = []);

					var length = stackA.length;
					while (length--) {
						if (stackA[length] == value) {
							return stackB[length];
						}
					}

					stackA.push(value);
					stackB.push(result);

					(isArr ? arrayEach : baseForOwn)(value, function (subValue, key) {
						result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
					});
					return result;
				}

				var baseCreate = (function () {
					function object() {}
					return function (prototype) {
						if (isObject(prototype)) {
							object.prototype = prototype;
							var result = new object();
							object.prototype = undefined;
						}
						return result || {};
					};
				})();

				function baseDelay(func, wait, args) {
					if (typeof func != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					return setTimeout(function () {
						func.apply(undefined, args);
					}, wait);
				}

				function baseDifference(array, values) {
					var length = array ? array.length : 0,
					    result = [];

					if (!length) {
						return result;
					}
					var index = -1,
					    indexOf = getIndexOf(),
					    isCommon = indexOf == baseIndexOf,
					    cache = isCommon && values.length >= LARGE_ARRAY_SIZE ? createCache(values) : null,
					    valuesLength = values.length;

					if (cache) {
						indexOf = cacheIndexOf;
						isCommon = false;
						values = cache;
					}
					outer: while (++index < length) {
						var value = array[index];

						if (isCommon && value === value) {
							var valuesIndex = valuesLength;
							while (valuesIndex--) {
								if (values[valuesIndex] === value) {
									continue outer;
								}
							}
							result.push(value);
						} else if (indexOf(values, value, 0) < 0) {
							result.push(value);
						}
					}
					return result;
				}

				var baseEach = createBaseEach(baseForOwn);

				var baseEachRight = createBaseEach(baseForOwnRight, true);

				function baseEvery(collection, predicate) {
					var result = true;
					baseEach(collection, function (value, index, collection) {
						result = !!predicate(value, index, collection);
						return result;
					});
					return result;
				}

				function baseExtremum(collection, iteratee, comparator, exValue) {
					var computed = exValue,
					    result = computed;

					baseEach(collection, function (value, index, collection) {
						var current = +iteratee(value, index, collection);
						if (comparator(current, computed) || current === exValue && current === result) {
							computed = current;
							result = value;
						}
					});
					return result;
				}

				function baseFill(array, value, start, end) {
					var length = array.length;

					start = start == null ? 0 : +start || 0;
					if (start < 0) {
						start = -start > length ? 0 : length + start;
					}
					end = end === undefined || end > length ? length : +end || 0;
					if (end < 0) {
						end += length;
					}
					length = start > end ? 0 : end >>> 0;
					start >>>= 0;

					while (start < length) {
						array[start++] = value;
					}
					return array;
				}

				function baseFilter(collection, predicate) {
					var result = [];
					baseEach(collection, function (value, index, collection) {
						if (predicate(value, index, collection)) {
							result.push(value);
						}
					});
					return result;
				}

				function baseFind(collection, predicate, eachFunc, retKey) {
					var result;
					eachFunc(collection, function (value, key, collection) {
						if (predicate(value, key, collection)) {
							result = retKey ? key : value;
							return false;
						}
					});
					return result;
				}

				function baseFlatten(array, isDeep, isStrict, result) {
					result || (result = []);

					var index = -1,
					    length = array.length;

					while (++index < length) {
						var value = array[index];
						if (isObjectLike(value) && isArrayLike(value) && (isStrict || isArray(value) || isArguments(value))) {
							if (isDeep) {
								baseFlatten(value, isDeep, isStrict, result);
							} else {
								arrayPush(result, value);
							}
						} else if (!isStrict) {
							result[result.length] = value;
						}
					}
					return result;
				}

				var baseFor = createBaseFor();

				var baseForRight = createBaseFor(true);

				function baseForIn(object, iteratee) {
					return baseFor(object, iteratee, keysIn);
				}

				function baseForOwn(object, iteratee) {
					return baseFor(object, iteratee, keys);
				}

				function baseForOwnRight(object, iteratee) {
					return baseForRight(object, iteratee, keys);
				}

				function baseFunctions(object, props) {
					var index = -1,
					    length = props.length,
					    resIndex = -1,
					    result = [];

					while (++index < length) {
						var key = props[index];
						if (isFunction(object[key])) {
							result[++resIndex] = key;
						}
					}
					return result;
				}

				function baseGet(object, path, pathKey) {
					if (object == null) {
						return;
					}
					if (pathKey !== undefined && pathKey in toObject(object)) {
						path = [pathKey];
					}
					var index = 0,
					    length = path.length;

					while (object != null && index < length) {
						object = object[path[index++]];
					}
					return index && index == length ? object : undefined;
				}

				function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
					if (value === other) {
						return true;
					}
					if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
						return value !== value && other !== other;
					}
					return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
				}

				function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
					var objIsArr = isArray(object),
					    othIsArr = isArray(other),
					    objTag = arrayTag,
					    othTag = arrayTag;

					if (!objIsArr) {
						objTag = objToString.call(object);
						if (objTag == argsTag) {
							objTag = objectTag;
						} else if (objTag != objectTag) {
							objIsArr = isTypedArray(object);
						}
					}
					if (!othIsArr) {
						othTag = objToString.call(other);
						if (othTag == argsTag) {
							othTag = objectTag;
						} else if (othTag != objectTag) {
							othIsArr = isTypedArray(other);
						}
					}
					var objIsObj = objTag == objectTag,
					    othIsObj = othTag == objectTag,
					    isSameTag = objTag == othTag;

					if (isSameTag && !(objIsArr || objIsObj)) {
						return equalByTag(object, other, objTag);
					}
					if (!isLoose) {
						var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"),
						    othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");

						if (objIsWrapped || othIsWrapped) {
							return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
						}
					}
					if (!isSameTag) {
						return false;
					}

					stackA || (stackA = []);
					stackB || (stackB = []);

					var length = stackA.length;
					while (length--) {
						if (stackA[length] == object) {
							return stackB[length] == other;
						}
					}

					stackA.push(object);
					stackB.push(other);

					var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

					stackA.pop();
					stackB.pop();

					return result;
				}

				function baseIsMatch(object, matchData, customizer) {
					var index = matchData.length,
					    length = index,
					    noCustomizer = !customizer;

					if (object == null) {
						return !length;
					}
					object = toObject(object);
					while (index--) {
						var data = matchData[index];
						if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
							return false;
						}
					}
					while (++index < length) {
						data = matchData[index];
						var key = data[0],
						    objValue = object[key],
						    srcValue = data[1];

						if (noCustomizer && data[2]) {
							if (objValue === undefined && !(key in object)) {
								return false;
							}
						} else {
							var result = customizer ? customizer(objValue, srcValue, key) : undefined;
							if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
								return false;
							}
						}
					}
					return true;
				}

				function baseMap(collection, iteratee) {
					var index = -1,
					    result = isArrayLike(collection) ? Array(collection.length) : [];

					baseEach(collection, function (value, key, collection) {
						result[++index] = iteratee(value, key, collection);
					});
					return result;
				}

				function baseMatches(source) {
					var matchData = getMatchData(source);
					if (matchData.length == 1 && matchData[0][2]) {
						var key = matchData[0][0],
						    value = matchData[0][1];

						return function (object) {
							if (object == null) {
								return false;
							}
							return object[key] === value && (value !== undefined || key in toObject(object));
						};
					}
					return function (object) {
						return baseIsMatch(object, matchData);
					};
				}

				function baseMatchesProperty(path, srcValue) {
					var isArr = isArray(path),
					    isCommon = isKey(path) && isStrictComparable(srcValue),
					    pathKey = path + "";

					path = toPath(path);
					return function (object) {
						if (object == null) {
							return false;
						}
						var key = pathKey;
						object = toObject(object);
						if ((isArr || !isCommon) && !(key in object)) {
							object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
							if (object == null) {
								return false;
							}
							key = last(path);
							object = toObject(object);
						}
						return object[key] === srcValue ? srcValue !== undefined || key in object : baseIsEqual(srcValue, object[key], undefined, true);
					};
				}

				function baseMerge(object, source, customizer, stackA, stackB) {
					if (!isObject(object)) {
						return object;
					}
					var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
					    props = isSrcArr ? undefined : keys(source);

					arrayEach(props || source, function (srcValue, key) {
						if (props) {
							key = srcValue;
							srcValue = source[key];
						}
						if (isObjectLike(srcValue)) {
							stackA || (stackA = []);
							stackB || (stackB = []);
							baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
						} else {
							var value = object[key],
							    result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
							    isCommon = result === undefined;

							if (isCommon) {
								result = srcValue;
							}
							if ((result !== undefined || isSrcArr && !(key in object)) && (isCommon || (result === result ? result !== value : value === value))) {
								object[key] = result;
							}
						}
					});
					return object;
				}

				function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
					var length = stackA.length,
					    srcValue = source[key];

					while (length--) {
						if (stackA[length] == srcValue) {
							object[key] = stackB[length];
							return;
						}
					}
					var value = object[key],
					    result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
					    isCommon = result === undefined;

					if (isCommon) {
						result = srcValue;
						if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
							result = isArray(value) ? value : isArrayLike(value) ? arrayCopy(value) : [];
						} else if (isPlainObject(srcValue) || isArguments(srcValue)) {
							result = isArguments(value) ? toPlainObject(value) : isPlainObject(value) ? value : {};
						} else {
							isCommon = false;
						}
					}

					stackA.push(srcValue);
					stackB.push(result);

					if (isCommon) {
						object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
					} else if (result === result ? result !== value : value === value) {
						object[key] = result;
					}
				}

				function baseProperty(key) {
					return function (object) {
						return object == null ? undefined : object[key];
					};
				}

				function basePropertyDeep(path) {
					var pathKey = path + "";
					path = toPath(path);
					return function (object) {
						return baseGet(object, path, pathKey);
					};
				}

				function basePullAt(array, indexes) {
					var length = array ? indexes.length : 0;
					while (length--) {
						var index = indexes[length];
						if (index != previous && isIndex(index)) {
							var previous = index;
							splice.call(array, index, 1);
						}
					}
					return array;
				}

				function baseRandom(min, max) {
					return min + nativeFloor(nativeRandom() * (max - min + 1));
				}

				function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
					eachFunc(collection, function (value, index, collection) {
						accumulator = initFromCollection ? (initFromCollection = false, value) : iteratee(accumulator, value, index, collection);
					});
					return accumulator;
				}

				var baseSetData = !metaMap ? identity : function (func, data) {
					metaMap.set(func, data);
					return func;
				};

				function baseSlice(array, start, end) {
					var index = -1,
					    length = array.length;

					start = start == null ? 0 : +start || 0;
					if (start < 0) {
						start = -start > length ? 0 : length + start;
					}
					end = end === undefined || end > length ? length : +end || 0;
					if (end < 0) {
						end += length;
					}
					length = start > end ? 0 : end - start >>> 0;
					start >>>= 0;

					var result = Array(length);
					while (++index < length) {
						result[index] = array[index + start];
					}
					return result;
				}

				function baseSome(collection, predicate) {
					var result;

					baseEach(collection, function (value, index, collection) {
						result = predicate(value, index, collection);
						return !result;
					});
					return !!result;
				}

				function baseSortBy(array, comparer) {
					var length = array.length;

					array.sort(comparer);
					while (length--) {
						array[length] = array[length].value;
					}
					return array;
				}

				function baseSortByOrder(collection, iteratees, orders) {
					var callback = getCallback(),
					    index = -1;

					iteratees = arrayMap(iteratees, function (iteratee) {
						return callback(iteratee);
					});

					var result = baseMap(collection, function (value) {
						var criteria = arrayMap(iteratees, function (iteratee) {
							return iteratee(value);
						});
						return { criteria: criteria, index: ++index, value: value };
					});

					return baseSortBy(result, function (object, other) {
						return compareMultiple(object, other, orders);
					});
				}

				function baseSum(collection, iteratee) {
					var result = 0;
					baseEach(collection, function (value, index, collection) {
						result += +iteratee(value, index, collection) || 0;
					});
					return result;
				}

				function baseUniq(array, iteratee) {
					var index = -1,
					    indexOf = getIndexOf(),
					    length = array.length,
					    isCommon = indexOf == baseIndexOf,
					    isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
					    seen = isLarge ? createCache() : null,
					    result = [];

					if (seen) {
						indexOf = cacheIndexOf;
						isCommon = false;
					} else {
						isLarge = false;
						seen = iteratee ? [] : result;
					}
					outer: while (++index < length) {
						var value = array[index],
						    computed = iteratee ? iteratee(value, index, array) : value;

						if (isCommon && value === value) {
							var seenIndex = seen.length;
							while (seenIndex--) {
								if (seen[seenIndex] === computed) {
									continue outer;
								}
							}
							if (iteratee) {
								seen.push(computed);
							}
							result.push(value);
						} else if (indexOf(seen, computed, 0) < 0) {
							if (iteratee || isLarge) {
								seen.push(computed);
							}
							result.push(value);
						}
					}
					return result;
				}

				function baseValues(object, props) {
					var index = -1,
					    length = props.length,
					    result = Array(length);

					while (++index < length) {
						result[index] = object[props[index]];
					}
					return result;
				}

				function baseWhile(array, predicate, isDrop, fromRight) {
					var length = array.length,
					    index = fromRight ? length : -1;

					while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
					return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
				}

				function baseWrapperValue(value, actions) {
					var result = value;
					if (result instanceof LazyWrapper) {
						result = result.value();
					}
					var index = -1,
					    length = actions.length;

					while (++index < length) {
						var action = actions[index];
						result = action.func.apply(action.thisArg, arrayPush([result], action.args));
					}
					return result;
				}

				function binaryIndex(array, value, retHighest) {
					var low = 0,
					    high = array ? array.length : low;

					if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
						while (low < high) {
							var mid = low + high >>> 1,
							    computed = array[mid];

							if ((retHighest ? computed <= value : computed < value) && computed !== null) {
								low = mid + 1;
							} else {
								high = mid;
							}
						}
						return high;
					}
					return binaryIndexBy(array, value, identity, retHighest);
				}

				function binaryIndexBy(array, value, iteratee, retHighest) {
					value = iteratee(value);

					var low = 0,
					    high = array ? array.length : 0,
					    valIsNaN = value !== value,
					    valIsNull = value === null,
					    valIsUndef = value === undefined;

					while (low < high) {
						var mid = nativeFloor((low + high) / 2),
						    computed = iteratee(array[mid]),
						    isDef = computed !== undefined,
						    isReflexive = computed === computed;

						if (valIsNaN) {
							var setLow = isReflexive || retHighest;
						} else if (valIsNull) {
							setLow = isReflexive && isDef && (retHighest || computed != null);
						} else if (valIsUndef) {
							setLow = isReflexive && (retHighest || isDef);
						} else if (computed == null) {
							setLow = false;
						} else {
							setLow = retHighest ? computed <= value : computed < value;
						}
						if (setLow) {
							low = mid + 1;
						} else {
							high = mid;
						}
					}
					return nativeMin(high, MAX_ARRAY_INDEX);
				}

				function bindCallback(func, thisArg, argCount) {
					if (typeof func != "function") {
						return identity;
					}
					if (thisArg === undefined) {
						return func;
					}
					switch (argCount) {
						case 1:
							return function (value) {
								return func.call(thisArg, value);
							};
						case 3:
							return function (value, index, collection) {
								return func.call(thisArg, value, index, collection);
							};
						case 4:
							return function (accumulator, value, index, collection) {
								return func.call(thisArg, accumulator, value, index, collection);
							};
						case 5:
							return function (value, other, key, object, source) {
								return func.call(thisArg, value, other, key, object, source);
							};
					}
					return function () {
						return func.apply(thisArg, arguments);
					};
				}

				function bufferClone(buffer) {
					var result = new ArrayBuffer(buffer.byteLength),
					    view = new Uint8Array(result);

					view.set(new Uint8Array(buffer));
					return result;
				}

				function composeArgs(args, partials, holders) {
					var holdersLength = holders.length,
					    argsIndex = -1,
					    argsLength = nativeMax(args.length - holdersLength, 0),
					    leftIndex = -1,
					    leftLength = partials.length,
					    result = Array(leftLength + argsLength);

					while (++leftIndex < leftLength) {
						result[leftIndex] = partials[leftIndex];
					}
					while (++argsIndex < holdersLength) {
						result[holders[argsIndex]] = args[argsIndex];
					}
					while (argsLength--) {
						result[leftIndex++] = args[argsIndex++];
					}
					return result;
				}

				function composeArgsRight(args, partials, holders) {
					var holdersIndex = -1,
					    holdersLength = holders.length,
					    argsIndex = -1,
					    argsLength = nativeMax(args.length - holdersLength, 0),
					    rightIndex = -1,
					    rightLength = partials.length,
					    result = Array(argsLength + rightLength);

					while (++argsIndex < argsLength) {
						result[argsIndex] = args[argsIndex];
					}
					var offset = argsIndex;
					while (++rightIndex < rightLength) {
						result[offset + rightIndex] = partials[rightIndex];
					}
					while (++holdersIndex < holdersLength) {
						result[offset + holders[holdersIndex]] = args[argsIndex++];
					}
					return result;
				}

				function createAggregator(setter, initializer) {
					return function (collection, iteratee, thisArg) {
						var result = initializer ? initializer() : {};
						iteratee = getCallback(iteratee, thisArg, 3);

						if (isArray(collection)) {
							var index = -1,
							    length = collection.length;

							while (++index < length) {
								var value = collection[index];
								setter(result, value, iteratee(value, index, collection), collection);
							}
						} else {
							baseEach(collection, function (value, key, collection) {
								setter(result, value, iteratee(value, key, collection), collection);
							});
						}
						return result;
					};
				}

				function createAssigner(assigner) {
					return restParam(function (object, sources) {
						var index = -1,
						    length = object == null ? 0 : sources.length,
						    customizer = length > 2 ? sources[length - 2] : undefined,
						    guard = length > 2 ? sources[2] : undefined,
						    thisArg = length > 1 ? sources[length - 1] : undefined;

						if (typeof customizer == "function") {
							customizer = bindCallback(customizer, thisArg, 5);
							length -= 2;
						} else {
							customizer = typeof thisArg == "function" ? thisArg : undefined;
							length -= customizer ? 1 : 0;
						}
						if (guard && isIterateeCall(sources[0], sources[1], guard)) {
							customizer = length < 3 ? undefined : customizer;
							length = 1;
						}
						while (++index < length) {
							var source = sources[index];
							if (source) {
								assigner(object, source, customizer);
							}
						}
						return object;
					});
				}

				function createBaseEach(eachFunc, fromRight) {
					return function (collection, iteratee) {
						var length = collection ? getLength(collection) : 0;
						if (!isLength(length)) {
							return eachFunc(collection, iteratee);
						}
						var index = fromRight ? length : -1,
						    iterable = toObject(collection);

						while (fromRight ? index-- : ++index < length) {
							if (iteratee(iterable[index], index, iterable) === false) {
								break;
							}
						}
						return collection;
					};
				}

				function createBaseFor(fromRight) {
					return function (object, iteratee, keysFunc) {
						var iterable = toObject(object),
						    props = keysFunc(object),
						    length = props.length,
						    index = fromRight ? length : -1;

						while (fromRight ? index-- : ++index < length) {
							var key = props[index];
							if (iteratee(iterable[key], key, iterable) === false) {
								break;
							}
						}
						return object;
					};
				}

				function createBindWrapper(func, thisArg) {
					var Ctor = createCtorWrapper(func);

					function wrapper() {
						var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
						return fn.apply(thisArg, arguments);
					}
					return wrapper;
				}

				function createCache(values) {
					return nativeCreate && Set ? new SetCache(values) : null;
				}

				function createCompounder(callback) {
					return function (string) {
						var index = -1,
						    array = words(deburr(string)),
						    length = array.length,
						    result = "";

						while (++index < length) {
							result = callback(result, array[index], index);
						}
						return result;
					};
				}

				function createCtorWrapper(Ctor) {
					return function () {
						var args = arguments;
						switch (args.length) {
							case 0:
								return new Ctor();
							case 1:
								return new Ctor(args[0]);
							case 2:
								return new Ctor(args[0], args[1]);
							case 3:
								return new Ctor(args[0], args[1], args[2]);
							case 4:
								return new Ctor(args[0], args[1], args[2], args[3]);
							case 5:
								return new Ctor(args[0], args[1], args[2], args[3], args[4]);
							case 6:
								return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
							case 7:
								return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
						}
						var thisBinding = baseCreate(Ctor.prototype),
						    result = Ctor.apply(thisBinding, args);

						return isObject(result) ? result : thisBinding;
					};
				}

				function createCurry(flag) {
					function curryFunc(func, arity, guard) {
						if (guard && isIterateeCall(func, arity, guard)) {
							arity = undefined;
						}
						var result = createWrapper(func, flag, undefined, undefined, undefined, undefined, undefined, arity);
						result.placeholder = curryFunc.placeholder;
						return result;
					}
					return curryFunc;
				}

				function createDefaults(assigner, customizer) {
					return restParam(function (args) {
						var object = args[0];
						if (object == null) {
							return object;
						}
						args.push(customizer);
						return assigner.apply(undefined, args);
					});
				}

				function createExtremum(comparator, exValue) {
					return function (collection, iteratee, thisArg) {
						if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
							iteratee = undefined;
						}
						iteratee = getCallback(iteratee, thisArg, 3);
						if (iteratee.length == 1) {
							collection = isArray(collection) ? collection : toIterable(collection);
							var result = arrayExtremum(collection, iteratee, comparator, exValue);
							if (!(collection.length && result === exValue)) {
								return result;
							}
						}
						return baseExtremum(collection, iteratee, comparator, exValue);
					};
				}

				function createFind(eachFunc, fromRight) {
					return function (collection, predicate, thisArg) {
						predicate = getCallback(predicate, thisArg, 3);
						if (isArray(collection)) {
							var index = baseFindIndex(collection, predicate, fromRight);
							return index > -1 ? collection[index] : undefined;
						}
						return baseFind(collection, predicate, eachFunc);
					};
				}

				function createFindIndex(fromRight) {
					return function (array, predicate, thisArg) {
						if (!(array && array.length)) {
							return -1;
						}
						predicate = getCallback(predicate, thisArg, 3);
						return baseFindIndex(array, predicate, fromRight);
					};
				}

				function createFindKey(objectFunc) {
					return function (object, predicate, thisArg) {
						predicate = getCallback(predicate, thisArg, 3);
						return baseFind(object, predicate, objectFunc, true);
					};
				}

				function createFlow(fromRight) {
					return function () {
						var wrapper,
						    length = arguments.length,
						    index = fromRight ? length : -1,
						    leftIndex = 0,
						    funcs = Array(length);

						while (fromRight ? index-- : ++index < length) {
							var func = funcs[leftIndex++] = arguments[index];
							if (typeof func != "function") {
								throw new TypeError(FUNC_ERROR_TEXT);
							}
							if (!wrapper && LodashWrapper.prototype.thru && getFuncName(func) == "wrapper") {
								wrapper = new LodashWrapper([], true);
							}
						}
						index = wrapper ? -1 : length;
						while (++index < length) {
							func = funcs[index];

							var funcName = getFuncName(func),
							    data = funcName == "wrapper" ? getData(func) : undefined;

							if (data && isLaziable(data[0]) && data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) && !data[4].length && data[9] == 1) {
								wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
							} else {
								wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
							}
						}
						return function () {
							var args = arguments,
							    value = args[0];

							if (wrapper && args.length == 1 && isArray(value) && value.length >= LARGE_ARRAY_SIZE) {
								return wrapper.plant(value).value();
							}
							var index = 0,
							    result = length ? funcs[index].apply(this, args) : value;

							while (++index < length) {
								result = funcs[index].call(this, result);
							}
							return result;
						};
					};
				}

				function createForEach(arrayFunc, eachFunc) {
					return function (collection, iteratee, thisArg) {
						return typeof iteratee == "function" && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee) : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
					};
				}

				function createForIn(objectFunc) {
					return function (object, iteratee, thisArg) {
						if (typeof iteratee != "function" || thisArg !== undefined) {
							iteratee = bindCallback(iteratee, thisArg, 3);
						}
						return objectFunc(object, iteratee, keysIn);
					};
				}

				function createForOwn(objectFunc) {
					return function (object, iteratee, thisArg) {
						if (typeof iteratee != "function" || thisArg !== undefined) {
							iteratee = bindCallback(iteratee, thisArg, 3);
						}
						return objectFunc(object, iteratee);
					};
				}

				function createObjectMapper(isMapKeys) {
					return function (object, iteratee, thisArg) {
						var result = {};
						iteratee = getCallback(iteratee, thisArg, 3);

						baseForOwn(object, function (value, key, object) {
							var mapped = iteratee(value, key, object);
							key = isMapKeys ? mapped : key;
							value = isMapKeys ? value : mapped;
							result[key] = value;
						});
						return result;
					};
				}

				function createPadDir(fromRight) {
					return function (string, length, chars) {
						string = baseToString(string);
						return (fromRight ? string : "") + createPadding(string, length, chars) + (fromRight ? "" : string);
					};
				}

				function createPartial(flag) {
					var partialFunc = restParam(function (func, partials) {
						var holders = replaceHolders(partials, partialFunc.placeholder);
						return createWrapper(func, flag, undefined, partials, holders);
					});
					return partialFunc;
				}

				function createReduce(arrayFunc, eachFunc) {
					return function (collection, iteratee, accumulator, thisArg) {
						var initFromArray = arguments.length < 3;
						return typeof iteratee == "function" && thisArg === undefined && isArray(collection) ? arrayFunc(collection, iteratee, accumulator, initFromArray) : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
					};
				}

				function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
					var isAry = bitmask & ARY_FLAG,
					    isBind = bitmask & BIND_FLAG,
					    isBindKey = bitmask & BIND_KEY_FLAG,
					    isCurry = bitmask & CURRY_FLAG,
					    isCurryBound = bitmask & CURRY_BOUND_FLAG,
					    isCurryRight = bitmask & CURRY_RIGHT_FLAG,
					    Ctor = isBindKey ? undefined : createCtorWrapper(func);

					function wrapper() {
						var length = arguments.length,
						    index = length,
						    args = Array(length);

						while (index--) {
							args[index] = arguments[index];
						}
						if (partials) {
							args = composeArgs(args, partials, holders);
						}
						if (partialsRight) {
							args = composeArgsRight(args, partialsRight, holdersRight);
						}
						if (isCurry || isCurryRight) {
							var placeholder = wrapper.placeholder,
							    argsHolders = replaceHolders(args, placeholder);

							length -= argsHolders.length;
							if (length < arity) {
								var newArgPos = argPos ? arrayCopy(argPos) : undefined,
								    newArity = nativeMax(arity - length, 0),
								    newsHolders = isCurry ? argsHolders : undefined,
								    newHoldersRight = isCurry ? undefined : argsHolders,
								    newPartials = isCurry ? args : undefined,
								    newPartialsRight = isCurry ? undefined : args;

								bitmask |= isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG;
								bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

								if (!isCurryBound) {
									bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
								}
								var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
								    result = createHybridWrapper.apply(undefined, newData);

								if (isLaziable(func)) {
									setData(result, newData);
								}
								result.placeholder = placeholder;
								return result;
							}
						}
						var thisBinding = isBind ? thisArg : this,
						    fn = isBindKey ? thisBinding[func] : func;

						if (argPos) {
							args = reorder(args, argPos);
						}
						if (isAry && ary < args.length) {
							args.length = ary;
						}
						if (this && this !== root && this instanceof wrapper) {
							fn = Ctor || createCtorWrapper(func);
						}
						return fn.apply(thisBinding, args);
					}
					return wrapper;
				}

				function createPadding(string, length, chars) {
					var strLength = string.length;
					length = +length;

					if (strLength >= length || !nativeIsFinite(length)) {
						return "";
					}
					var padLength = length - strLength;
					chars = chars == null ? " " : chars + "";
					return repeat(chars, nativeCeil(padLength / chars.length)).slice(0, padLength);
				}

				function createPartialWrapper(func, bitmask, thisArg, partials) {
					var isBind = bitmask & BIND_FLAG,
					    Ctor = createCtorWrapper(func);

					function wrapper() {
						var argsIndex = -1,
						    argsLength = arguments.length,
						    leftIndex = -1,
						    leftLength = partials.length,
						    args = Array(leftLength + argsLength);

						while (++leftIndex < leftLength) {
							args[leftIndex] = partials[leftIndex];
						}
						while (argsLength--) {
							args[leftIndex++] = arguments[++argsIndex];
						}
						var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
						return fn.apply(isBind ? thisArg : this, args);
					}
					return wrapper;
				}

				function createRound(methodName) {
					var func = Math[methodName];
					return function (number, precision) {
						precision = precision === undefined ? 0 : +precision || 0;
						if (precision) {
							precision = pow(10, precision);
							return func(number * precision) / precision;
						}
						return func(number);
					};
				}

				function createSortedIndex(retHighest) {
					return function (array, value, iteratee, thisArg) {
						var callback = getCallback(iteratee);
						return iteratee == null && callback === baseCallback ? binaryIndex(array, value, retHighest) : binaryIndexBy(array, value, callback(iteratee, thisArg, 1), retHighest);
					};
				}

				function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
					var isBindKey = bitmask & BIND_KEY_FLAG;
					if (!isBindKey && typeof func != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					var length = partials ? partials.length : 0;
					if (!length) {
						bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
						partials = holders = undefined;
					}
					length -= holders ? holders.length : 0;
					if (bitmask & PARTIAL_RIGHT_FLAG) {
						var partialsRight = partials,
						    holdersRight = holders;

						partials = holders = undefined;
					}
					var data = isBindKey ? undefined : getData(func),
					    newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];

					if (data) {
						mergeData(newData, data);
						bitmask = newData[1];
						arity = newData[9];
					}
					newData[9] = arity == null ? isBindKey ? 0 : func.length : nativeMax(arity - length, 0) || 0;

					if (bitmask == BIND_FLAG) {
						var result = createBindWrapper(newData[0], newData[2]);
					} else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
						result = createPartialWrapper.apply(undefined, newData);
					} else {
						result = createHybridWrapper.apply(undefined, newData);
					}
					var setter = data ? baseSetData : setData;
					return setter(result, newData);
				}

				function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
					var index = -1,
					    arrLength = array.length,
					    othLength = other.length;

					if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
						return false;
					}

					while (++index < arrLength) {
						var arrValue = array[index],
						    othValue = other[index],
						    result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

						if (result !== undefined) {
							if (result) {
								continue;
							}
							return false;
						}

						if (isLoose) {
							if (!arraySome(other, function (othValue) {
								return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
							})) {
								return false;
							}
						} else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
							return false;
						}
					}
					return true;
				}

				function equalByTag(object, other, tag) {
					switch (tag) {
						case boolTag:
						case dateTag:
							return +object == +other;

						case errorTag:
							return object.name == other.name && object.message == other.message;

						case numberTag:
							return object != +object ? other != +other : object == +other;

						case regexpTag:
						case stringTag:
							return object == other + "";
					}
					return false;
				}

				function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
					var objProps = keys(object),
					    objLength = objProps.length,
					    othProps = keys(other),
					    othLength = othProps.length;

					if (objLength != othLength && !isLoose) {
						return false;
					}
					var index = objLength;
					while (index--) {
						var key = objProps[index];
						if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
							return false;
						}
					}
					var skipCtor = isLoose;
					while (++index < objLength) {
						key = objProps[index];
						var objValue = object[key],
						    othValue = other[key],
						    result = customizer ? customizer(isLoose ? othValue : objValue, isLoose ? objValue : othValue, key) : undefined;

						if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
							return false;
						}
						skipCtor || (skipCtor = key == "constructor");
					}
					if (!skipCtor) {
						var objCtor = object.constructor,
						    othCtor = other.constructor;

						if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
							return false;
						}
					}
					return true;
				}

				function getCallback(func, thisArg, argCount) {
					var result = lodash.callback || callback;
					result = result === callback ? baseCallback : result;
					return argCount ? result(func, thisArg, argCount) : result;
				}

				var getData = !metaMap ? noop : function (func) {
					return metaMap.get(func);
				};

				function getFuncName(func) {
					var result = func.name,
					    array = realNames[result],
					    length = array ? array.length : 0;

					while (length--) {
						var data = array[length],
						    otherFunc = data.func;
						if (otherFunc == null || otherFunc == func) {
							return data.name;
						}
					}
					return result;
				}

				function getIndexOf(collection, target, fromIndex) {
					var result = lodash.indexOf || indexOf;
					result = result === indexOf ? baseIndexOf : result;
					return collection ? result(collection, target, fromIndex) : result;
				}

				var getLength = baseProperty("length");

				function getMatchData(object) {
					var result = pairs(object),
					    length = result.length;

					while (length--) {
						result[length][2] = isStrictComparable(result[length][1]);
					}
					return result;
				}

				function getNative(object, key) {
					var value = object == null ? undefined : object[key];
					return isNative(value) ? value : undefined;
				}

				function getView(start, end, transforms) {
					var index = -1,
					    length = transforms.length;

					while (++index < length) {
						var data = transforms[index],
						    size = data.size;

						switch (data.type) {
							case "drop":
								start += size;break;
							case "dropRight":
								end -= size;break;
							case "take":
								end = nativeMin(end, start + size);break;
							case "takeRight":
								start = nativeMax(start, end - size);break;
						}
					}
					return { start: start, end: end };
				}

				function initCloneArray(array) {
					var length = array.length,
					    result = new array.constructor(length);

					if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
						result.index = array.index;
						result.input = array.input;
					}
					return result;
				}

				function initCloneObject(object) {
					var Ctor = object.constructor;
					if (!(typeof Ctor == "function" && Ctor instanceof Ctor)) {
						Ctor = Object;
					}
					return new Ctor();
				}

				function initCloneByTag(object, tag, isDeep) {
					var Ctor = object.constructor;
					switch (tag) {
						case arrayBufferTag:
							return bufferClone(object);

						case boolTag:
						case dateTag:
							return new Ctor(+object);

						case float32Tag:case float64Tag:
						case int8Tag:case int16Tag:case int32Tag:
						case uint8Tag:case uint8ClampedTag:case uint16Tag:case uint32Tag:
							var buffer = object.buffer;
							return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

						case numberTag:
						case stringTag:
							return new Ctor(object);

						case regexpTag:
							var result = new Ctor(object.source, reFlags.exec(object));
							result.lastIndex = object.lastIndex;
					}
					return result;
				}

				function invokePath(object, path, args) {
					if (object != null && !isKey(path, object)) {
						path = toPath(path);
						object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
						path = last(path);
					}
					var func = object == null ? object : object[path];
					return func == null ? undefined : func.apply(object, args);
				}

				function isArrayLike(value) {
					return value != null && isLength(getLength(value));
				}

				function isIndex(value, length) {
					value = typeof value == "number" || reIsUint.test(value) ? +value : -1;
					length = length == null ? MAX_SAFE_INTEGER : length;
					return value > -1 && value % 1 == 0 && value < length;
				}

				function isIterateeCall(value, index, object) {
					if (!isObject(object)) {
						return false;
					}
					var type = typeof index;
					if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
						var other = object[index];
						return value === value ? value === other : other !== other;
					}
					return false;
				}

				function isKey(value, object) {
					var type = typeof value;
					if (type == "string" && reIsPlainProp.test(value) || type == "number") {
						return true;
					}
					if (isArray(value)) {
						return false;
					}
					var result = !reIsDeepProp.test(value);
					return result || object != null && value in toObject(object);
				}

				function isLaziable(func) {
					var funcName = getFuncName(func);
					if (!(funcName in LazyWrapper.prototype)) {
						return false;
					}
					var other = lodash[funcName];
					if (func === other) {
						return true;
					}
					var data = getData(other);
					return !!data && func === data[0];
				}

				function isLength(value) {
					return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
				}

				function isStrictComparable(value) {
					return value === value && !isObject(value);
				}

				function mergeData(data, source) {
					var bitmask = data[1],
					    srcBitmask = source[1],
					    newBitmask = bitmask | srcBitmask,
					    isCommon = newBitmask < ARY_FLAG;

					var isCombo = srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG || srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8] || srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG;

					if (!(isCommon || isCombo)) {
						return data;
					}

					if (srcBitmask & BIND_FLAG) {
						data[2] = source[2];

						newBitmask |= bitmask & BIND_FLAG ? 0 : CURRY_BOUND_FLAG;
					}

					var value = source[3];
					if (value) {
						var partials = data[3];
						data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
						data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
					}

					value = source[5];
					if (value) {
						partials = data[5];
						data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
						data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
					}

					value = source[7];
					if (value) {
						data[7] = arrayCopy(value);
					}

					if (srcBitmask & ARY_FLAG) {
						data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
					}

					if (data[9] == null) {
						data[9] = source[9];
					}

					data[0] = source[0];
					data[1] = newBitmask;

					return data;
				}

				function mergeDefaults(objectValue, sourceValue) {
					return objectValue === undefined ? sourceValue : merge(objectValue, sourceValue, mergeDefaults);
				}

				function pickByArray(object, props) {
					object = toObject(object);

					var index = -1,
					    length = props.length,
					    result = {};

					while (++index < length) {
						var key = props[index];
						if (key in object) {
							result[key] = object[key];
						}
					}
					return result;
				}

				function pickByCallback(object, predicate) {
					var result = {};
					baseForIn(object, function (value, key, object) {
						if (predicate(value, key, object)) {
							result[key] = value;
						}
					});
					return result;
				}

				function reorder(array, indexes) {
					var arrLength = array.length,
					    length = nativeMin(indexes.length, arrLength),
					    oldArray = arrayCopy(array);

					while (length--) {
						var index = indexes[length];
						array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
					}
					return array;
				}

				var setData = (function () {
					var count = 0,
					    lastCalled = 0;

					return function (key, value) {
						var stamp = now(),
						    remaining = HOT_SPAN - (stamp - lastCalled);

						lastCalled = stamp;
						if (remaining > 0) {
							if (++count >= HOT_COUNT) {
								return key;
							}
						} else {
							count = 0;
						}
						return baseSetData(key, value);
					};
				})();

				function shimKeys(object) {
					var props = keysIn(object),
					    propsLength = props.length,
					    length = propsLength && object.length;

					var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object));

					var index = -1,
					    result = [];

					while (++index < propsLength) {
						var key = props[index];
						if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
							result.push(key);
						}
					}
					return result;
				}

				function toIterable(value) {
					if (value == null) {
						return [];
					}
					if (!isArrayLike(value)) {
						return values(value);
					}
					return isObject(value) ? value : Object(value);
				}

				function toObject(value) {
					return isObject(value) ? value : Object(value);
				}

				function toPath(value) {
					if (isArray(value)) {
						return value;
					}
					var result = [];
					baseToString(value).replace(rePropName, function (match, number, quote, string) {
						result.push(quote ? string.replace(reEscapeChar, "$1") : number || match);
					});
					return result;
				}

				function wrapperClone(wrapper) {
					return wrapper instanceof LazyWrapper ? wrapper.clone() : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
				}

				function chunk(array, size, guard) {
					if (guard ? isIterateeCall(array, size, guard) : size == null) {
						size = 1;
					} else {
						size = nativeMax(nativeFloor(size) || 1, 1);
					}
					var index = 0,
					    length = array ? array.length : 0,
					    resIndex = -1,
					    result = Array(nativeCeil(length / size));

					while (index < length) {
						result[++resIndex] = baseSlice(array, index, index += size);
					}
					return result;
				}

				function compact(array) {
					var index = -1,
					    length = array ? array.length : 0,
					    resIndex = -1,
					    result = [];

					while (++index < length) {
						var value = array[index];
						if (value) {
							result[++resIndex] = value;
						}
					}
					return result;
				}

				var difference = restParam(function (array, values) {
					return isObjectLike(array) && isArrayLike(array) ? baseDifference(array, baseFlatten(values, false, true)) : [];
				});

				function drop(array, n, guard) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (guard ? isIterateeCall(array, n, guard) : n == null) {
						n = 1;
					}
					return baseSlice(array, n < 0 ? 0 : n);
				}

				function dropRight(array, n, guard) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (guard ? isIterateeCall(array, n, guard) : n == null) {
						n = 1;
					}
					n = length - (+n || 0);
					return baseSlice(array, 0, n < 0 ? 0 : n);
				}

				function dropRightWhile(array, predicate, thisArg) {
					return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3), true, true) : [];
				}

				function dropWhile(array, predicate, thisArg) {
					return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3), true) : [];
				}

				function fill(array, value, start, end) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
						start = 0;
						end = length;
					}
					return baseFill(array, value, start, end);
				}

				var findIndex = createFindIndex();

				var findLastIndex = createFindIndex(true);

				function first(array) {
					return array ? array[0] : undefined;
				}

				function flatten(array, isDeep, guard) {
					var length = array ? array.length : 0;
					if (guard && isIterateeCall(array, isDeep, guard)) {
						isDeep = false;
					}
					return length ? baseFlatten(array, isDeep) : [];
				}

				function flattenDeep(array) {
					var length = array ? array.length : 0;
					return length ? baseFlatten(array, true) : [];
				}

				function indexOf(array, value, fromIndex) {
					var length = array ? array.length : 0;
					if (!length) {
						return -1;
					}
					if (typeof fromIndex == "number") {
						fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
					} else if (fromIndex) {
						var index = binaryIndex(array, value);
						if (index < length && (value === value ? value === array[index] : array[index] !== array[index])) {
							return index;
						}
						return -1;
					}
					return baseIndexOf(array, value, fromIndex || 0);
				}

				function initial(array) {
					return dropRight(array, 1);
				}

				var intersection = restParam(function (arrays) {
					var othLength = arrays.length,
					    othIndex = othLength,
					    caches = Array(length),
					    indexOf = getIndexOf(),
					    isCommon = indexOf == baseIndexOf,
					    result = [];

					while (othIndex--) {
						var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
						caches[othIndex] = isCommon && value.length >= 120 ? createCache(othIndex && value) : null;
					}
					var array = arrays[0],
					    index = -1,
					    length = array ? array.length : 0,
					    seen = caches[0];

					outer: while (++index < length) {
						value = array[index];
						if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
							var othIndex = othLength;
							while (--othIndex) {
								var cache = caches[othIndex];
								if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
									continue outer;
								}
							}
							if (seen) {
								seen.push(value);
							}
							result.push(value);
						}
					}
					return result;
				});

				function last(array) {
					var length = array ? array.length : 0;
					return length ? array[length - 1] : undefined;
				}

				function lastIndexOf(array, value, fromIndex) {
					var length = array ? array.length : 0;
					if (!length) {
						return -1;
					}
					var index = length;
					if (typeof fromIndex == "number") {
						index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;
					} else if (fromIndex) {
						index = binaryIndex(array, value, true) - 1;
						var other = array[index];
						if (value === value ? value === other : other !== other) {
							return index;
						}
						return -1;
					}
					if (value !== value) {
						return indexOfNaN(array, index, true);
					}
					while (index--) {
						if (array[index] === value) {
							return index;
						}
					}
					return -1;
				}

				function pull() {
					var args = arguments,
					    array = args[0];

					if (!(array && array.length)) {
						return array;
					}
					var index = 0,
					    indexOf = getIndexOf(),
					    length = args.length;

					while (++index < length) {
						var fromIndex = 0,
						    value = args[index];

						while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {
							splice.call(array, fromIndex, 1);
						}
					}
					return array;
				}

				var pullAt = restParam(function (array, indexes) {
					indexes = baseFlatten(indexes);

					var result = baseAt(array, indexes);
					basePullAt(array, indexes.sort(baseCompareAscending));
					return result;
				});

				function remove(array, predicate, thisArg) {
					var result = [];
					if (!(array && array.length)) {
						return result;
					}
					var index = -1,
					    indexes = [],
					    length = array.length;

					predicate = getCallback(predicate, thisArg, 3);
					while (++index < length) {
						var value = array[index];
						if (predicate(value, index, array)) {
							result.push(value);
							indexes.push(index);
						}
					}
					basePullAt(array, indexes);
					return result;
				}

				function rest(array) {
					return drop(array, 1);
				}

				function slice(array, start, end) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (end && typeof end != "number" && isIterateeCall(array, start, end)) {
						start = 0;
						end = length;
					}
					return baseSlice(array, start, end);
				}

				var sortedIndex = createSortedIndex();

				var sortedLastIndex = createSortedIndex(true);

				function take(array, n, guard) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (guard ? isIterateeCall(array, n, guard) : n == null) {
						n = 1;
					}
					return baseSlice(array, 0, n < 0 ? 0 : n);
				}

				function takeRight(array, n, guard) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (guard ? isIterateeCall(array, n, guard) : n == null) {
						n = 1;
					}
					n = length - (+n || 0);
					return baseSlice(array, n < 0 ? 0 : n);
				}

				function takeRightWhile(array, predicate, thisArg) {
					return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3), false, true) : [];
				}

				function takeWhile(array, predicate, thisArg) {
					return array && array.length ? baseWhile(array, getCallback(predicate, thisArg, 3)) : [];
				}

				var union = restParam(function (arrays) {
					return baseUniq(baseFlatten(arrays, false, true));
				});

				function uniq(array, isSorted, iteratee, thisArg) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					if (isSorted != null && typeof isSorted != "boolean") {
						thisArg = iteratee;
						iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
						isSorted = false;
					}
					var callback = getCallback();
					if (!(iteratee == null && callback === baseCallback)) {
						iteratee = callback(iteratee, thisArg, 3);
					}
					return isSorted && getIndexOf() == baseIndexOf ? sortedUniq(array, iteratee) : baseUniq(array, iteratee);
				}

				function unzip(array) {
					if (!(array && array.length)) {
						return [];
					}
					var index = -1,
					    length = 0;

					array = arrayFilter(array, function (group) {
						if (isArrayLike(group)) {
							length = nativeMax(group.length, length);
							return true;
						}
					});
					var result = Array(length);
					while (++index < length) {
						result[index] = arrayMap(array, baseProperty(index));
					}
					return result;
				}

				function unzipWith(array, iteratee, thisArg) {
					var length = array ? array.length : 0;
					if (!length) {
						return [];
					}
					var result = unzip(array);
					if (iteratee == null) {
						return result;
					}
					iteratee = bindCallback(iteratee, thisArg, 4);
					return arrayMap(result, function (group) {
						return arrayReduce(group, iteratee, undefined, true);
					});
				}

				var without = restParam(function (array, values) {
					return isArrayLike(array) ? baseDifference(array, values) : [];
				});

				function xor() {
					var index = -1,
					    length = arguments.length;

					while (++index < length) {
						var array = arguments[index];
						if (isArrayLike(array)) {
							var result = result ? arrayPush(baseDifference(result, array), baseDifference(array, result)) : array;
						}
					}
					return result ? baseUniq(result) : [];
				}

				var zip = restParam(unzip);

				function zipObject(props, values) {
					var index = -1,
					    length = props ? props.length : 0,
					    result = {};

					if (length && !values && !isArray(props[0])) {
						values = [];
					}
					while (++index < length) {
						var key = props[index];
						if (values) {
							result[key] = values[index];
						} else if (key) {
							result[key[0]] = key[1];
						}
					}
					return result;
				}

				var zipWith = restParam(function (arrays) {
					var length = arrays.length,
					    iteratee = length > 2 ? arrays[length - 2] : undefined,
					    thisArg = length > 1 ? arrays[length - 1] : undefined;

					if (length > 2 && typeof iteratee == "function") {
						length -= 2;
					} else {
						iteratee = length > 1 && typeof thisArg == "function" ? (--length, thisArg) : undefined;
						thisArg = undefined;
					}
					arrays.length = length;
					return unzipWith(arrays, iteratee, thisArg);
				});

				function chain(value) {
					var result = lodash(value);
					result.__chain__ = true;
					return result;
				}

				function tap(value, interceptor, thisArg) {
					interceptor.call(thisArg, value);
					return value;
				}

				function thru(value, interceptor, thisArg) {
					return interceptor.call(thisArg, value);
				}

				function wrapperChain() {
					return chain(this);
				}

				function wrapperCommit() {
					return new LodashWrapper(this.value(), this.__chain__);
				}

				var wrapperConcat = restParam(function (values) {
					values = baseFlatten(values);
					return this.thru(function (array) {
						return arrayConcat(isArray(array) ? array : [toObject(array)], values);
					});
				});

				function wrapperPlant(value) {
					var result,
					    parent = this;

					while (parent instanceof baseLodash) {
						var clone = wrapperClone(parent);
						if (result) {
							previous.__wrapped__ = clone;
						} else {
							result = clone;
						}
						var previous = clone;
						parent = parent.__wrapped__;
					}
					previous.__wrapped__ = value;
					return result;
				}

				function wrapperReverse() {
					var value = this.__wrapped__;

					var interceptor = function interceptor(value) {
						return wrapped && wrapped.__dir__ < 0 ? value : value.reverse();
					};
					if (value instanceof LazyWrapper) {
						var wrapped = value;
						if (this.__actions__.length) {
							wrapped = new LazyWrapper(this);
						}
						wrapped = wrapped.reverse();
						wrapped.__actions__.push({ func: thru, args: [interceptor], thisArg: undefined });
						return new LodashWrapper(wrapped, this.__chain__);
					}
					return this.thru(interceptor);
				}

				function wrapperToString() {
					return this.value() + "";
				}

				function wrapperValue() {
					return baseWrapperValue(this.__wrapped__, this.__actions__);
				}

				var at = restParam(function (collection, props) {
					return baseAt(collection, baseFlatten(props));
				});

				var countBy = createAggregator(function (result, value, key) {
					hasOwnProperty.call(result, key) ? ++result[key] : result[key] = 1;
				});

				function every(collection, predicate, thisArg) {
					var func = isArray(collection) ? arrayEvery : baseEvery;
					if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
						predicate = undefined;
					}
					if (typeof predicate != "function" || thisArg !== undefined) {
						predicate = getCallback(predicate, thisArg, 3);
					}
					return func(collection, predicate);
				}

				function filter(collection, predicate, thisArg) {
					var func = isArray(collection) ? arrayFilter : baseFilter;
					predicate = getCallback(predicate, thisArg, 3);
					return func(collection, predicate);
				}

				var find = createFind(baseEach);

				var findLast = createFind(baseEachRight, true);

				function findWhere(collection, source) {
					return find(collection, baseMatches(source));
				}

				var forEach = createForEach(arrayEach, baseEach);

				var forEachRight = createForEach(arrayEachRight, baseEachRight);

				var groupBy = createAggregator(function (result, value, key) {
					if (hasOwnProperty.call(result, key)) {
						result[key].push(value);
					} else {
						result[key] = [value];
					}
				});

				function includes(collection, target, fromIndex, guard) {
					var length = collection ? getLength(collection) : 0;
					if (!isLength(length)) {
						collection = values(collection);
						length = collection.length;
					}
					if (typeof fromIndex != "number" || guard && isIterateeCall(target, fromIndex, guard)) {
						fromIndex = 0;
					} else {
						fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex || 0;
					}
					return typeof collection == "string" || !isArray(collection) && isString(collection) ? fromIndex <= length && collection.indexOf(target, fromIndex) > -1 : !!length && getIndexOf(collection, target, fromIndex) > -1;
				}

				var indexBy = createAggregator(function (result, value, key) {
					result[key] = value;
				});

				var invoke = restParam(function (collection, path, args) {
					var index = -1,
					    isFunc = typeof path == "function",
					    isProp = isKey(path),
					    result = isArrayLike(collection) ? Array(collection.length) : [];

					baseEach(collection, function (value) {
						var func = isFunc ? path : isProp && value != null ? value[path] : undefined;
						result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
					});
					return result;
				});

				function map(collection, iteratee, thisArg) {
					var func = isArray(collection) ? arrayMap : baseMap;
					iteratee = getCallback(iteratee, thisArg, 3);
					return func(collection, iteratee);
				}

				var partition = createAggregator(function (result, value, key) {
					result[key ? 0 : 1].push(value);
				}, function () {
					return [[], []];
				});

				function pluck(collection, path) {
					return map(collection, property(path));
				}

				var reduce = createReduce(arrayReduce, baseEach);

				var reduceRight = createReduce(arrayReduceRight, baseEachRight);

				function reject(collection, predicate, thisArg) {
					var func = isArray(collection) ? arrayFilter : baseFilter;
					predicate = getCallback(predicate, thisArg, 3);
					return func(collection, function (value, index, collection) {
						return !predicate(value, index, collection);
					});
				}

				function sample(collection, n, guard) {
					if (guard ? isIterateeCall(collection, n, guard) : n == null) {
						collection = toIterable(collection);
						var length = collection.length;
						return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
					}
					var index = -1,
					    result = toArray(collection),
					    length = result.length,
					    lastIndex = length - 1;

					n = nativeMin(n < 0 ? 0 : +n || 0, length);
					while (++index < n) {
						var rand = baseRandom(index, lastIndex),
						    value = result[rand];

						result[rand] = result[index];
						result[index] = value;
					}
					result.length = n;
					return result;
				}

				function shuffle(collection) {
					return sample(collection, POSITIVE_INFINITY);
				}

				function size(collection) {
					var length = collection ? getLength(collection) : 0;
					return isLength(length) ? length : keys(collection).length;
				}

				function some(collection, predicate, thisArg) {
					var func = isArray(collection) ? arraySome : baseSome;
					if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
						predicate = undefined;
					}
					if (typeof predicate != "function" || thisArg !== undefined) {
						predicate = getCallback(predicate, thisArg, 3);
					}
					return func(collection, predicate);
				}

				function sortBy(collection, iteratee, thisArg) {
					if (collection == null) {
						return [];
					}
					if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
						iteratee = undefined;
					}
					var index = -1;
					iteratee = getCallback(iteratee, thisArg, 3);

					var result = baseMap(collection, function (value, key, collection) {
						return { criteria: iteratee(value, key, collection), index: ++index, value: value };
					});
					return baseSortBy(result, compareAscending);
				}

				var sortByAll = restParam(function (collection, iteratees) {
					if (collection == null) {
						return [];
					}
					var guard = iteratees[2];
					if (guard && isIterateeCall(iteratees[0], iteratees[1], guard)) {
						iteratees.length = 1;
					}
					return baseSortByOrder(collection, baseFlatten(iteratees), []);
				});

				function sortByOrder(collection, iteratees, orders, guard) {
					if (collection == null) {
						return [];
					}
					if (guard && isIterateeCall(iteratees, orders, guard)) {
						orders = undefined;
					}
					if (!isArray(iteratees)) {
						iteratees = iteratees == null ? [] : [iteratees];
					}
					if (!isArray(orders)) {
						orders = orders == null ? [] : [orders];
					}
					return baseSortByOrder(collection, iteratees, orders);
				}

				function where(collection, source) {
					return filter(collection, baseMatches(source));
				}

				var now = nativeNow || function () {
					return new Date().getTime();
				};

				function after(n, func) {
					if (typeof func != "function") {
						if (typeof n == "function") {
							var temp = n;
							n = func;
							func = temp;
						} else {
							throw new TypeError(FUNC_ERROR_TEXT);
						}
					}
					n = nativeIsFinite(n = +n) ? n : 0;
					return function () {
						if (--n < 1) {
							return func.apply(this, arguments);
						}
					};
				}

				function ary(func, n, guard) {
					if (guard && isIterateeCall(func, n, guard)) {
						n = undefined;
					}
					n = func && n == null ? func.length : nativeMax(+n || 0, 0);
					return createWrapper(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
				}

				function before(n, func) {
					var result;
					if (typeof func != "function") {
						if (typeof n == "function") {
							var temp = n;
							n = func;
							func = temp;
						} else {
							throw new TypeError(FUNC_ERROR_TEXT);
						}
					}
					return function () {
						if (--n > 0) {
							result = func.apply(this, arguments);
						}
						if (n <= 1) {
							func = undefined;
						}
						return result;
					};
				}

				var bind = restParam(function (func, thisArg, partials) {
					var bitmask = BIND_FLAG;
					if (partials.length) {
						var holders = replaceHolders(partials, bind.placeholder);
						bitmask |= PARTIAL_FLAG;
					}
					return createWrapper(func, bitmask, thisArg, partials, holders);
				});

				var bindAll = restParam(function (object, methodNames) {
					methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);

					var index = -1,
					    length = methodNames.length;

					while (++index < length) {
						var key = methodNames[index];
						object[key] = createWrapper(object[key], BIND_FLAG, object);
					}
					return object;
				});

				var bindKey = restParam(function (object, key, partials) {
					var bitmask = BIND_FLAG | BIND_KEY_FLAG;
					if (partials.length) {
						var holders = replaceHolders(partials, bindKey.placeholder);
						bitmask |= PARTIAL_FLAG;
					}
					return createWrapper(key, bitmask, object, partials, holders);
				});

				var curry = createCurry(CURRY_FLAG);

				var curryRight = createCurry(CURRY_RIGHT_FLAG);

				function debounce(func, wait, options) {
					var args,
					    maxTimeoutId,
					    result,
					    stamp,
					    thisArg,
					    timeoutId,
					    trailingCall,
					    lastCalled = 0,
					    maxWait = false,
					    trailing = true;

					if (typeof func != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					wait = wait < 0 ? 0 : +wait || 0;
					if (options === true) {
						var leading = true;
						trailing = false;
					} else if (isObject(options)) {
						leading = !!options.leading;
						maxWait = "maxWait" in options && nativeMax(+options.maxWait || 0, wait);
						trailing = "trailing" in options ? !!options.trailing : trailing;
					}

					function cancel() {
						if (timeoutId) {
							clearTimeout(timeoutId);
						}
						if (maxTimeoutId) {
							clearTimeout(maxTimeoutId);
						}
						lastCalled = 0;
						maxTimeoutId = timeoutId = trailingCall = undefined;
					}

					function complete(isCalled, id) {
						if (id) {
							clearTimeout(id);
						}
						maxTimeoutId = timeoutId = trailingCall = undefined;
						if (isCalled) {
							lastCalled = now();
							result = func.apply(thisArg, args);
							if (!timeoutId && !maxTimeoutId) {
								args = thisArg = undefined;
							}
						}
					}

					function delayed() {
						var remaining = wait - (now() - stamp);
						if (remaining <= 0 || remaining > wait) {
							complete(trailingCall, maxTimeoutId);
						} else {
							timeoutId = setTimeout(delayed, remaining);
						}
					}

					function maxDelayed() {
						complete(trailing, timeoutId);
					}

					function debounced() {
						args = arguments;
						stamp = now();
						thisArg = this;
						trailingCall = trailing && (timeoutId || !leading);

						if (maxWait === false) {
							var leadingCall = leading && !timeoutId;
						} else {
							if (!maxTimeoutId && !leading) {
								lastCalled = stamp;
							}
							var remaining = maxWait - (stamp - lastCalled),
							    isCalled = remaining <= 0 || remaining > maxWait;

							if (isCalled) {
								if (maxTimeoutId) {
									maxTimeoutId = clearTimeout(maxTimeoutId);
								}
								lastCalled = stamp;
								result = func.apply(thisArg, args);
							} else if (!maxTimeoutId) {
								maxTimeoutId = setTimeout(maxDelayed, remaining);
							}
						}
						if (isCalled && timeoutId) {
							timeoutId = clearTimeout(timeoutId);
						} else if (!timeoutId && wait !== maxWait) {
							timeoutId = setTimeout(delayed, wait);
						}
						if (leadingCall) {
							isCalled = true;
							result = func.apply(thisArg, args);
						}
						if (isCalled && !timeoutId && !maxTimeoutId) {
							args = thisArg = undefined;
						}
						return result;
					}
					debounced.cancel = cancel;
					return debounced;
				}

				var defer = restParam(function (func, args) {
					return baseDelay(func, 1, args);
				});

				var delay = restParam(function (func, wait, args) {
					return baseDelay(func, wait, args);
				});

				var flow = createFlow();

				var flowRight = createFlow(true);

				function memoize(func, resolver) {
					if (typeof func != "function" || resolver && typeof resolver != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					var memoized = (function (_memoized) {
						var _memoizedWrapper = function memoized() {
							return _memoized.apply(this, arguments);
						};

						_memoizedWrapper.toString = function () {
							return _memoized.toString();
						};

						return _memoizedWrapper;
					})(function () {
						var args = arguments,
						    key = resolver ? resolver.apply(this, args) : args[0],
						    cache = memoized.cache;

						if (cache.has(key)) {
							return cache.get(key);
						}
						var result = func.apply(this, args);
						memoized.cache = cache.set(key, result);
						return result;
					});
					memoized.cache = new memoize.Cache();
					return memoized;
				}

				var modArgs = restParam(function (func, transforms) {
					transforms = baseFlatten(transforms);
					if (typeof func != "function" || !arrayEvery(transforms, baseIsFunction)) {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					var length = transforms.length;
					return restParam(function (args) {
						var index = nativeMin(args.length, length);
						while (index--) {
							args[index] = transforms[index](args[index]);
						}
						return func.apply(this, args);
					});
				});

				function negate(predicate) {
					if (typeof predicate != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					return function () {
						return !predicate.apply(this, arguments);
					};
				}

				function once(func) {
					return before(2, func);
				}

				var partial = createPartial(PARTIAL_FLAG);

				var partialRight = createPartial(PARTIAL_RIGHT_FLAG);

				var rearg = restParam(function (func, indexes) {
					return createWrapper(func, REARG_FLAG, undefined, undefined, undefined, baseFlatten(indexes));
				});

				function restParam(func, start) {
					if (typeof func != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					start = nativeMax(start === undefined ? func.length - 1 : +start || 0, 0);
					return function () {
						var args = arguments,
						    index = -1,
						    length = nativeMax(args.length - start, 0),
						    rest = Array(length);

						while (++index < length) {
							rest[index] = args[start + index];
						}
						switch (start) {
							case 0:
								return func.call(this, rest);
							case 1:
								return func.call(this, args[0], rest);
							case 2:
								return func.call(this, args[0], args[1], rest);
						}
						var otherArgs = Array(start + 1);
						index = -1;
						while (++index < start) {
							otherArgs[index] = args[index];
						}
						otherArgs[start] = rest;
						return func.apply(this, otherArgs);
					};
				}

				function spread(func) {
					if (typeof func != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					return function (array) {
						return func.apply(this, array);
					};
				}

				function throttle(func, wait, options) {
					var leading = true,
					    trailing = true;

					if (typeof func != "function") {
						throw new TypeError(FUNC_ERROR_TEXT);
					}
					if (options === false) {
						leading = false;
					} else if (isObject(options)) {
						leading = "leading" in options ? !!options.leading : leading;
						trailing = "trailing" in options ? !!options.trailing : trailing;
					}
					return debounce(func, wait, { leading: leading, maxWait: +wait, trailing: trailing });
				}

				function wrap(value, wrapper) {
					wrapper = wrapper == null ? identity : wrapper;
					return createWrapper(wrapper, PARTIAL_FLAG, undefined, [value], []);
				}

				function clone(value, isDeep, customizer, thisArg) {
					if (isDeep && typeof isDeep != "boolean" && isIterateeCall(value, isDeep, customizer)) {
						isDeep = false;
					} else if (typeof isDeep == "function") {
						thisArg = customizer;
						customizer = isDeep;
						isDeep = false;
					}
					return typeof customizer == "function" ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 1)) : baseClone(value, isDeep);
				}

				function cloneDeep(value, customizer, thisArg) {
					return typeof customizer == "function" ? baseClone(value, true, bindCallback(customizer, thisArg, 1)) : baseClone(value, true);
				}

				function gt(value, other) {
					return value > other;
				}

				function gte(value, other) {
					return value >= other;
				}

				function isArguments(value) {
					return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
				}

				var isArray = nativeIsArray || function (value) {
					return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
				};

				function isBoolean(value) {
					return value === true || value === false || isObjectLike(value) && objToString.call(value) == boolTag;
				}

				function isDate(value) {
					return isObjectLike(value) && objToString.call(value) == dateTag;
				}

				function isElement(value) {
					return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
				}

				function isEmpty(value) {
					if (value == null) {
						return true;
					}
					if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) || isObjectLike(value) && isFunction(value.splice))) {
						return !value.length;
					}
					return !keys(value).length;
				}

				function isEqual(value, other, customizer, thisArg) {
					customizer = typeof customizer == "function" ? bindCallback(customizer, thisArg, 3) : undefined;
					var result = customizer ? customizer(value, other) : undefined;
					return result === undefined ? baseIsEqual(value, other, customizer) : !!result;
				}

				function isError(value) {
					return isObjectLike(value) && typeof value.message == "string" && objToString.call(value) == errorTag;
				}

				function isFinite(value) {
					return typeof value == "number" && nativeIsFinite(value);
				}

				function isFunction(value) {
					return isObject(value) && objToString.call(value) == funcTag;
				}

				function isObject(value) {
					var type = typeof value;
					return !!value && (type == "object" || type == "function");
				}

				function isMatch(object, source, customizer, thisArg) {
					customizer = typeof customizer == "function" ? bindCallback(customizer, thisArg, 3) : undefined;
					return baseIsMatch(object, getMatchData(source), customizer);
				}

				function isNaN(value) {
					return isNumber(value) && value != +value;
				}

				function isNative(value) {
					if (value == null) {
						return false;
					}
					if (isFunction(value)) {
						return reIsNative.test(fnToString.call(value));
					}
					return isObjectLike(value) && reIsHostCtor.test(value);
				}

				function isNull(value) {
					return value === null;
				}

				function isNumber(value) {
					return typeof value == "number" || isObjectLike(value) && objToString.call(value) == numberTag;
				}

				function isPlainObject(value) {
					var Ctor;

					if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) || !hasOwnProperty.call(value, "constructor") && (Ctor = value.constructor, typeof Ctor == "function" && !(Ctor instanceof Ctor))) {
						return false;
					}

					var result;

					baseForIn(value, function (subValue, key) {
						result = key;
					});
					return result === undefined || hasOwnProperty.call(value, result);
				}

				function isRegExp(value) {
					return isObject(value) && objToString.call(value) == regexpTag;
				}

				function isString(value) {
					return typeof value == "string" || isObjectLike(value) && objToString.call(value) == stringTag;
				}

				function isTypedArray(value) {
					return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
				}

				function isUndefined(value) {
					return value === undefined;
				}

				function lt(value, other) {
					return value < other;
				}

				function lte(value, other) {
					return value <= other;
				}

				function toArray(value) {
					var length = value ? getLength(value) : 0;
					if (!isLength(length)) {
						return values(value);
					}
					if (!length) {
						return [];
					}
					return arrayCopy(value);
				}

				function toPlainObject(value) {
					return baseCopy(value, keysIn(value));
				}

				var merge = createAssigner(baseMerge);

				var assign = createAssigner(function (object, source, customizer) {
					return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
				});

				function create(prototype, properties, guard) {
					var result = baseCreate(prototype);
					if (guard && isIterateeCall(prototype, properties, guard)) {
						properties = undefined;
					}
					return properties ? baseAssign(result, properties) : result;
				}

				var defaults = createDefaults(assign, assignDefaults);

				var defaultsDeep = createDefaults(merge, mergeDefaults);

				var findKey = createFindKey(baseForOwn);

				var findLastKey = createFindKey(baseForOwnRight);

				var forIn = createForIn(baseFor);

				var forInRight = createForIn(baseForRight);

				var forOwn = createForOwn(baseForOwn);

				var forOwnRight = createForOwn(baseForOwnRight);

				function functions(object) {
					return baseFunctions(object, keysIn(object));
				}

				function get(object, path, defaultValue) {
					var result = object == null ? undefined : baseGet(object, toPath(path), path + "");
					return result === undefined ? defaultValue : result;
				}

				function has(object, path) {
					if (object == null) {
						return false;
					}
					var result = hasOwnProperty.call(object, path);
					if (!result && !isKey(path)) {
						path = toPath(path);
						object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
						if (object == null) {
							return false;
						}
						path = last(path);
						result = hasOwnProperty.call(object, path);
					}
					return result || isLength(object.length) && isIndex(path, object.length) && (isArray(object) || isArguments(object));
				}

				function invert(object, multiValue, guard) {
					if (guard && isIterateeCall(object, multiValue, guard)) {
						multiValue = undefined;
					}
					var index = -1,
					    props = keys(object),
					    length = props.length,
					    result = {};

					while (++index < length) {
						var key = props[index],
						    value = object[key];

						if (multiValue) {
							if (hasOwnProperty.call(result, value)) {
								result[value].push(key);
							} else {
								result[value] = [key];
							}
						} else {
							result[value] = key;
						}
					}
					return result;
				}

				var keys = !nativeKeys ? shimKeys : function (object) {
					var Ctor = object == null ? undefined : object.constructor;
					if (typeof Ctor == "function" && Ctor.prototype === object || typeof object != "function" && isArrayLike(object)) {
						return shimKeys(object);
					}
					return isObject(object) ? nativeKeys(object) : [];
				};

				function keysIn(object) {
					if (object == null) {
						return [];
					}
					if (!isObject(object)) {
						object = Object(object);
					}
					var length = object.length;
					length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;

					var Ctor = object.constructor,
					    index = -1,
					    isProto = typeof Ctor == "function" && Ctor.prototype === object,
					    result = Array(length),
					    skipIndexes = length > 0;

					while (++index < length) {
						result[index] = index + "";
					}
					for (var key in object) {
						if (!(skipIndexes && isIndex(key, length)) && !(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
							result.push(key);
						}
					}
					return result;
				}

				var mapKeys = createObjectMapper(true);

				var mapValues = createObjectMapper();

				var omit = restParam(function (object, props) {
					if (object == null) {
						return {};
					}
					if (typeof props[0] != "function") {
						var props = arrayMap(baseFlatten(props), String);
						return pickByArray(object, baseDifference(keysIn(object), props));
					}
					var predicate = bindCallback(props[0], props[1], 3);
					return pickByCallback(object, function (value, key, object) {
						return !predicate(value, key, object);
					});
				});

				function pairs(object) {
					object = toObject(object);

					var index = -1,
					    props = keys(object),
					    length = props.length,
					    result = Array(length);

					while (++index < length) {
						var key = props[index];
						result[index] = [key, object[key]];
					}
					return result;
				}

				var pick = restParam(function (object, props) {
					if (object == null) {
						return {};
					}
					return typeof props[0] == "function" ? pickByCallback(object, bindCallback(props[0], props[1], 3)) : pickByArray(object, baseFlatten(props));
				});

				function result(object, path, defaultValue) {
					var result = object == null ? undefined : object[path];
					if (result === undefined) {
						if (object != null && !isKey(path, object)) {
							path = toPath(path);
							object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
							result = object == null ? undefined : object[last(path)];
						}
						result = result === undefined ? defaultValue : result;
					}
					return isFunction(result) ? result.call(object) : result;
				}

				function set(object, path, value) {
					if (object == null) {
						return object;
					}
					var pathKey = path + "";
					path = object[pathKey] != null || isKey(path, object) ? [pathKey] : toPath(path);

					var index = -1,
					    length = path.length,
					    lastIndex = length - 1,
					    nested = object;

					while (nested != null && ++index < length) {
						var key = path[index];
						if (isObject(nested)) {
							if (index == lastIndex) {
								nested[key] = value;
							} else if (nested[key] == null) {
								nested[key] = isIndex(path[index + 1]) ? [] : {};
							}
						}
						nested = nested[key];
					}
					return object;
				}

				function transform(object, iteratee, accumulator, thisArg) {
					var isArr = isArray(object) || isTypedArray(object);
					iteratee = getCallback(iteratee, thisArg, 4);

					if (accumulator == null) {
						if (isArr || isObject(object)) {
							var Ctor = object.constructor;
							if (isArr) {
								accumulator = isArray(object) ? new Ctor() : [];
							} else {
								accumulator = baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
							}
						} else {
							accumulator = {};
						}
					}
					(isArr ? arrayEach : baseForOwn)(object, function (value, index, object) {
						return iteratee(accumulator, value, index, object);
					});
					return accumulator;
				}

				function values(object) {
					return baseValues(object, keys(object));
				}

				function valuesIn(object) {
					return baseValues(object, keysIn(object));
				}

				function inRange(value, start, end) {
					start = +start || 0;
					if (end === undefined) {
						end = start;
						start = 0;
					} else {
						end = +end || 0;
					}
					return value >= nativeMin(start, end) && value < nativeMax(start, end);
				}

				function random(min, max, floating) {
					if (floating && isIterateeCall(min, max, floating)) {
						max = floating = undefined;
					}
					var noMin = min == null,
					    noMax = max == null;

					if (floating == null) {
						if (noMax && typeof min == "boolean") {
							floating = min;
							min = 1;
						} else if (typeof max == "boolean") {
							floating = max;
							noMax = true;
						}
					}
					if (noMin && noMax) {
						max = 1;
						noMax = false;
					}
					min = +min || 0;
					if (noMax) {
						max = min;
						min = 0;
					} else {
						max = +max || 0;
					}
					if (floating || min % 1 || max % 1) {
						var rand = nativeRandom();
						return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);
					}
					return baseRandom(min, max);
				}

				var camelCase = createCompounder(function (result, word, index) {
					word = word.toLowerCase();
					return result + (index ? word.charAt(0).toUpperCase() + word.slice(1) : word);
				});

				function capitalize(string) {
					string = baseToString(string);
					return string && string.charAt(0).toUpperCase() + string.slice(1);
				}

				function deburr(string) {
					string = baseToString(string);
					return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, "");
				}

				function endsWith(string, target, position) {
					string = baseToString(string);
					target = target + "";

					var length = string.length;
					position = position === undefined ? length : nativeMin(position < 0 ? 0 : +position || 0, length);

					position -= target.length;
					return position >= 0 && string.indexOf(target, position) == position;
				}

				function escape(string) {
					string = baseToString(string);
					return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
				}

				function escapeRegExp(string) {
					string = baseToString(string);
					return string && reHasRegExpChars.test(string) ? string.replace(reRegExpChars, escapeRegExpChar) : string || "(?:)";
				}

				var kebabCase = createCompounder(function (result, word, index) {
					return result + (index ? "-" : "") + word.toLowerCase();
				});

				function pad(string, length, chars) {
					string = baseToString(string);
					length = +length;

					var strLength = string.length;
					if (strLength >= length || !nativeIsFinite(length)) {
						return string;
					}
					var mid = (length - strLength) / 2,
					    leftLength = nativeFloor(mid),
					    rightLength = nativeCeil(mid);

					chars = createPadding("", rightLength, chars);
					return chars.slice(0, leftLength) + string + chars;
				}

				var padLeft = createPadDir();

				var padRight = createPadDir(true);

				function parseInt(string, radix, guard) {
					if (guard ? isIterateeCall(string, radix, guard) : radix == null) {
						radix = 0;
					} else if (radix) {
						radix = +radix;
					}
					string = trim(string);
					return nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
				}

				function repeat(string, n) {
					var result = "";
					string = baseToString(string);
					n = +n;
					if (n < 1 || !string || !nativeIsFinite(n)) {
						return result;
					}

					do {
						if (n % 2) {
							result += string;
						}
						n = nativeFloor(n / 2);
						string += string;
					} while (n);

					return result;
				}

				var snakeCase = createCompounder(function (result, word, index) {
					return result + (index ? "_" : "") + word.toLowerCase();
				});

				var startCase = createCompounder(function (result, word, index) {
					return result + (index ? " " : "") + (word.charAt(0).toUpperCase() + word.slice(1));
				});

				function startsWith(string, target, position) {
					string = baseToString(string);
					position = position == null ? 0 : nativeMin(position < 0 ? 0 : +position || 0, string.length);

					return string.lastIndexOf(target, position) == position;
				}

				function template(string, options, otherOptions) {
					var settings = lodash.templateSettings;

					if (otherOptions && isIterateeCall(string, options, otherOptions)) {
						options = otherOptions = undefined;
					}
					string = baseToString(string);
					options = assignWith(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);

					var imports = assignWith(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),
					    importsKeys = keys(imports),
					    importsValues = baseValues(imports, importsKeys);

					var isEscaping,
					    isEvaluating,
					    index = 0,
					    interpolate = options.interpolate || reNoMatch,
					    source = "__p += '";

					var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");

					var sourceURL = "//# sourceURL=" + ("sourceURL" in options ? options.sourceURL : "lodash.templateSources[" + ++templateCounter + "]") + "\n";

					string.replace(reDelimiters, function (match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
						interpolateValue || (interpolateValue = esTemplateValue);

						source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

						if (escapeValue) {
							isEscaping = true;
							source += "' +\n__e(" + escapeValue + ") +\n'";
						}
						if (evaluateValue) {
							isEvaluating = true;
							source += "';\n" + evaluateValue + ";\n__p += '";
						}
						if (interpolateValue) {
							source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
						}
						index = offset + match.length;

						return match;
					});

					source += "';\n";

					var variable = options.variable;
					if (!variable) {
						source = "with (obj) {\n" + source + "\n}\n";
					}

					source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");

					source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";

					var result = attempt(function () {
						return Function(importsKeys, sourceURL + "return " + source).apply(undefined, importsValues);
					});

					result.source = source;
					if (isError(result)) {
						throw result;
					}
					return result;
				}

				function trim(string, chars, guard) {
					var value = string;
					string = baseToString(string);
					if (!string) {
						return string;
					}
					if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
						return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
					}
					chars = chars + "";
					return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
				}

				function trimLeft(string, chars, guard) {
					var value = string;
					string = baseToString(string);
					if (!string) {
						return string;
					}
					if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
						return string.slice(trimmedLeftIndex(string));
					}
					return string.slice(charsLeftIndex(string, chars + ""));
				}

				function trimRight(string, chars, guard) {
					var value = string;
					string = baseToString(string);
					if (!string) {
						return string;
					}
					if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
						return string.slice(0, trimmedRightIndex(string) + 1);
					}
					return string.slice(0, charsRightIndex(string, chars + "") + 1);
				}

				function trunc(string, options, guard) {
					if (guard && isIterateeCall(string, options, guard)) {
						options = undefined;
					}
					var length = DEFAULT_TRUNC_LENGTH,
					    omission = DEFAULT_TRUNC_OMISSION;

					if (options != null) {
						if (isObject(options)) {
							var separator = "separator" in options ? options.separator : separator;
							length = "length" in options ? +options.length || 0 : length;
							omission = "omission" in options ? baseToString(options.omission) : omission;
						} else {
							length = +options || 0;
						}
					}
					string = baseToString(string);
					if (length >= string.length) {
						return string;
					}
					var end = length - omission.length;
					if (end < 1) {
						return omission;
					}
					var result = string.slice(0, end);
					if (separator == null) {
						return result + omission;
					}
					if (isRegExp(separator)) {
						if (string.slice(end).search(separator)) {
							var match,
							    newEnd,
							    substring = string.slice(0, end);

							if (!separator.global) {
								separator = RegExp(separator.source, (reFlags.exec(separator) || "") + "g");
							}
							separator.lastIndex = 0;
							while (match = separator.exec(substring)) {
								newEnd = match.index;
							}
							result = result.slice(0, newEnd == null ? end : newEnd);
						}
					} else if (string.indexOf(separator, end) != end) {
						var index = result.lastIndexOf(separator);
						if (index > -1) {
							result = result.slice(0, index);
						}
					}
					return result + omission;
				}

				function unescape(string) {
					string = baseToString(string);
					return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
				}

				function words(string, pattern, guard) {
					if (guard && isIterateeCall(string, pattern, guard)) {
						pattern = undefined;
					}
					string = baseToString(string);
					return string.match(pattern || reWords) || [];
				}

				var attempt = restParam(function (func, args) {
					try {
						return func.apply(undefined, args);
					} catch (e) {
						return isError(e) ? e : new Error(e);
					}
				});

				function callback(func, thisArg, guard) {
					if (guard && isIterateeCall(func, thisArg, guard)) {
						thisArg = undefined;
					}
					return isObjectLike(func) ? matches(func) : baseCallback(func, thisArg);
				}

				function constant(value) {
					return function () {
						return value;
					};
				}

				function identity(value) {
					return value;
				}

				function matches(source) {
					return baseMatches(baseClone(source, true));
				}

				function matchesProperty(path, srcValue) {
					return baseMatchesProperty(path, baseClone(srcValue, true));
				}

				var method = restParam(function (path, args) {
					return function (object) {
						return invokePath(object, path, args);
					};
				});

				var methodOf = restParam(function (object, args) {
					return function (path) {
						return invokePath(object, path, args);
					};
				});

				function mixin(object, source, options) {
					if (options == null) {
						var isObj = isObject(source),
						    props = isObj ? keys(source) : undefined,
						    methodNames = props && props.length ? baseFunctions(source, props) : undefined;

						if (!(methodNames ? methodNames.length : isObj)) {
							methodNames = false;
							options = source;
							source = object;
							object = this;
						}
					}
					if (!methodNames) {
						methodNames = baseFunctions(source, keys(source));
					}
					var chain = true,
					    index = -1,
					    isFunc = isFunction(object),
					    length = methodNames.length;

					if (options === false) {
						chain = false;
					} else if (isObject(options) && "chain" in options) {
						chain = options.chain;
					}
					while (++index < length) {
						var methodName = methodNames[index],
						    func = source[methodName];

						object[methodName] = func;
						if (isFunc) {
							object.prototype[methodName] = (function (func) {
								return function () {
									var chainAll = this.__chain__;
									if (chain || chainAll) {
										var result = object(this.__wrapped__),
										    actions = result.__actions__ = arrayCopy(this.__actions__);

										actions.push({ func: func, args: arguments, thisArg: object });
										result.__chain__ = chainAll;
										return result;
									}
									return func.apply(object, arrayPush([this.value()], arguments));
								};
							})(func);
						}
					}
					return object;
				}

				function noConflict() {
					root._ = oldDash;
					return this;
				}

				function noop() {}

				function property(path) {
					return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
				}

				function propertyOf(object) {
					return function (path) {
						return baseGet(object, toPath(path), path + "");
					};
				}

				function range(start, end, step) {
					if (step && isIterateeCall(start, end, step)) {
						end = step = undefined;
					}
					start = +start || 0;
					step = step == null ? 1 : +step || 0;

					if (end == null) {
						end = start;
						start = 0;
					} else {
						end = +end || 0;
					}

					var index = -1,
					    length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
					    result = Array(length);

					while (++index < length) {
						result[index] = start;
						start += step;
					}
					return result;
				}

				function times(n, iteratee, thisArg) {
					n = nativeFloor(n);

					if (n < 1 || !nativeIsFinite(n)) {
						return [];
					}
					var index = -1,
					    result = Array(nativeMin(n, MAX_ARRAY_LENGTH));

					iteratee = bindCallback(iteratee, thisArg, 1);
					while (++index < n) {
						if (index < MAX_ARRAY_LENGTH) {
							result[index] = iteratee(index);
						} else {
							iteratee(index);
						}
					}
					return result;
				}

				function uniqueId(prefix) {
					var id = ++idCounter;
					return baseToString(prefix) + id;
				}

				function add(augend, addend) {
					return (+augend || 0) + (+addend || 0);
				}

				var ceil = createRound("ceil");

				var floor = createRound("floor");

				var max = createExtremum(gt, NEGATIVE_INFINITY);

				var min = createExtremum(lt, POSITIVE_INFINITY);

				var round = createRound("round");

				function sum(collection, iteratee, thisArg) {
					if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
						iteratee = undefined;
					}
					iteratee = getCallback(iteratee, thisArg, 3);
					return iteratee.length == 1 ? arraySum(isArray(collection) ? collection : toIterable(collection), iteratee) : baseSum(collection, iteratee);
				}

				lodash.prototype = baseLodash.prototype;

				LodashWrapper.prototype = baseCreate(baseLodash.prototype);
				LodashWrapper.prototype.constructor = LodashWrapper;

				LazyWrapper.prototype = baseCreate(baseLodash.prototype);
				LazyWrapper.prototype.constructor = LazyWrapper;

				MapCache.prototype["delete"] = mapDelete;
				MapCache.prototype.get = mapGet;
				MapCache.prototype.has = mapHas;
				MapCache.prototype.set = mapSet;

				SetCache.prototype.push = cachePush;

				memoize.Cache = MapCache;

				lodash.after = after;
				lodash.ary = ary;
				lodash.assign = assign;
				lodash.at = at;
				lodash.before = before;
				lodash.bind = bind;
				lodash.bindAll = bindAll;
				lodash.bindKey = bindKey;
				lodash.callback = callback;
				lodash.chain = chain;
				lodash.chunk = chunk;
				lodash.compact = compact;
				lodash.constant = constant;
				lodash.countBy = countBy;
				lodash.create = create;
				lodash.curry = curry;
				lodash.curryRight = curryRight;
				lodash.debounce = debounce;
				lodash.defaults = defaults;
				lodash.defaultsDeep = defaultsDeep;
				lodash.defer = defer;
				lodash.delay = delay;
				lodash.difference = difference;
				lodash.drop = drop;
				lodash.dropRight = dropRight;
				lodash.dropRightWhile = dropRightWhile;
				lodash.dropWhile = dropWhile;
				lodash.fill = fill;
				lodash.filter = filter;
				lodash.flatten = flatten;
				lodash.flattenDeep = flattenDeep;
				lodash.flow = flow;
				lodash.flowRight = flowRight;
				lodash.forEach = forEach;
				lodash.forEachRight = forEachRight;
				lodash.forIn = forIn;
				lodash.forInRight = forInRight;
				lodash.forOwn = forOwn;
				lodash.forOwnRight = forOwnRight;
				lodash.functions = functions;
				lodash.groupBy = groupBy;
				lodash.indexBy = indexBy;
				lodash.initial = initial;
				lodash.intersection = intersection;
				lodash.invert = invert;
				lodash.invoke = invoke;
				lodash.keys = keys;
				lodash.keysIn = keysIn;
				lodash.map = map;
				lodash.mapKeys = mapKeys;
				lodash.mapValues = mapValues;
				lodash.matches = matches;
				lodash.matchesProperty = matchesProperty;
				lodash.memoize = memoize;
				lodash.merge = merge;
				lodash.method = method;
				lodash.methodOf = methodOf;
				lodash.mixin = mixin;
				lodash.modArgs = modArgs;
				lodash.negate = negate;
				lodash.omit = omit;
				lodash.once = once;
				lodash.pairs = pairs;
				lodash.partial = partial;
				lodash.partialRight = partialRight;
				lodash.partition = partition;
				lodash.pick = pick;
				lodash.pluck = pluck;
				lodash.property = property;
				lodash.propertyOf = propertyOf;
				lodash.pull = pull;
				lodash.pullAt = pullAt;
				lodash.range = range;
				lodash.rearg = rearg;
				lodash.reject = reject;
				lodash.remove = remove;
				lodash.rest = rest;
				lodash.restParam = restParam;
				lodash.set = set;
				lodash.shuffle = shuffle;
				lodash.slice = slice;
				lodash.sortBy = sortBy;
				lodash.sortByAll = sortByAll;
				lodash.sortByOrder = sortByOrder;
				lodash.spread = spread;
				lodash.take = take;
				lodash.takeRight = takeRight;
				lodash.takeRightWhile = takeRightWhile;
				lodash.takeWhile = takeWhile;
				lodash.tap = tap;
				lodash.throttle = throttle;
				lodash.thru = thru;
				lodash.times = times;
				lodash.toArray = toArray;
				lodash.toPlainObject = toPlainObject;
				lodash.transform = transform;
				lodash.union = union;
				lodash.uniq = uniq;
				lodash.unzip = unzip;
				lodash.unzipWith = unzipWith;
				lodash.values = values;
				lodash.valuesIn = valuesIn;
				lodash.where = where;
				lodash.without = without;
				lodash.wrap = wrap;
				lodash.xor = xor;
				lodash.zip = zip;
				lodash.zipObject = zipObject;
				lodash.zipWith = zipWith;

				lodash.backflow = flowRight;
				lodash.collect = map;
				lodash.compose = flowRight;
				lodash.each = forEach;
				lodash.eachRight = forEachRight;
				lodash.extend = assign;
				lodash.iteratee = callback;
				lodash.methods = functions;
				lodash.object = zipObject;
				lodash.select = filter;
				lodash.tail = rest;
				lodash.unique = uniq;

				mixin(lodash, lodash);

				lodash.add = add;
				lodash.attempt = attempt;
				lodash.camelCase = camelCase;
				lodash.capitalize = capitalize;
				lodash.ceil = ceil;
				lodash.clone = clone;
				lodash.cloneDeep = cloneDeep;
				lodash.deburr = deburr;
				lodash.endsWith = endsWith;
				lodash.escape = escape;
				lodash.escapeRegExp = escapeRegExp;
				lodash.every = every;
				lodash.find = find;
				lodash.findIndex = findIndex;
				lodash.findKey = findKey;
				lodash.findLast = findLast;
				lodash.findLastIndex = findLastIndex;
				lodash.findLastKey = findLastKey;
				lodash.findWhere = findWhere;
				lodash.first = first;
				lodash.floor = floor;
				lodash.get = get;
				lodash.gt = gt;
				lodash.gte = gte;
				lodash.has = has;
				lodash.identity = identity;
				lodash.includes = includes;
				lodash.indexOf = indexOf;
				lodash.inRange = inRange;
				lodash.isArguments = isArguments;
				lodash.isArray = isArray;
				lodash.isBoolean = isBoolean;
				lodash.isDate = isDate;
				lodash.isElement = isElement;
				lodash.isEmpty = isEmpty;
				lodash.isEqual = isEqual;
				lodash.isError = isError;
				lodash.isFinite = isFinite;
				lodash.isFunction = isFunction;
				lodash.isMatch = isMatch;
				lodash.isNaN = isNaN;
				lodash.isNative = isNative;
				lodash.isNull = isNull;
				lodash.isNumber = isNumber;
				lodash.isObject = isObject;
				lodash.isPlainObject = isPlainObject;
				lodash.isRegExp = isRegExp;
				lodash.isString = isString;
				lodash.isTypedArray = isTypedArray;
				lodash.isUndefined = isUndefined;
				lodash.kebabCase = kebabCase;
				lodash.last = last;
				lodash.lastIndexOf = lastIndexOf;
				lodash.lt = lt;
				lodash.lte = lte;
				lodash.max = max;
				lodash.min = min;
				lodash.noConflict = noConflict;
				lodash.noop = noop;
				lodash.now = now;
				lodash.pad = pad;
				lodash.padLeft = padLeft;
				lodash.padRight = padRight;
				lodash.parseInt = parseInt;
				lodash.random = random;
				lodash.reduce = reduce;
				lodash.reduceRight = reduceRight;
				lodash.repeat = repeat;
				lodash.result = result;
				lodash.round = round;
				lodash.runInContext = runInContext;
				lodash.size = size;
				lodash.snakeCase = snakeCase;
				lodash.some = some;
				lodash.sortedIndex = sortedIndex;
				lodash.sortedLastIndex = sortedLastIndex;
				lodash.startCase = startCase;
				lodash.startsWith = startsWith;
				lodash.sum = sum;
				lodash.template = template;
				lodash.trim = trim;
				lodash.trimLeft = trimLeft;
				lodash.trimRight = trimRight;
				lodash.trunc = trunc;
				lodash.unescape = unescape;
				lodash.uniqueId = uniqueId;
				lodash.words = words;

				lodash.all = every;
				lodash.any = some;
				lodash.contains = includes;
				lodash.eq = isEqual;
				lodash.detect = find;
				lodash.foldl = reduce;
				lodash.foldr = reduceRight;
				lodash.head = first;
				lodash.include = includes;
				lodash.inject = reduce;

				mixin(lodash, (function () {
					var source = {};
					baseForOwn(lodash, function (func, methodName) {
						if (!lodash.prototype[methodName]) {
							source[methodName] = func;
						}
					});
					return source;
				})(), false);

				lodash.sample = sample;

				lodash.prototype.sample = function (n) {
					if (!this.__chain__ && n == null) {
						return sample(this.value());
					}
					return this.thru(function (value) {
						return sample(value, n);
					});
				};

				lodash.VERSION = VERSION;

				arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function (methodName) {
					lodash[methodName].placeholder = lodash;
				});

				arrayEach(["drop", "take"], function (methodName, index) {
					LazyWrapper.prototype[methodName] = function (n) {
						var filtered = this.__filtered__;
						if (filtered && !index) {
							return new LazyWrapper(this);
						}
						n = n == null ? 1 : nativeMax(nativeFloor(n) || 0, 0);

						var result = this.clone();
						if (filtered) {
							result.__takeCount__ = nativeMin(result.__takeCount__, n);
						} else {
							result.__views__.push({ size: n, type: methodName + (result.__dir__ < 0 ? "Right" : "") });
						}
						return result;
					};

					LazyWrapper.prototype[methodName + "Right"] = function (n) {
						return this.reverse()[methodName](n).reverse();
					};
				});

				arrayEach(["filter", "map", "takeWhile"], function (methodName, index) {
					var type = index + 1,
					    isFilter = type != LAZY_MAP_FLAG;

					LazyWrapper.prototype[methodName] = function (iteratee, thisArg) {
						var result = this.clone();
						result.__iteratees__.push({ iteratee: getCallback(iteratee, thisArg, 1), type: type });
						result.__filtered__ = result.__filtered__ || isFilter;
						return result;
					};
				});

				arrayEach(["first", "last"], function (methodName, index) {
					var takeName = "take" + (index ? "Right" : "");

					LazyWrapper.prototype[methodName] = function () {
						return this[takeName](1).value()[0];
					};
				});

				arrayEach(["initial", "rest"], function (methodName, index) {
					var dropName = "drop" + (index ? "" : "Right");

					LazyWrapper.prototype[methodName] = function () {
						return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
					};
				});

				arrayEach(["pluck", "where"], function (methodName, index) {
					var operationName = index ? "filter" : "map",
					    createCallback = index ? baseMatches : property;

					LazyWrapper.prototype[methodName] = function (value) {
						return this[operationName](createCallback(value));
					};
				});

				LazyWrapper.prototype.compact = function () {
					return this.filter(identity);
				};

				LazyWrapper.prototype.reject = function (predicate, thisArg) {
					predicate = getCallback(predicate, thisArg, 1);
					return this.filter(function (value) {
						return !predicate(value);
					});
				};

				LazyWrapper.prototype.slice = function (start, end) {
					start = start == null ? 0 : +start || 0;

					var result = this;
					if (result.__filtered__ && (start > 0 || end < 0)) {
						return new LazyWrapper(result);
					}
					if (start < 0) {
						result = result.takeRight(-start);
					} else if (start) {
						result = result.drop(start);
					}
					if (end !== undefined) {
						end = +end || 0;
						result = end < 0 ? result.dropRight(-end) : result.take(end - start);
					}
					return result;
				};

				LazyWrapper.prototype.takeRightWhile = function (predicate, thisArg) {
					return this.reverse().takeWhile(predicate, thisArg).reverse();
				};

				LazyWrapper.prototype.toArray = function () {
					return this.take(POSITIVE_INFINITY);
				};

				baseForOwn(LazyWrapper.prototype, function (func, methodName) {
					var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),
					    retUnwrapped = /^(?:first|last)$/.test(methodName),
					    lodashFunc = lodash[retUnwrapped ? "take" + (methodName == "last" ? "Right" : "") : methodName];

					if (!lodashFunc) {
						return;
					}
					lodash.prototype[methodName] = function () {
						var args = retUnwrapped ? [1] : arguments,
						    chainAll = this.__chain__,
						    value = this.__wrapped__,
						    isHybrid = !!this.__actions__.length,
						    isLazy = value instanceof LazyWrapper,
						    iteratee = args[0],
						    useLazy = isLazy || isArray(value);

						if (useLazy && checkIteratee && typeof iteratee == "function" && iteratee.length != 1) {
							isLazy = useLazy = false;
						}
						var interceptor = function interceptor(value) {
							return retUnwrapped && chainAll ? lodashFunc(value, 1)[0] : lodashFunc.apply(undefined, arrayPush([value], args));
						};

						var action = { func: thru, args: [interceptor], thisArg: undefined },
						    onlyLazy = isLazy && !isHybrid;

						if (retUnwrapped && !chainAll) {
							if (onlyLazy) {
								value = value.clone();
								value.__actions__.push(action);
								return func.call(value);
							}
							return lodashFunc.call(undefined, this.value())[0];
						}
						if (!retUnwrapped && useLazy) {
							value = onlyLazy ? value : new LazyWrapper(this);
							var result = func.apply(value, args);
							result.__actions__.push(action);
							return new LodashWrapper(result, chainAll);
						}
						return this.thru(interceptor);
					};
				});

				arrayEach(["join", "pop", "push", "replace", "shift", "sort", "splice", "split", "unshift"], function (methodName) {
					var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],
					    chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru",
					    retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);

					lodash.prototype[methodName] = function () {
						var args = arguments;
						if (retUnwrapped && !this.__chain__) {
							return func.apply(this.value(), args);
						}
						return this[chainName](function (value) {
							return func.apply(value, args);
						});
					};
				});

				baseForOwn(LazyWrapper.prototype, function (func, methodName) {
					var lodashFunc = lodash[methodName];
					if (lodashFunc) {
						var key = lodashFunc.name,
						    names = realNames[key] || (realNames[key] = []);

						names.push({ name: methodName, func: lodashFunc });
					}
				});

				realNames[createHybridWrapper(undefined, BIND_KEY_FLAG).name] = [{ name: "wrapper", func: undefined }];

				LazyWrapper.prototype.clone = lazyClone;
				LazyWrapper.prototype.reverse = lazyReverse;
				LazyWrapper.prototype.value = lazyValue;

				lodash.prototype.chain = wrapperChain;
				lodash.prototype.commit = wrapperCommit;
				lodash.prototype.concat = wrapperConcat;
				lodash.prototype.plant = wrapperPlant;
				lodash.prototype.reverse = wrapperReverse;
				lodash.prototype.toString = wrapperToString;
				lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

				lodash.prototype.collect = lodash.prototype.map;
				lodash.prototype.head = lodash.prototype.first;
				lodash.prototype.select = lodash.prototype.filter;
				lodash.prototype.tail = lodash.prototype.rest;

				return lodash;
			}

			var _ = runInContext();

			if (true) {
				root._ = _;

				!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
					return _;
				}).call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			} else if (freeExports && freeModule) {
				if (moduleExports) {
					(freeModule.exports = _)._ = _;
				} else {
					freeExports._ = _;
				}
			} else {
				root._ = _;
			}
		}).call(this);
	}).call(exports, __webpack_require__(31)(module), (function () {
		return this;
	})());
}, function (module, exports, __webpack_require__) {

	module.exports = __webpack_require__(27);
}, function (module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function () {

		var HT = "\t";
		var SP = " ";
		var CR = "\r";
		var NF = "\n";

		var SPACES = [SP, HT, CR, NF];

		var SEPARATORS = ["(", ")", "<", ">", "@", ",", ";", ":", "\\", "\"", "/", "[", "]", "?", "=", "{", "}", SP, HT];

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
				if (ch === "\"") break;
				if (ch === "\\") pos++;
				pos++;
			}

			return value.substring(start, pos + 1);
		}

		function decodeQuotedString(value) {
			value = value.substr(1, value.length - 2);
			var start = 0,
			    p;
			var result = "";

			while ((p = value.indexOf("\\", start)) != -1) {
				result += value.substring(start, p);
				start = p + 2;
			}

			result += value.substring(start);

			return result;
		}

		function readLinkParam(value, pos, link) {
			var pname = readToken(value, pos);
			pos = skipSpaces(value, pos + pname.length);
			if (value.charAt(pos) !== "=") throw new Error("Unexpected token: " + pos);

			pos++;

			var isQuotedString = value.charAt(pos) === "\"";
			var pvalue;
			if (isQuotedString) {
				pvalue = readQuotedString(value, pos);
				pos += pvalue.length;
				pvalue = decodeQuotedString(pvalue);
			} else {
				pvalue = readToken(value, pos);
				pos += pvalue.length;

				if (pname == "type") {
					if (value.charAt(pos) !== "/") throw new Error("Unexpected token: " + pos);
					pos++;
					var subtype = readToken(value, pos);
					pos += subtype.length;
					pvalue += "/" + subtype;
				}
			}
			link[pname] = pvalue;

			return pos;
		}

		function readLink(value, pos, link) {
			if (value.charAt(pos) !== "<") throw new Error("Unexpected token: " + pos);

			var p = value.indexOf(">", pos);
			if (p === -1) throw new Error("Unexpected token: " + pos);

			link.href = value.substring(pos + 1, p);
			pos = skipSpaces(value, p + 1);

			while (pos < value.length && value.charAt(pos) === ";") {
				pos = skipSpaces(value, pos + 1);
				pos = readLinkParam(value, pos, link);
				pos = skipSpaces(value, pos);
			}

			return pos;
		}

		var httpLink = {};

		httpLink.parse = function (value) {
			var pos = 0;

			var links = [];
			var link;

			while (pos < value.length && (pos === 0 || value.charAt(pos) === "," && pos++)) {
				link = {};
				pos = skipSpaces(value, pos);
				pos = readLink(value, pos, link);
				links.push(link);
				pos = skipSpaces(value, pos);
			}

			if (pos < value.length) throw new Error("Unexpected token: " + pos);

			return links;
		};

		httpLink.stringify = function (array) {
			return array.map(function (obj) {
				var href = obj.href;
				var attr = Object.keys(obj).filter(function (key) {
					return key !== "href";
				}).map(function (key) {
					return key + "=" + JSON.stringify(obj[key]);
				});

				return ["<" + obj.href + ">"].concat(attr).join("; ");
			}).join(", ");
		};

		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
				return httpLink;
			}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (typeof module === "object" && module.exports) {
			module.exports = httpLink;
		} else {
			this.httpLink = httpLink;
		}
	})();
}, function (module, exports, __webpack_require__) {
	(function (root, factory) {
		"use strict";

		if (true) {
			module.exports = factory(__webpack_require__(26));
		} else if (typeof define === "function" && define.amd) {
			define(["./URI"], factory);
		} else {
			root.URITemplate = factory(root.URI, root);
		}
	})(this, function (URI, root) {
		"use strict";

		var _URITemplate = root && root.URITemplate;

		var hasOwn = Object.prototype.hasOwnProperty;
		function URITemplate(expression) {
			if (URITemplate._cache[expression]) {
				return URITemplate._cache[expression];
			}

			if (!(this instanceof URITemplate)) {
				return new URITemplate(expression);
			}

			this.expression = expression;
			URITemplate._cache[expression] = this;
			return this;
		}

		function Data(data) {
			this.data = data;
			this.cache = {};
		}

		var p = URITemplate.prototype;

		var operators = {
			"": {
				prefix: "",
				separator: ",",
				named: false,
				empty_name_separator: false,
				encode: "encode"
			},
			"+": {
				prefix: "",
				separator: ",",
				named: false,
				empty_name_separator: false,
				encode: "encodeReserved"
			},
			"#": {
				prefix: "#",
				separator: ",",
				named: false,
				empty_name_separator: false,
				encode: "encodeReserved"
			},
			".": {
				prefix: ".",
				separator: ".",
				named: false,
				empty_name_separator: false,
				encode: "encode"
			},
			"/": {
				prefix: "/",
				separator: "/",
				named: false,
				empty_name_separator: false,
				encode: "encode"
			},
			";": {
				prefix: ";",
				separator: ";",
				named: true,
				empty_name_separator: false,
				encode: "encode"
			},
			"?": {
				prefix: "?",
				separator: "&",
				named: true,
				empty_name_separator: true,
				encode: "encode"
			},
			"&": {
				prefix: "&",
				separator: "&",
				named: true,
				empty_name_separator: true,
				encode: "encode"
			}

		};

		URITemplate._cache = {};

		URITemplate.EXPRESSION_PATTERN = /\{([^a-zA-Z0-9%_]?)([^\}]+)(\}|$)/g;

		URITemplate.VARIABLE_PATTERN = /^([^*:]+)((\*)|:(\d+))?$/;

		URITemplate.VARIABLE_NAME_PATTERN = /[^a-zA-Z0-9%_]/;

		URITemplate.expand = function (expression, data) {
			var options = operators[expression.operator];

			var type = options.named ? "Named" : "Unnamed";

			var variables = expression.variables;

			var buffer = [];
			var d, variable, i;

			for (i = 0; variable = variables[i]; i++) {
				d = data.get(variable.name);
				if (!d.val.length) {
					if (d.type) {
						buffer.push("");
					}

					continue;
				}

				buffer.push(URITemplate["expand" + type](d, options, variable.explode, variable.explode && options.separator || ",", variable.maxlength, variable.name));
			}

			if (buffer.length) {
				return options.prefix + buffer.join(options.separator);
			} else {
				return "";
			}
		};

		URITemplate.expandNamed = function (d, options, explode, separator, length, name) {
			var result = "";

			var encode = options.encode;
			var empty_name_separator = options.empty_name_separator;

			var _encode = !d[encode].length;

			var _name = d.type === 2 ? "" : URI[encode](name);
			var _value, i, l;

			for (i = 0, l = d.val.length; i < l; i++) {
				if (length) {
					_value = URI[encode](d.val[i][1].substring(0, length));
					if (d.type === 2) {
						_name = URI[encode](d.val[i][0].substring(0, length));
					}
				} else if (_encode) {
					_value = URI[encode](d.val[i][1]);
					if (d.type === 2) {
						_name = URI[encode](d.val[i][0]);
						d[encode].push([_name, _value]);
					} else {
						d[encode].push([undefined, _value]);
					}
				} else {
					_value = d[encode][i][1];
					if (d.type === 2) {
						_name = d[encode][i][0];
					}
				}

				if (result) {
					result += separator;
				}

				if (!explode) {
					if (!i) {
						result += URI[encode](name) + (empty_name_separator || _value ? "=" : "");
					}

					if (d.type === 2) {
						result += _name + ",";
					}

					result += _value;
				} else {
					result += _name + (empty_name_separator || _value ? "=" : "") + _value;
				}
			}

			return result;
		};

		URITemplate.expandUnnamed = function (d, options, explode, separator, length) {
			var result = "";

			var encode = options.encode;
			var empty_name_separator = options.empty_name_separator;

			var _encode = !d[encode].length;
			var _name, _value, i, l;

			for (i = 0, l = d.val.length; i < l; i++) {
				if (length) {
					_value = URI[encode](d.val[i][1].substring(0, length));
				} else if (_encode) {
					_value = URI[encode](d.val[i][1]);
					d[encode].push([d.type === 2 ? URI[encode](d.val[i][0]) : undefined, _value]);
				} else {
					_value = d[encode][i][1];
				}

				if (result) {
					result += separator;
				}

				if (d.type === 2) {
					if (length) {
						_name = URI[encode](d.val[i][0].substring(0, length));
					} else {
						_name = d[encode][i][0];
					}

					result += _name;
					if (explode) {
						result += empty_name_separator || _value ? "=" : "";
					} else {
						result += ",";
					}
				}

				result += _value;
			}

			return result;
		};

		URITemplate.noConflict = function () {
			if (root.URITemplate === URITemplate) {
				root.URITemplate = _URITemplate;
			}

			return URITemplate;
		};

		p.expand = function (data) {
			var result = "";

			if (!this.parts || !this.parts.length) {
				this.parse();
			}

			if (!(data instanceof Data)) {
				data = new Data(data);
			}

			for (var i = 0, l = this.parts.length; i < l; i++) {
				result += typeof this.parts[i] === "string" ? this.parts[i] : URITemplate.expand(this.parts[i], data);
			}

			return result;
		};

		p.parse = function () {
			var expression = this.expression;
			var ePattern = URITemplate.EXPRESSION_PATTERN;
			var vPattern = URITemplate.VARIABLE_PATTERN;
			var nPattern = URITemplate.VARIABLE_NAME_PATTERN;

			var parts = [];

			var pos = 0;
			var variables, eMatch, vMatch;

			ePattern.lastIndex = 0;

			while (true) {
				eMatch = ePattern.exec(expression);
				if (eMatch === null) {
					parts.push(expression.substring(pos));
					break;
				} else {
					parts.push(expression.substring(pos, eMatch.index));
					pos = eMatch.index + eMatch[0].length;
				}

				if (!operators[eMatch[1]]) {
					throw new Error("Unknown Operator \"" + eMatch[1] + "\" in \"" + eMatch[0] + "\"");
				} else if (!eMatch[3]) {
					throw new Error("Unclosed Expression \"" + eMatch[0] + "\"");
				}

				variables = eMatch[2].split(",");
				for (var i = 0, l = variables.length; i < l; i++) {
					vMatch = variables[i].match(vPattern);
					if (vMatch === null) {
						throw new Error("Invalid Variable \"" + variables[i] + "\" in \"" + eMatch[0] + "\"");
					} else if (vMatch[1].match(nPattern)) {
						throw new Error("Invalid Variable Name \"" + vMatch[1] + "\" in \"" + eMatch[0] + "\"");
					}

					variables[i] = {
						name: vMatch[1],
						explode: !!vMatch[3],
						maxlength: vMatch[4] && parseInt(vMatch[4], 10)
					};
				}

				if (!variables.length) {
					throw new Error("Expression Missing Variable(s) \"" + eMatch[0] + "\"");
				}

				parts.push({
					expression: eMatch[0],
					operator: eMatch[1],
					variables: variables
				});
			}

			if (!parts.length) {
				parts.push(expression);
			}

			this.parts = parts;
			return this;
		};

		Data.prototype.get = function (key) {
			var data = this.data;

			var d = {
				type: 0,
				val: [],
				encode: [],
				encodeReserved: []
			};
			var i, l, value;

			if (this.cache[key] !== undefined) {
				return this.cache[key];
			}

			this.cache[key] = d;

			if (String(Object.prototype.toString.call(data)) === "[object Function]") {
				value = data(key);
			} else if (String(Object.prototype.toString.call(data[key])) === "[object Function]") {
				value = data[key](key);
			} else {
				value = data[key];
			}

			if (value === undefined || value === null) {
				return d;
			} else if (String(Object.prototype.toString.call(value)) === "[object Array]") {
				for (i = 0, l = value.length; i < l; i++) {
					if (value[i] !== undefined && value[i] !== null) {
						d.val.push([undefined, String(value[i])]);
					}
				}

				if (d.val.length) {
					d.type = 3;
				}
			} else if (String(Object.prototype.toString.call(value)) === "[object Object]") {
				for (i in value) {
					if (hasOwn.call(value, i) && value[i] !== undefined && value[i] !== null) {
						d.val.push([i, String(value[i])]);
					}
				}

				if (d.val.length) {
					d.type = 2;
				}
			} else {
				d.type = 1;
				d.val.push([undefined, String(value)]);
			}

			return d;
		};

		URI.expand = function (expression, data) {
			var template = new URITemplate(expression);
			var expansion = template.expand(data);

			return new URI(expansion);
		};

		return URITemplate;
	});
}, function (module, exports, __webpack_require__) {
	(function (root, factory) {
		"use strict";

		if (true) {
			module.exports = factory(__webpack_require__(28), __webpack_require__(29), __webpack_require__(30));
		} else if (typeof define === "function" && define.amd) {
			define(["./punycode", "./IPv6", "./SecondLevelDomains"], factory);
		} else {
			root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
		}
	})(this, function (punycode, IPv6, SLD, root) {
		"use strict";

		var _URI = root && root.URI;

		function URI(url, base) {
			var _urlSupplied = arguments.length >= 1;
			var _baseSupplied = arguments.length >= 2;

			if (!(this instanceof URI)) {
				if (_urlSupplied) {
					if (_baseSupplied) {
						return new URI(url, base);
					}

					return new URI(url);
				}

				return new URI();
			}

			if (url === undefined) {
				if (_urlSupplied) {
					throw new TypeError("undefined is not a valid argument for URI");
				}

				if (typeof location !== "undefined") {
					url = location.href + "";
				} else {
					url = "";
				}
			}

			this.href(url);

			if (base !== undefined) {
				return this.absoluteTo(base);
			}

			return this;
		}

		URI.version = "1.15.2";

		var p = URI.prototype;
		var hasOwn = Object.prototype.hasOwnProperty;

		function escapeRegEx(string) {
			return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
		}

		function getType(value) {
			if (value === undefined) {
				return "Undefined";
			}

			return String(Object.prototype.toString.call(value)).slice(8, -1);
		}

		function isArray(obj) {
			return getType(obj) === "Array";
		}

		function filterArrayValues(data, value) {
			var lookup = {};
			var i, length;

			if (getType(value) === "RegExp") {
				lookup = null;
			} else if (isArray(value)) {
				for (i = 0, length = value.length; i < length; i++) {
					lookup[value[i]] = true;
				}
			} else {
				lookup[value] = true;
			}

			for (i = 0, length = data.length; i < length; i++) {
				var _match = lookup && lookup[data[i]] !== undefined || !lookup && value.test(data[i]);

				if (_match) {
					data.splice(i, 1);
					length--;
					i--;
				}
			}

			return data;
		}

		function arrayContains(list, value) {
			var i, length;

			if (isArray(value)) {
				for (i = 0, length = value.length; i < length; i++) {
					if (!arrayContains(list, value[i])) {
						return false;
					}
				}

				return true;
			}

			var _type = getType(value);
			for (i = 0, length = list.length; i < length; i++) {
				if (_type === "RegExp") {
					if (typeof list[i] === "string" && list[i].match(value)) {
						return true;
					}
				} else if (list[i] === value) {
					return true;
				}
			}

			return false;
		}

		function arraysEqual(one, two) {
			if (!isArray(one) || !isArray(two)) {
				return false;
			}

			if (one.length !== two.length) {
				return false;
			}

			one.sort();
			two.sort();

			for (var i = 0, l = one.length; i < l; i++) {
				if (one[i] !== two[i]) {
					return false;
				}
			}

			return true;
		}

		URI._parts = function () {
			return {
				protocol: null,
				username: null,
				password: null,
				hostname: null,
				urn: null,
				port: null,
				path: null,
				query: null,
				fragment: null,
				duplicateQueryParameters: URI.duplicateQueryParameters,
				escapeQuerySpace: URI.escapeQuerySpace
			};
		};

		URI.duplicateQueryParameters = false;

		URI.escapeQuerySpace = true;

		URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
		URI.idn_expression = /[^a-z0-9\.-]/i;
		URI.punycode_expression = /(xn--)/i;

		URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

		URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;

		URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
		URI.findUri = {
			start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
			end: /[\s\r\n]|$/,
			trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/
		};

		URI.defaultPorts = {
			http: "80",
			https: "443",
			ftp: "21",
			gopher: "70",
			ws: "80",
			wss: "443"
		};

		URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;

		URI.domAttributes = {
			a: "href",
			blockquote: "cite",
			link: "href",
			base: "href",
			script: "src",
			form: "action",
			img: "src",
			area: "href",
			iframe: "src",
			embed: "src",
			source: "src",
			track: "src",
			input: "src",
			audio: "src",
			video: "src"
		};
		URI.getDomAttribute = function (node) {
			if (!node || !node.nodeName) {
				return undefined;
			}

			var nodeName = node.nodeName.toLowerCase();

			if (nodeName === "input" && node.type !== "image") {
				return undefined;
			}

			return URI.domAttributes[nodeName];
		};

		function escapeForDumbFirefox36(value) {
			return escape(value);
		}

		function strictEncodeURIComponent(string) {
			return encodeURIComponent(string).replace(/[!'()*]/g, escapeForDumbFirefox36).replace(/\*/g, "%2A");
		}
		URI.encode = strictEncodeURIComponent;
		URI.decode = decodeURIComponent;
		URI.iso8859 = function () {
			URI.encode = escape;
			URI.decode = unescape;
		};
		URI.unicode = function () {
			URI.encode = strictEncodeURIComponent;
			URI.decode = decodeURIComponent;
		};
		URI.characters = {
			pathname: {
				encode: {
					expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
					map: {
						"%24": "$",
						"%26": "&",
						"%2B": "+",
						"%2C": ",",
						"%3B": ";",
						"%3D": "=",
						"%3A": ":",
						"%40": "@"
					}
				},
				decode: {
					expression: /[\/\?#]/g,
					map: {
						"/": "%2F",
						"?": "%3F",
						"#": "%23"
					}
				}
			},
			reserved: {
				encode: {
					expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
					map: {
						"%3A": ":",
						"%2F": "/",
						"%3F": "?",
						"%23": "#",
						"%5B": "[",
						"%5D": "]",
						"%40": "@",
						"%21": "!",
						"%24": "$",
						"%26": "&",
						"%27": "'",
						"%28": "(",
						"%29": ")",
						"%2A": "*",
						"%2B": "+",
						"%2C": ",",
						"%3B": ";",
						"%3D": "="
					}
				}
			},
			urnpath: {
				encode: {
					expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
					map: {
						"%21": "!",
						"%24": "$",
						"%27": "'",
						"%28": "(",
						"%29": ")",
						"%2A": "*",
						"%2B": "+",
						"%2C": ",",
						"%3B": ";",
						"%3D": "=",
						"%40": "@"
					}
				},
				decode: {
					expression: /[\/\?#:]/g,
					map: {
						"/": "%2F",
						"?": "%3F",
						"#": "%23",
						":": "%3A"
					}
				}
			}
		};
		URI.encodeQuery = function (string, escapeQuerySpace) {
			var escaped = URI.encode(string + "");
			if (escapeQuerySpace === undefined) {
				escapeQuerySpace = URI.escapeQuerySpace;
			}

			return escapeQuerySpace ? escaped.replace(/%20/g, "+") : escaped;
		};
		URI.decodeQuery = function (string, escapeQuerySpace) {
			string += "";
			if (escapeQuerySpace === undefined) {
				escapeQuerySpace = URI.escapeQuerySpace;
			}

			try {
				return URI.decode(escapeQuerySpace ? string.replace(/\+/g, "%20") : string);
			} catch (e) {
				return string;
			}
		};

		var _parts = { encode: "encode", decode: "decode" };
		var _part;
		var generateAccessor = function generateAccessor(_group, _part) {
			return function (string) {
				try {
					return URI[_part](string + "").replace(URI.characters[_group][_part].expression, function (c) {
						return URI.characters[_group][_part].map[c];
					});
				} catch (e) {
					return string;
				}
			};
		};

		for (_part in _parts) {
			URI[_part + "PathSegment"] = generateAccessor("pathname", _parts[_part]);
			URI[_part + "UrnPathSegment"] = generateAccessor("urnpath", _parts[_part]);
		}

		var generateSegmentedPathFunction = function generateSegmentedPathFunction(_sep, _codingFuncName, _innerCodingFuncName) {
			return function (string) {
				var actualCodingFunc;
				if (!_innerCodingFuncName) {
					actualCodingFunc = URI[_codingFuncName];
				} else {
					actualCodingFunc = function (string) {
						return URI[_codingFuncName](URI[_innerCodingFuncName](string));
					};
				}

				var segments = (string + "").split(_sep);

				for (var i = 0, length = segments.length; i < length; i++) {
					segments[i] = actualCodingFunc(segments[i]);
				}

				return segments.join(_sep);
			};
		};

		URI.decodePath = generateSegmentedPathFunction("/", "decodePathSegment");
		URI.decodeUrnPath = generateSegmentedPathFunction(":", "decodeUrnPathSegment");
		URI.recodePath = generateSegmentedPathFunction("/", "encodePathSegment", "decode");
		URI.recodeUrnPath = generateSegmentedPathFunction(":", "encodeUrnPathSegment", "decode");

		URI.encodeReserved = generateAccessor("reserved", "encode");

		URI.parse = function (string, parts) {
			var pos;
			if (!parts) {
				parts = {};
			}

			pos = string.indexOf("#");
			if (pos > -1) {
				parts.fragment = string.substring(pos + 1) || null;
				string = string.substring(0, pos);
			}

			pos = string.indexOf("?");
			if (pos > -1) {
				parts.query = string.substring(pos + 1) || null;
				string = string.substring(0, pos);
			}

			if (string.substring(0, 2) === "//") {
				parts.protocol = null;
				string = string.substring(2);

				string = URI.parseAuthority(string, parts);
			} else {
				pos = string.indexOf(":");
				if (pos > -1) {
					parts.protocol = string.substring(0, pos) || null;
					if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
						parts.protocol = undefined;
					} else if (string.substring(pos + 1, pos + 3) === "//") {
						string = string.substring(pos + 3);

						string = URI.parseAuthority(string, parts);
					} else {
						string = string.substring(pos + 1);
						parts.urn = true;
					}
				}
			}

			parts.path = string;

			return parts;
		};
		URI.parseHost = function (string, parts) {
			var pos = string.indexOf("/");
			var bracketPos;
			var t;

			if (pos === -1) {
				pos = string.length;
			}

			if (string.charAt(0) === "[") {
				bracketPos = string.indexOf("]");
				parts.hostname = string.substring(1, bracketPos) || null;
				parts.port = string.substring(bracketPos + 2, pos) || null;
				if (parts.port === "/") {
					parts.port = null;
				}
			} else {
				var firstColon = string.indexOf(":");
				var firstSlash = string.indexOf("/");
				var nextColon = string.indexOf(":", firstColon + 1);
				if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
					parts.hostname = string.substring(0, pos) || null;
					parts.port = null;
				} else {
					t = string.substring(0, pos).split(":");
					parts.hostname = t[0] || null;
					parts.port = t[1] || null;
				}
			}

			if (parts.hostname && string.substring(pos).charAt(0) !== "/") {
				pos++;
				string = "/" + string;
			}

			return string.substring(pos) || "/";
		};
		URI.parseAuthority = function (string, parts) {
			string = URI.parseUserinfo(string, parts);
			return URI.parseHost(string, parts);
		};
		URI.parseUserinfo = function (string, parts) {
			var firstSlash = string.indexOf("/");
			var pos = string.lastIndexOf("@", firstSlash > -1 ? firstSlash : string.length - 1);
			var t;

			if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
				t = string.substring(0, pos).split(":");
				parts.username = t[0] ? URI.decode(t[0]) : null;
				t.shift();
				parts.password = t[0] ? URI.decode(t.join(":")) : null;
				string = string.substring(pos + 1);
			} else {
				parts.username = null;
				parts.password = null;
			}

			return string;
		};
		URI.parseQuery = function (string, escapeQuerySpace) {
			if (!string) {
				return {};
			}

			string = string.replace(/&+/g, "&").replace(/^\?*&*|&+$/g, "");

			if (!string) {
				return {};
			}

			var items = {};
			var splits = string.split("&");
			var length = splits.length;
			var v, name, value;

			for (var i = 0; i < length; i++) {
				v = splits[i].split("=");
				name = URI.decodeQuery(v.shift(), escapeQuerySpace);

				value = v.length ? URI.decodeQuery(v.join("="), escapeQuerySpace) : null;

				if (hasOwn.call(items, name)) {
					if (typeof items[name] === "string" || items[name] === null) {
						items[name] = [items[name]];
					}

					items[name].push(value);
				} else {
					items[name] = value;
				}
			}

			return items;
		};

		URI.build = function (parts) {
			var t = "";

			if (parts.protocol) {
				t += parts.protocol + ":";
			}

			if (!parts.urn && (t || parts.hostname)) {
				t += "//";
			}

			t += URI.buildAuthority(parts) || "";

			if (typeof parts.path === "string") {
				if (parts.path.charAt(0) !== "/" && typeof parts.hostname === "string") {
					t += "/";
				}

				t += parts.path;
			}

			if (typeof parts.query === "string" && parts.query) {
				t += "?" + parts.query;
			}

			if (typeof parts.fragment === "string" && parts.fragment) {
				t += "#" + parts.fragment;
			}
			return t;
		};
		URI.buildHost = function (parts) {
			var t = "";

			if (!parts.hostname) {
				return "";
			} else if (URI.ip6_expression.test(parts.hostname)) {
				t += "[" + parts.hostname + "]";
			} else {
				t += parts.hostname;
			}

			if (parts.port) {
				t += ":" + parts.port;
			}

			return t;
		};
		URI.buildAuthority = function (parts) {
			return URI.buildUserinfo(parts) + URI.buildHost(parts);
		};
		URI.buildUserinfo = function (parts) {
			var t = "";

			if (parts.username) {
				t += URI.encode(parts.username);

				if (parts.password) {
					t += ":" + URI.encode(parts.password);
				}

				t += "@";
			}

			return t;
		};
		URI.buildQuery = function (data, duplicateQueryParameters, escapeQuerySpace) {

			var t = "";
			var unique, key, i, length;
			for (key in data) {
				if (hasOwn.call(data, key) && key) {
					if (isArray(data[key])) {
						unique = {};
						for (i = 0, length = data[key].length; i < length; i++) {
							if (data[key][i] !== undefined && unique[data[key][i] + ""] === undefined) {
								t += "&" + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
								if (duplicateQueryParameters !== true) {
									unique[data[key][i] + ""] = true;
								}
							}
						}
					} else if (data[key] !== undefined) {
						t += "&" + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
					}
				}
			}

			return t.substring(1);
		};
		URI.buildQueryParameter = function (name, value, escapeQuerySpace) {
			return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? "=" + URI.encodeQuery(value, escapeQuerySpace) : "");
		};

		URI.addQuery = function (data, name, value) {
			if (typeof name === "object") {
				for (var key in name) {
					if (hasOwn.call(name, key)) {
						URI.addQuery(data, key, name[key]);
					}
				}
			} else if (typeof name === "string") {
				if (data[name] === undefined) {
					data[name] = value;
					return;
				} else if (typeof data[name] === "string") {
					data[name] = [data[name]];
				}

				if (!isArray(value)) {
					value = [value];
				}

				data[name] = (data[name] || []).concat(value);
			} else {
				throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
			}
		};
		URI.removeQuery = function (data, name, value) {
			var i, length, key;

			if (isArray(name)) {
				for (i = 0, length = name.length; i < length; i++) {
					data[name[i]] = undefined;
				}
			} else if (getType(name) === "RegExp") {
				for (key in data) {
					if (name.test(key)) {
						data[key] = undefined;
					}
				}
			} else if (typeof name === "object") {
				for (key in name) {
					if (hasOwn.call(name, key)) {
						URI.removeQuery(data, key, name[key]);
					}
				}
			} else if (typeof name === "string") {
				if (value !== undefined) {
					if (getType(value) === "RegExp") {
						if (!isArray(data[name]) && value.test(data[name])) {
							data[name] = undefined;
						} else {
							data[name] = filterArrayValues(data[name], value);
						}
					} else if (data[name] === value) {
						data[name] = undefined;
					} else if (isArray(data[name])) {
						data[name] = filterArrayValues(data[name], value);
					}
				} else {
					data[name] = undefined;
				}
			} else {
				throw new TypeError("URI.removeQuery() accepts an object, string, RegExp as the first parameter");
			}
		};
		URI.hasQuery = function (data, name, value, withinArray) {
			if (typeof name === "object") {
				for (var key in name) {
					if (hasOwn.call(name, key)) {
						if (!URI.hasQuery(data, key, name[key])) {
							return false;
						}
					}
				}

				return true;
			} else if (typeof name !== "string") {
				throw new TypeError("URI.hasQuery() accepts an object, string as the name parameter");
			}

			switch (getType(value)) {
				case "Undefined":
					return name in data;

				case "Boolean":
					var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
					return value === _booly;

				case "Function":
					return !!value(data[name], name, data);

				case "Array":
					if (!isArray(data[name])) {
						return false;
					}

					var op = withinArray ? arrayContains : arraysEqual;
					return op(data[name], value);

				case "RegExp":
					if (!isArray(data[name])) {
						return Boolean(data[name] && data[name].match(value));
					}

					if (!withinArray) {
						return false;
					}

					return arrayContains(data[name], value);

				case "Number":
					value = String(value);

				case "String":
					if (!isArray(data[name])) {
						return data[name] === value;
					}

					if (!withinArray) {
						return false;
					}

					return arrayContains(data[name], value);

				default:
					throw new TypeError("URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter");
			}
		};

		URI.commonPath = function (one, two) {
			var length = Math.min(one.length, two.length);
			var pos;

			for (pos = 0; pos < length; pos++) {
				if (one.charAt(pos) !== two.charAt(pos)) {
					pos--;
					break;
				}
			}

			if (pos < 1) {
				return one.charAt(0) === two.charAt(0) && one.charAt(0) === "/" ? "/" : "";
			}

			if (one.charAt(pos) !== "/" || two.charAt(pos) !== "/") {
				pos = one.substring(0, pos).lastIndexOf("/");
			}

			return one.substring(0, pos + 1);
		};

		URI.withinString = function (string, callback, options) {
			options || (options = {});
			var _start = options.start || URI.findUri.start;
			var _end = options.end || URI.findUri.end;
			var _trim = options.trim || URI.findUri.trim;
			var _attributeOpen = /[a-z0-9-]=["']?$/i;

			_start.lastIndex = 0;
			while (true) {
				var match = _start.exec(string);
				if (!match) {
					break;
				}

				var start = match.index;
				if (options.ignoreHtml) {
					var attributeOpen = string.slice(Math.max(start - 3, 0), start);
					if (attributeOpen && _attributeOpen.test(attributeOpen)) {
						continue;
					}
				}

				var end = start + string.slice(start).search(_end);
				var slice = string.slice(start, end).replace(_trim, "");
				if (options.ignore && options.ignore.test(slice)) {
					continue;
				}

				end = start + slice.length;
				var result = callback(slice, start, end, string);
				string = string.slice(0, start) + result + string.slice(end);
				_start.lastIndex = start + result.length;
			}

			_start.lastIndex = 0;
			return string;
		};

		URI.ensureValidHostname = function (v) {

			if (v.match(URI.invalid_hostname_characters)) {
				if (!punycode) {
					throw new TypeError("Hostname \"" + v + "\" contains characters other than [A-Z0-9.-] and Punycode.js is not available");
				}

				if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
					throw new TypeError("Hostname \"" + v + "\" contains characters other than [A-Z0-9.-]");
				}
			}
		};

		URI.noConflict = function (removeAll) {
			if (removeAll) {
				var unconflicted = {
					URI: this.noConflict()
				};

				if (root.URITemplate && typeof root.URITemplate.noConflict === "function") {
					unconflicted.URITemplate = root.URITemplate.noConflict();
				}

				if (root.IPv6 && typeof root.IPv6.noConflict === "function") {
					unconflicted.IPv6 = root.IPv6.noConflict();
				}

				if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === "function") {
					unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
				}

				return unconflicted;
			} else if (root.URI === this) {
				root.URI = _URI;
			}

			return this;
		};

		p.build = function (deferBuild) {
			if (deferBuild === true) {
				this._deferred_build = true;
			} else if (deferBuild === undefined || this._deferred_build) {
				this._string = URI.build(this._parts);
				this._deferred_build = false;
			}

			return this;
		};

		p.clone = function () {
			return new URI(this);
		};

		p.valueOf = p.toString = function () {
			return this.build(false)._string;
		};

		function generateSimpleAccessor(_part) {
			return function (v, build) {
				if (v === undefined) {
					return this._parts[_part] || "";
				} else {
					this._parts[_part] = v || null;
					this.build(!build);
					return this;
				}
			};
		}

		function generatePrefixAccessor(_part, _key) {
			return function (v, build) {
				if (v === undefined) {
					return this._parts[_part] || "";
				} else {
					if (v !== null) {
						v = v + "";
						if (v.charAt(0) === _key) {
							v = v.substring(1);
						}
					}

					this._parts[_part] = v;
					this.build(!build);
					return this;
				}
			};
		}

		p.protocol = generateSimpleAccessor("protocol");
		p.username = generateSimpleAccessor("username");
		p.password = generateSimpleAccessor("password");
		p.hostname = generateSimpleAccessor("hostname");
		p.port = generateSimpleAccessor("port");
		p.query = generatePrefixAccessor("query", "?");
		p.fragment = generatePrefixAccessor("fragment", "#");

		p.search = function (v, build) {
			var t = this.query(v, build);
			return typeof t === "string" && t.length ? "?" + t : t;
		};
		p.hash = function (v, build) {
			var t = this.fragment(v, build);
			return typeof t === "string" && t.length ? "#" + t : t;
		};

		p.pathname = function (v, build) {
			if (v === undefined || v === true) {
				var res = this._parts.path || (this._parts.hostname ? "/" : "");
				return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
			} else {
				if (this._parts.urn) {
					this._parts.path = v ? URI.recodeUrnPath(v) : "";
				} else {
					this._parts.path = v ? URI.recodePath(v) : "/";
				}
				this.build(!build);
				return this;
			}
		};
		p.path = p.pathname;
		p.href = function (href, build) {
			var key;

			if (href === undefined) {
				return this.toString();
			}

			this._string = "";
			this._parts = URI._parts();

			var _URI = href instanceof URI;
			var _object = typeof href === "object" && (href.hostname || href.path || href.pathname);
			if (href.nodeName) {
				var attribute = URI.getDomAttribute(href);
				href = href[attribute] || "";
				_object = false;
			}

			if (!_URI && _object && href.pathname !== undefined) {
				href = href.toString();
			}

			if (typeof href === "string" || href instanceof String) {
				this._parts = URI.parse(String(href), this._parts);
			} else if (_URI || _object) {
				var src = _URI ? href._parts : href;
				for (key in src) {
					if (hasOwn.call(this._parts, key)) {
						this._parts[key] = src[key];
					}
				}
			} else {
				throw new TypeError("invalid input");
			}

			this.build(!build);
			return this;
		};

		p.is = function (what) {
			var ip = false;
			var ip4 = false;
			var ip6 = false;
			var name = false;
			var sld = false;
			var idn = false;
			var punycode = false;
			var relative = !this._parts.urn;

			if (this._parts.hostname) {
				relative = false;
				ip4 = URI.ip4_expression.test(this._parts.hostname);
				ip6 = URI.ip6_expression.test(this._parts.hostname);
				ip = ip4 || ip6;
				name = !ip;
				sld = name && SLD && SLD.has(this._parts.hostname);
				idn = name && URI.idn_expression.test(this._parts.hostname);
				punycode = name && URI.punycode_expression.test(this._parts.hostname);
			}

			switch (what.toLowerCase()) {
				case "relative":
					return relative;

				case "absolute":
					return !relative;

				case "domain":
				case "name":
					return name;

				case "sld":
					return sld;

				case "ip":
					return ip;

				case "ip4":
				case "ipv4":
				case "inet4":
					return ip4;

				case "ip6":
				case "ipv6":
				case "inet6":
					return ip6;

				case "idn":
					return idn;

				case "url":
					return !this._parts.urn;

				case "urn":
					return !!this._parts.urn;

				case "punycode":
					return punycode;
			}

			return null;
		};

		var _protocol = p.protocol;
		var _port = p.port;
		var _hostname = p.hostname;

		p.protocol = function (v, build) {
			if (v !== undefined) {
				if (v) {
					v = v.replace(/:(\/\/)?$/, "");

					if (!v.match(URI.protocol_expression)) {
						throw new TypeError("Protocol \"" + v + "\" contains characters other than [A-Z0-9.+-] or doesn't start with [A-Z]");
					}
				}
			}
			return _protocol.call(this, v, build);
		};
		p.scheme = p.protocol;
		p.port = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v !== undefined) {
				if (v === 0) {
					v = null;
				}

				if (v) {
					v += "";
					if (v.charAt(0) === ":") {
						v = v.substring(1);
					}

					if (v.match(/[^0-9]/)) {
						throw new TypeError("Port \"" + v + "\" contains characters other than [0-9]");
					}
				}
			}
			return _port.call(this, v, build);
		};
		p.hostname = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v !== undefined) {
				var x = {};
				URI.parseHost(v, x);
				v = x.hostname;
			}
			return _hostname.call(this, v, build);
		};

		p.host = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined) {
				return this._parts.hostname ? URI.buildHost(this._parts) : "";
			} else {
				URI.parseHost(v, this._parts);
				this.build(!build);
				return this;
			}
		};
		p.authority = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined) {
				return this._parts.hostname ? URI.buildAuthority(this._parts) : "";
			} else {
				URI.parseAuthority(v, this._parts);
				this.build(!build);
				return this;
			}
		};
		p.userinfo = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined) {
				if (!this._parts.username) {
					return "";
				}

				var t = URI.buildUserinfo(this._parts);
				return t.substring(0, t.length - 1);
			} else {
				if (v[v.length - 1] !== "@") {
					v += "@";
				}

				URI.parseUserinfo(v, this._parts);
				this.build(!build);
				return this;
			}
		};
		p.resource = function (v, build) {
			var parts;

			if (v === undefined) {
				return this.path() + this.search() + this.hash();
			}

			parts = URI.parse(v);
			this._parts.path = parts.path;
			this._parts.query = parts.query;
			this._parts.fragment = parts.fragment;
			this.build(!build);
			return this;
		};

		p.subdomain = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined) {
				if (!this._parts.hostname || this.is("IP")) {
					return "";
				}

				var end = this._parts.hostname.length - this.domain().length - 1;
				return this._parts.hostname.substring(0, end) || "";
			} else {
				var e = this._parts.hostname.length - this.domain().length;
				var sub = this._parts.hostname.substring(0, e);
				var replace = new RegExp("^" + escapeRegEx(sub));

				if (v && v.charAt(v.length - 1) !== ".") {
					v += ".";
				}

				if (v) {
					URI.ensureValidHostname(v);
				}

				this._parts.hostname = this._parts.hostname.replace(replace, v);
				this.build(!build);
				return this;
			}
		};
		p.domain = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (typeof v === "boolean") {
				build = v;
				v = undefined;
			}

			if (v === undefined) {
				if (!this._parts.hostname || this.is("IP")) {
					return "";
				}

				var t = this._parts.hostname.match(/\./g);
				if (t && t.length < 2) {
					return this._parts.hostname;
				}

				var end = this._parts.hostname.length - this.tld(build).length - 1;
				end = this._parts.hostname.lastIndexOf(".", end - 1) + 1;
				return this._parts.hostname.substring(end) || "";
			} else {
				if (!v) {
					throw new TypeError("cannot set domain empty");
				}

				URI.ensureValidHostname(v);

				if (!this._parts.hostname || this.is("IP")) {
					this._parts.hostname = v;
				} else {
					var replace = new RegExp(escapeRegEx(this.domain()) + "$");
					this._parts.hostname = this._parts.hostname.replace(replace, v);
				}

				this.build(!build);
				return this;
			}
		};
		p.tld = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (typeof v === "boolean") {
				build = v;
				v = undefined;
			}

			if (v === undefined) {
				if (!this._parts.hostname || this.is("IP")) {
					return "";
				}

				var pos = this._parts.hostname.lastIndexOf(".");
				var tld = this._parts.hostname.substring(pos + 1);

				if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
					return SLD.get(this._parts.hostname) || tld;
				}

				return tld;
			} else {
				var replace;

				if (!v) {
					throw new TypeError("cannot set TLD empty");
				} else if (v.match(/[^a-zA-Z0-9-]/)) {
					if (SLD && SLD.is(v)) {
						replace = new RegExp(escapeRegEx(this.tld()) + "$");
						this._parts.hostname = this._parts.hostname.replace(replace, v);
					} else {
						throw new TypeError("TLD \"" + v + "\" contains characters other than [A-Z0-9]");
					}
				} else if (!this._parts.hostname || this.is("IP")) {
					throw new ReferenceError("cannot set TLD on non-domain host");
				} else {
					replace = new RegExp(escapeRegEx(this.tld()) + "$");
					this._parts.hostname = this._parts.hostname.replace(replace, v);
				}

				this.build(!build);
				return this;
			}
		};
		p.directory = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined || v === true) {
				if (!this._parts.path && !this._parts.hostname) {
					return "";
				}

				if (this._parts.path === "/") {
					return "/";
				}

				var end = this._parts.path.length - this.filename().length - 1;
				var res = this._parts.path.substring(0, end) || (this._parts.hostname ? "/" : "");

				return v ? URI.decodePath(res) : res;
			} else {
				var e = this._parts.path.length - this.filename().length;
				var directory = this._parts.path.substring(0, e);
				var replace = new RegExp("^" + escapeRegEx(directory));

				if (!this.is("relative")) {
					if (!v) {
						v = "/";
					}

					if (v.charAt(0) !== "/") {
						v = "/" + v;
					}
				}

				if (v && v.charAt(v.length - 1) !== "/") {
					v += "/";
				}

				v = URI.recodePath(v);
				this._parts.path = this._parts.path.replace(replace, v);
				this.build(!build);
				return this;
			}
		};
		p.filename = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined || v === true) {
				if (!this._parts.path || this._parts.path === "/") {
					return "";
				}

				var pos = this._parts.path.lastIndexOf("/");
				var res = this._parts.path.substring(pos + 1);

				return v ? URI.decodePathSegment(res) : res;
			} else {
				var mutatedDirectory = false;

				if (v.charAt(0) === "/") {
					v = v.substring(1);
				}

				if (v.match(/\.?\//)) {
					mutatedDirectory = true;
				}

				var replace = new RegExp(escapeRegEx(this.filename()) + "$");
				v = URI.recodePath(v);
				this._parts.path = this._parts.path.replace(replace, v);

				if (mutatedDirectory) {
					this.normalizePath(build);
				} else {
					this.build(!build);
				}

				return this;
			}
		};
		p.suffix = function (v, build) {
			if (this._parts.urn) {
				return v === undefined ? "" : this;
			}

			if (v === undefined || v === true) {
				if (!this._parts.path || this._parts.path === "/") {
					return "";
				}

				var filename = this.filename();
				var pos = filename.lastIndexOf(".");
				var s, res;

				if (pos === -1) {
					return "";
				}

				s = filename.substring(pos + 1);
				res = /^[a-z0-9%]+$/i.test(s) ? s : "";
				return v ? URI.decodePathSegment(res) : res;
			} else {
				if (v.charAt(0) === ".") {
					v = v.substring(1);
				}

				var suffix = this.suffix();
				var replace;

				if (!suffix) {
					if (!v) {
						return this;
					}

					this._parts.path += "." + URI.recodePath(v);
				} else if (!v) {
					replace = new RegExp(escapeRegEx("." + suffix) + "$");
				} else {
					replace = new RegExp(escapeRegEx(suffix) + "$");
				}

				if (replace) {
					v = URI.recodePath(v);
					this._parts.path = this._parts.path.replace(replace, v);
				}

				this.build(!build);
				return this;
			}
		};
		p.segment = function (segment, v, build) {
			var separator = this._parts.urn ? ":" : "/";
			var path = this.path();
			var absolute = path.substring(0, 1) === "/";
			var segments = path.split(separator);

			if (segment !== undefined && typeof segment !== "number") {
				build = v;
				v = segment;
				segment = undefined;
			}

			if (segment !== undefined && typeof segment !== "number") {
				throw new Error("Bad segment \"" + segment + "\", must be 0-based integer");
			}

			if (absolute) {
				segments.shift();
			}

			if (segment < 0) {
				segment = Math.max(segments.length + segment, 0);
			}

			if (v === undefined) {
				return segment === undefined ? segments : segments[segment];
			} else if (segment === null || segments[segment] === undefined) {
				if (isArray(v)) {
					segments = [];

					for (var i = 0, l = v.length; i < l; i++) {
						if (!v[i].length && (!segments.length || !segments[segments.length - 1].length)) {
							continue;
						}

						if (segments.length && !segments[segments.length - 1].length) {
							segments.pop();
						}

						segments.push(v[i]);
					}
				} else if (v || typeof v === "string") {
					if (segments[segments.length - 1] === "") {
						segments[segments.length - 1] = v;
					} else {
						segments.push(v);
					}
				}
			} else {
				if (v) {
					segments[segment] = v;
				} else {
					segments.splice(segment, 1);
				}
			}

			if (absolute) {
				segments.unshift("");
			}

			return this.path(segments.join(separator), build);
		};
		p.segmentCoded = function (segment, v, build) {
			var segments, i, l;

			if (typeof segment !== "number") {
				build = v;
				v = segment;
				segment = undefined;
			}

			if (v === undefined) {
				segments = this.segment(segment, v, build);
				if (!isArray(segments)) {
					segments = segments !== undefined ? URI.decode(segments) : undefined;
				} else {
					for (i = 0, l = segments.length; i < l; i++) {
						segments[i] = URI.decode(segments[i]);
					}
				}

				return segments;
			}

			if (!isArray(v)) {
				v = typeof v === "string" || v instanceof String ? URI.encode(v) : v;
			} else {
				for (i = 0, l = v.length; i < l; i++) {
					v[i] = URI.encode(v[i]);
				}
			}

			return this.segment(segment, v, build);
		};

		var q = p.query;
		p.query = function (v, build) {
			if (v === true) {
				return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
			} else if (typeof v === "function") {
				var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
				var result = v.call(this, data);
				this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
				this.build(!build);
				return this;
			} else if (v !== undefined && typeof v !== "string") {
				this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
				this.build(!build);
				return this;
			} else {
				return q.call(this, v, build);
			}
		};
		p.setQuery = function (name, value, build) {
			var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

			if (typeof name === "string" || name instanceof String) {
				data[name] = value !== undefined ? value : null;
			} else if (typeof name === "object") {
				for (var key in name) {
					if (hasOwn.call(name, key)) {
						data[key] = name[key];
					}
				}
			} else {
				throw new TypeError("URI.addQuery() accepts an object, string as the name parameter");
			}

			this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
			if (typeof name !== "string") {
				build = value;
			}

			this.build(!build);
			return this;
		};
		p.addQuery = function (name, value, build) {
			var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
			URI.addQuery(data, name, value === undefined ? null : value);
			this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
			if (typeof name !== "string") {
				build = value;
			}

			this.build(!build);
			return this;
		};
		p.removeQuery = function (name, value, build) {
			var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
			URI.removeQuery(data, name, value);
			this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
			if (typeof name !== "string") {
				build = value;
			}

			this.build(!build);
			return this;
		};
		p.hasQuery = function (name, value, withinArray) {
			var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
			return URI.hasQuery(data, name, value, withinArray);
		};
		p.setSearch = p.setQuery;
		p.addSearch = p.addQuery;
		p.removeSearch = p.removeQuery;
		p.hasSearch = p.hasQuery;

		p.normalize = function () {
			if (this._parts.urn) {
				return this.normalizeProtocol(false).normalizePath(false).normalizeQuery(false).normalizeFragment(false).build();
			}

			return this.normalizeProtocol(false).normalizeHostname(false).normalizePort(false).normalizePath(false).normalizeQuery(false).normalizeFragment(false).build();
		};
		p.normalizeProtocol = function (build) {
			if (typeof this._parts.protocol === "string") {
				this._parts.protocol = this._parts.protocol.toLowerCase();
				this.build(!build);
			}

			return this;
		};
		p.normalizeHostname = function (build) {
			if (this._parts.hostname) {
				if (this.is("IDN") && punycode) {
					this._parts.hostname = punycode.toASCII(this._parts.hostname);
				} else if (this.is("IPv6") && IPv6) {
					this._parts.hostname = IPv6.best(this._parts.hostname);
				}

				this._parts.hostname = this._parts.hostname.toLowerCase();
				this.build(!build);
			}

			return this;
		};
		p.normalizePort = function (build) {
			if (typeof this._parts.protocol === "string" && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
				this._parts.port = null;
				this.build(!build);
			}

			return this;
		};
		p.normalizePath = function (build) {
			var _path = this._parts.path;
			if (!_path) {
				return this;
			}

			if (this._parts.urn) {
				this._parts.path = URI.recodeUrnPath(this._parts.path);
				this.build(!build);
				return this;
			}

			if (this._parts.path === "/") {
				return this;
			}

			var _was_relative;
			var _leadingParents = "";
			var _parent, _pos;

			if (_path.charAt(0) !== "/") {
				_was_relative = true;
				_path = "/" + _path;
			}

			if (_path.slice(-3) === "/.." || _path.slice(-2) === "/.") {
				_path += "/";
			}

			_path = _path.replace(/(\/(\.\/)+)|(\/\.$)/g, "/").replace(/\/{2,}/g, "/");

			if (_was_relative) {
				_leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || "";
				if (_leadingParents) {
					_leadingParents = _leadingParents[0];
				}
			}

			while (true) {
				_parent = _path.indexOf("/..");
				if (_parent === -1) {
					break;
				} else if (_parent === 0) {
					_path = _path.substring(3);
					continue;
				}

				_pos = _path.substring(0, _parent).lastIndexOf("/");
				if (_pos === -1) {
					_pos = _parent;
				}
				_path = _path.substring(0, _pos) + _path.substring(_parent + 3);
			}

			if (_was_relative && this.is("relative")) {
				_path = _leadingParents + _path.substring(1);
			}

			_path = URI.recodePath(_path);
			this._parts.path = _path;
			this.build(!build);
			return this;
		};
		p.normalizePathname = p.normalizePath;
		p.normalizeQuery = function (build) {
			if (typeof this._parts.query === "string") {
				if (!this._parts.query.length) {
					this._parts.query = null;
				} else {
					this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
				}

				this.build(!build);
			}

			return this;
		};
		p.normalizeFragment = function (build) {
			if (!this._parts.fragment) {
				this._parts.fragment = null;
				this.build(!build);
			}

			return this;
		};
		p.normalizeSearch = p.normalizeQuery;
		p.normalizeHash = p.normalizeFragment;

		p.iso8859 = function () {
			var e = URI.encode;
			var d = URI.decode;

			URI.encode = escape;
			URI.decode = decodeURIComponent;
			try {
				this.normalize();
			} finally {
				URI.encode = e;
				URI.decode = d;
			}
			return this;
		};

		p.unicode = function () {
			var e = URI.encode;
			var d = URI.decode;

			URI.encode = strictEncodeURIComponent;
			URI.decode = unescape;
			try {
				this.normalize();
			} finally {
				URI.encode = e;
				URI.decode = d;
			}
			return this;
		};

		p.readable = function () {
			var uri = this.clone();

			uri.username("").password("").normalize();
			var t = "";
			if (uri._parts.protocol) {
				t += uri._parts.protocol + "://";
			}

			if (uri._parts.hostname) {
				if (uri.is("punycode") && punycode) {
					t += punycode.toUnicode(uri._parts.hostname);
					if (uri._parts.port) {
						t += ":" + uri._parts.port;
					}
				} else {
					t += uri.host();
				}
			}

			if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== "/") {
				t += "/";
			}

			t += uri.path(true);
			if (uri._parts.query) {
				var q = "";
				for (var i = 0, qp = uri._parts.query.split("&"), l = qp.length; i < l; i++) {
					var kv = (qp[i] || "").split("=");
					q += "&" + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace).replace(/&/g, "%26");

					if (kv[1] !== undefined) {
						q += "=" + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace).replace(/&/g, "%26");
					}
				}
				t += "?" + q.substring(1);
			}

			t += URI.decodeQuery(uri.hash(), true);
			return t;
		};

		p.absoluteTo = function (base) {
			var resolved = this.clone();
			var properties = ["protocol", "username", "password", "hostname", "port"];
			var basedir, i, p;

			if (this._parts.urn) {
				throw new Error("URNs do not have any generally defined hierarchical components");
			}

			if (!(base instanceof URI)) {
				base = new URI(base);
			}

			if (!resolved._parts.protocol) {
				resolved._parts.protocol = base._parts.protocol;
			}

			if (this._parts.hostname) {
				return resolved;
			}

			for (i = 0; p = properties[i]; i++) {
				resolved._parts[p] = base._parts[p];
			}

			if (!resolved._parts.path) {
				resolved._parts.path = base._parts.path;
				if (!resolved._parts.query) {
					resolved._parts.query = base._parts.query;
				}
			} else if (resolved._parts.path.substring(-2) === "..") {
				resolved._parts.path += "/";
			}

			if (resolved.path().charAt(0) !== "/") {
				basedir = base.directory();
				basedir = basedir ? basedir : base.path().indexOf("/") === 0 ? "/" : "";
				resolved._parts.path = (basedir ? basedir + "/" : "") + resolved._parts.path;
				resolved.normalizePath();
			}

			resolved.build();
			return resolved;
		};
		p.relativeTo = function (base) {
			var relative = this.clone().normalize();
			var relativeParts, baseParts, common, relativePath, basePath;

			if (relative._parts.urn) {
				throw new Error("URNs do not have any generally defined hierarchical components");
			}

			base = new URI(base).normalize();
			relativeParts = relative._parts;
			baseParts = base._parts;
			relativePath = relative.path();
			basePath = base.path();

			if (relativePath.charAt(0) !== "/") {
				throw new Error("URI is already relative");
			}

			if (basePath.charAt(0) !== "/") {
				throw new Error("Cannot calculate a URI relative to another relative URI");
			}

			if (relativeParts.protocol === baseParts.protocol) {
				relativeParts.protocol = null;
			}

			if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
				return relative.build();
			}

			if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
				return relative.build();
			}

			if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
				relativeParts.hostname = null;
				relativeParts.port = null;
			} else {
				return relative.build();
			}

			if (relativePath === basePath) {
				relativeParts.path = "";
				return relative.build();
			}

			common = URI.commonPath(relativePath, basePath);

			if (!common) {
				return relative.build();
			}

			var parents = baseParts.path.substring(common.length).replace(/[^\/]*$/, "").replace(/.*?\//g, "../");

			relativeParts.path = parents + relativeParts.path.substring(common.length) || "./";

			return relative.build();
		};

		p.equals = function (uri) {
			var one = this.clone();
			var two = new URI(uri);
			var one_map = {};
			var two_map = {};
			var checked = {};
			var one_query, two_query, key;

			one.normalize();
			two.normalize();

			if (one.toString() === two.toString()) {
				return true;
			}

			one_query = one.query();
			two_query = two.query();
			one.query("");
			two.query("");

			if (one.toString() !== two.toString()) {
				return false;
			}

			if (one_query.length !== two_query.length) {
				return false;
			}

			one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
			two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

			for (key in one_map) {
				if (hasOwn.call(one_map, key)) {
					if (!isArray(one_map[key])) {
						if (one_map[key] !== two_map[key]) {
							return false;
						}
					} else if (!arraysEqual(one_map[key], two_map[key])) {
						return false;
					}

					checked[key] = true;
				}
			}

			for (key in two_map) {
				if (hasOwn.call(two_map, key)) {
					if (!checked[key]) {
						return false;
					}
				}
			}

			return true;
		};

		p.duplicateQueryParameters = function (v) {
			this._parts.duplicateQueryParameters = !!v;
			return this;
		};

		p.escapeQuerySpace = function (v) {
			this._parts.escapeQuerySpace = !!v;
			return this;
		};

		return URI;
	});
}, function (module, exports, __webpack_require__) {
	(function (module) {

		var formurlencoded = (true ? module : {}).exports = {

			encode: function encode(data, options) {
				function getNestValsArrAsStr(arr) {
					return arr.filter(function (e) {
						return typeof e === "string" && e.length;
					}).join("&");
				}

				function getKeys(obj) {
					var keys = Object.keys(obj);

					return options && options.sorted ? keys.sort() : keys;
				}

				function getObjNestVals(name, obj) {
					var objKeyStr = ":name[:prop]";

					return getNestValsArrAsStr(getKeys(obj).map(function (key) {
						return getNestVals(objKeyStr.replace(/:name/, name).replace(/:prop/, key), obj[key]);
					}));
				}

				function getArrNestVals(name, arr) {
					var arrKeyStr = ":name[]";

					return getNestValsArrAsStr(arr.map(function (elem) {
						return getNestVals(arrKeyStr.replace(/:name/, name), elem);
					}));
				}

				function getNestVals(name, value) {
					var whitespaceRe = /%20/g,
					    type = typeof value,
					    f = null;

					if (type === "string") {
						f = encodeURIComponent(name) + "=" + formEncodeString(value);
					} else if (type === "number") {
						f = encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(whitespaceRe, "+");
					} else if (type === "boolean") {
						f = encodeURIComponent(name) + "=" + value;
					} else if (Array.isArray(value)) {
						f = getArrNestVals(name, value);
					} else if (type === "object") {
						f = getObjNestVals(name, value);
					}

					return f;
				}

				function manuallyEncodeChar(ch) {
					return "%" + ("0" + ch.charCodeAt(0).toString(16)).slice(-2).toUpperCase();
				};

				function formEncodeString(value) {
					return value.replace(/[^ !'()~\*]*/g, encodeURIComponent).replace(/ /g, "+").replace(/[!'()~\*]/g, manuallyEncodeChar);
				};

				return getNestValsArrAsStr(getKeys(data).map(function (key) {
					return getNestVals(key, data[key]);
				}));
			}
		};
	}).call(exports, __webpack_require__(31)(module));
}, function (module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function (module, global) {
		;(function (root) {
			var freeExports = typeof exports == "object" && exports;
			var freeModule = typeof module == "object" && module && module.exports == freeExports && module;
			var freeGlobal = typeof global == "object" && global;
			if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
				root = freeGlobal;
			}

			var punycode,
			    maxInt = 2147483647,
			    base = 36,
			    tMin = 1,
			    tMax = 26,
			    skew = 38,
			    damp = 700,
			    initialBias = 72,
			    initialN = 128,
			    delimiter = "-",
			    regexPunycode = /^xn--/,
			    regexNonASCII = /[^ -~]/,
			    regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g,
			    errors = {
				overflow: "Overflow: input needs wider integers to process",
				"not-basic": "Illegal input >= 0x80 (not a basic code point)",
				"invalid-input": "Invalid input"
			},
			    baseMinusTMin = base - tMin,
			    floor = Math.floor,
			    stringFromCharCode = String.fromCharCode,
			    key;

			function error(type) {
				throw RangeError(errors[type]);
			}

			function map(array, fn) {
				var length = array.length;
				while (length--) {
					array[length] = fn(array[length]);
				}
				return array;
			}

			function mapDomain(string, fn) {
				return map(string.split(regexSeparators), fn).join(".");
			}

			function ucs2decode(string) {
				var output = [],
				    counter = 0,
				    length = string.length,
				    value,
				    extra;
				while (counter < length) {
					value = string.charCodeAt(counter++);
					if (value >= 55296 && value <= 56319 && counter < length) {
						extra = string.charCodeAt(counter++);
						if ((extra & 64512) == 56320) {
							output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
						} else {
							output.push(value);
							counter--;
						}
					} else {
						output.push(value);
					}
				}
				return output;
			}

			function ucs2encode(array) {
				return map(array, function (value) {
					var output = "";
					if (value > 65535) {
						value -= 65536;
						output += stringFromCharCode(value >>> 10 & 1023 | 55296);
						value = 56320 | value & 1023;
					}
					output += stringFromCharCode(value);
					return output;
				}).join("");
			}

			function basicToDigit(codePoint) {
				if (codePoint - 48 < 10) {
					return codePoint - 22;
				}
				if (codePoint - 65 < 26) {
					return codePoint - 65;
				}
				if (codePoint - 97 < 26) {
					return codePoint - 97;
				}
				return base;
			}

			function digitToBasic(digit, flag) {
				return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
			}

			function adapt(delta, numPoints, firstTime) {
				var k = 0;
				delta = firstTime ? floor(delta / damp) : delta >> 1;
				delta += floor(delta / numPoints);
				for (; delta > baseMinusTMin * tMax >> 1; k += base) {
					delta = floor(delta / baseMinusTMin);
				}
				return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
			}

			function decode(input) {
				var output = [],
				    inputLength = input.length,
				    out,
				    i = 0,
				    n = initialN,
				    bias = initialBias,
				    basic,
				    j,
				    index,
				    oldi,
				    w,
				    k,
				    digit,
				    t,
				    length,
				    baseMinusT;

				basic = input.lastIndexOf(delimiter);
				if (basic < 0) {
					basic = 0;
				}

				for (j = 0; j < basic; ++j) {
					if (input.charCodeAt(j) >= 128) {
						error("not-basic");
					}
					output.push(input.charCodeAt(j));
				}

				for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
					for (oldi = i, w = 1, k = base;; k += base) {

						if (index >= inputLength) {
							error("invalid-input");
						}

						digit = basicToDigit(input.charCodeAt(index++));

						if (digit >= base || digit > floor((maxInt - i) / w)) {
							error("overflow");
						}

						i += digit * w;
						t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

						if (digit < t) {
							break;
						}

						baseMinusT = base - t;
						if (w > floor(maxInt / baseMinusT)) {
							error("overflow");
						}

						w *= baseMinusT;
					}

					out = output.length + 1;
					bias = adapt(i - oldi, out, oldi == 0);

					if (floor(i / out) > maxInt - n) {
						error("overflow");
					}

					n += floor(i / out);
					i %= out;

					output.splice(i++, 0, n);
				}

				return ucs2encode(output);
			}

			function encode(input) {
				var n,
				    delta,
				    handledCPCount,
				    basicLength,
				    bias,
				    j,
				    m,
				    q,
				    k,
				    t,
				    currentValue,
				    output = [],
				    inputLength,
				    handledCPCountPlusOne,
				    baseMinusT,
				    qMinusT;

				input = ucs2decode(input);

				inputLength = input.length;

				n = initialN;
				delta = 0;
				bias = initialBias;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue < 128) {
						output.push(stringFromCharCode(currentValue));
					}
				}

				handledCPCount = basicLength = output.length;

				if (basicLength) {
					output.push(delimiter);
				}

				while (handledCPCount < inputLength) {
					for (m = maxInt, j = 0; j < inputLength; ++j) {
						currentValue = input[j];
						if (currentValue >= n && currentValue < m) {
							m = currentValue;
						}
					}

					handledCPCountPlusOne = handledCPCount + 1;
					if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
						error("overflow");
					}

					delta += (m - n) * handledCPCountPlusOne;
					n = m;

					for (j = 0; j < inputLength; ++j) {
						currentValue = input[j];

						if (currentValue < n && ++delta > maxInt) {
							error("overflow");
						}

						if (currentValue == n) {
							for (q = delta, k = base;; k += base) {
								t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
								if (q < t) {
									break;
								}
								qMinusT = q - t;
								baseMinusT = base - t;
								output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
								q = floor(qMinusT / baseMinusT);
							}

							output.push(stringFromCharCode(digitToBasic(q, 0)));
							bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
							delta = 0;
							++handledCPCount;
						}
					}

					++delta;
					++n;
				}
				return output.join("");
			}

			function toUnicode(domain) {
				return mapDomain(domain, function (string) {
					return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
				});
			}

			function toASCII(domain) {
				return mapDomain(domain, function (string) {
					return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
				});
			}

			punycode = {
				version: "1.2.3",
				ucs2: {
					decode: ucs2decode,
					encode: ucs2encode
				},
				decode: decode,
				encode: encode,
				toASCII: toASCII,
				toUnicode: toUnicode
			};

			if (true) {
				!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
					return punycode;
				}).call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			} else if (freeExports && !freeExports.nodeType) {
				if (freeModule) {
					freeModule.exports = punycode;
				} else {
					for (key in punycode) {
						punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
					}
				}
			} else {
				root.punycode = punycode;
			}
		})(this);
	}).call(exports, __webpack_require__(31)(module), (function () {
		return this;
	})());
}, function (module, exports, __webpack_require__) {

	(function (root, factory) {
		"use strict";

		if (true) {
			module.exports = factory();
		} else if (typeof define === "function" && define.amd) {
			define(factory);
		} else {
			root.IPv6 = factory(root);
		}
	})(this, function (root) {
		"use strict";

		var _IPv6 = root && root.IPv6;

		function bestPresentation(address) {

			var _address = address.toLowerCase();
			var segments = _address.split(":");
			var length = segments.length;
			var total = 8;

			if (segments[0] === "" && segments[1] === "" && segments[2] === "") {
				segments.shift();
				segments.shift();
			} else if (segments[0] === "" && segments[1] === "") {
				segments.shift();
			} else if (segments[length - 1] === "" && segments[length - 2] === "") {
				segments.pop();
			}

			length = segments.length;

			if (segments[length - 1].indexOf(".") !== -1) {
				total = 7;
			}

			var pos;
			for (pos = 0; pos < length; pos++) {
				if (segments[pos] === "") {
					break;
				}
			}

			if (pos < total) {
				segments.splice(pos, 1, "0000");
				while (segments.length < total) {
					segments.splice(pos, 0, "0000");
				}

				length = segments.length;
			}

			var _segments;
			for (var i = 0; i < total; i++) {
				_segments = segments[i].split("");
				for (var j = 0; j < 3; j++) {
					if (_segments[0] === "0" && _segments.length > 1) {
						_segments.splice(0, 1);
					} else {
						break;
					}
				}

				segments[i] = _segments.join("");
			}

			var best = -1;
			var _best = 0;
			var _current = 0;
			var current = -1;
			var inzeroes = false;

			for (i = 0; i < total; i++) {
				if (inzeroes) {
					if (segments[i] === "0") {
						_current += 1;
					} else {
						inzeroes = false;
						if (_current > _best) {
							best = current;
							_best = _current;
						}
					}
				} else {
					if (segments[i] === "0") {
						inzeroes = true;
						current = i;
						_current = 1;
					}
				}
			}

			if (_current > _best) {
				best = current;
				_best = _current;
			}

			if (_best > 1) {
				segments.splice(best, _best, "");
			}

			length = segments.length;

			var result = "";
			if (segments[0] === "") {
				result = ":";
			}

			for (i = 0; i < length; i++) {
				result += segments[i];
				if (i === length - 1) {
					break;
				}

				result += ":";
			}

			if (segments[length - 1] === "") {
				result += ":";
			}

			return result;
		}

		function noConflict() {
			if (root.IPv6 === this) {
				root.IPv6 = _IPv6;
			}

			return this;
		}

		return {
			best: bestPresentation,
			noConflict: noConflict
		};
	});
}, function (module, exports, __webpack_require__) {

	(function (root, factory) {
		"use strict";

		if (true) {
			module.exports = factory();
		} else if (typeof define === "function" && define.amd) {
			define(factory);
		} else {
			root.SecondLevelDomains = factory(root);
		}
	})(this, function (root) {
		"use strict";

		var _SecondLevelDomains = root && root.SecondLevelDomains;

		var SLD = {
			list: {
				ac: " com gov mil net org ",
				ae: " ac co gov mil name net org pro sch ",
				af: " com edu gov net org ",
				al: " com edu gov mil net org ",
				ao: " co ed gv it og pb ",
				ar: " com edu gob gov int mil net org tur ",
				at: " ac co gv or ",
				au: " asn com csiro edu gov id net org ",
				ba: " co com edu gov mil net org rs unbi unmo unsa untz unze ",
				bb: " biz co com edu gov info net org store tv ",
				bh: " biz cc com edu gov info net org ",
				bn: " com edu gov net org ",
				bo: " com edu gob gov int mil net org tv ",
				br: " adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ",
				bs: " com edu gov net org ",
				bz: " du et om ov rg ",
				ca: " ab bc mb nb nf nl ns nt nu on pe qc sk yk ",
				ck: " biz co edu gen gov info net org ",
				cn: " ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ",
				co: " com edu gov mil net nom org ",
				cr: " ac c co ed fi go or sa ",
				cy: " ac biz com ekloges gov ltd name net org parliament press pro tm ",
				"do": " art com edu gob gov mil net org sld web ",
				dz: " art asso com edu gov net org pol ",
				ec: " com edu fin gov info med mil net org pro ",
				eg: " com edu eun gov mil name net org sci ",
				er: " com edu gov ind mil net org rochest w ",
				es: " com edu gob nom org ",
				et: " biz com edu gov info name net org ",
				fj: " ac biz com info mil name net org pro ",
				fk: " ac co gov net nom org ",
				fr: " asso com f gouv nom prd presse tm ",
				gg: " co net org ",
				gh: " com edu gov mil org ",
				gn: " ac com gov net org ",
				gr: " com edu gov mil net org ",
				gt: " com edu gob ind mil net org ",
				gu: " com edu gov net org ",
				hk: " com edu gov idv net org ",
				hu: " 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ",
				id: " ac co go mil net or sch web ",
				il: " ac co gov idf k12 muni net org ",
				"in": " ac co edu ernet firm gen gov i ind mil net nic org res ",
				iq: " com edu gov i mil net org ",
				ir: " ac co dnssec gov i id net org sch ",
				it: " edu gov ",
				je: " co net org ",
				jo: " com edu gov mil name net org sch ",
				jp: " ac ad co ed go gr lg ne or ",
				ke: " ac co go info me mobi ne or sc ",
				kh: " com edu gov mil net org per ",
				ki: " biz com de edu gov info mob net org tel ",
				km: " asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ",
				kn: " edu gov net org ",
				kr: " ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ",
				kw: " com edu gov net org ",
				ky: " com edu gov net org ",
				kz: " com edu gov mil net org ",
				lb: " com edu gov net org ",
				lk: " assn com edu gov grp hotel int ltd net ngo org sch soc web ",
				lr: " com edu gov net org ",
				lv: " asn com conf edu gov id mil net org ",
				ly: " com edu gov id med net org plc sch ",
				ma: " ac co gov m net org press ",
				mc: " asso tm ",
				me: " ac co edu gov its net org priv ",
				mg: " com edu gov mil nom org prd tm ",
				mk: " com edu gov inf name net org pro ",
				ml: " com edu gov net org presse ",
				mn: " edu gov org ",
				mo: " com edu gov net org ",
				mt: " com edu gov net org ",
				mv: " aero biz com coop edu gov info int mil museum name net org pro ",
				mw: " ac co com coop edu gov int museum net org ",
				mx: " com edu gob net org ",
				my: " com edu gov mil name net org sch ",
				nf: " arts com firm info net other per rec store web ",
				ng: " biz com edu gov mil mobi name net org sch ",
				ni: " ac co com edu gob mil net nom org ",
				np: " com edu gov mil net org ",
				nr: " biz com edu gov info net org ",
				om: " ac biz co com edu gov med mil museum net org pro sch ",
				pe: " com edu gob mil net nom org sld ",
				ph: " com edu gov i mil net ngo org ",
				pk: " biz com edu fam gob gok gon gop gos gov net org web ",
				pl: " art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ",
				pr: " ac biz com edu est gov info isla name net org pro prof ",
				ps: " com edu gov net org plo sec ",
				pw: " belau co ed go ne or ",
				ro: " arts com firm info nom nt org rec store tm www ",
				rs: " ac co edu gov in org ",
				sb: " com edu gov net org ",
				sc: " com edu gov net org ",
				sh: " co com edu gov net nom org ",
				sl: " com edu gov net org ",
				st: " co com consulado edu embaixada gov mil net org principe saotome store ",
				sv: " com edu gob org red ",
				sz: " ac co org ",
				tr: " av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ",
				tt: " aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ",
				tw: " club com ebiz edu game gov idv mil net org ",
				mu: " ac co com gov net or org ",
				mz: " ac co edu gov org ",
				na: " co com ",
				nz: " ac co cri geek gen govt health iwi maori mil net org parliament school ",
				pa: " abo ac com edu gob ing med net nom org sld ",
				pt: " com edu gov int net nome org publ ",
				py: " com edu gov mil net org ",
				qa: " com edu gov mil net org ",
				re: " asso com nom ",
				ru: " ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ",
				rw: " ac co com edu gouv gov int mil net ",
				sa: " com edu gov med net org pub sch ",
				sd: " com edu gov info med net org tv ",
				se: " a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ",
				sg: " com edu gov idn net org per ",
				sn: " art com edu gouv org perso univ ",
				sy: " com edu gov mil net news org ",
				th: " ac co go in mi net or ",
				tj: " ac biz co com edu go gov info int mil name net nic org test web ",
				tn: " agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ",
				tz: " ac co go ne or ",
				ua: " biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ",
				ug: " ac co go ne or org sc ",
				uk: " ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ",
				us: " dni fed isa kids nsn ",
				uy: " com edu gub mil net org ",
				ve: " co com edu gob info mil net org web ",
				vi: " co com k12 net org ",
				vn: " ac biz com edu gov health info int name net org pro ",
				ye: " co com gov ltd me net org plc ",
				yu: " ac co edu gov org ",
				za: " ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ",
				zm: " ac co com edu gov net org sch "
			},
			has: function has(domain) {
				var tldOffset = domain.lastIndexOf(".");
				if (tldOffset <= 0 || tldOffset >= domain.length - 1) {
					return false;
				}
				var sldOffset = domain.lastIndexOf(".", tldOffset - 1);
				if (sldOffset <= 0 || sldOffset >= tldOffset - 1) {
					return false;
				}
				var sldList = SLD.list[domain.slice(tldOffset + 1)];
				if (!sldList) {
					return false;
				}
				return sldList.indexOf(" " + domain.slice(sldOffset + 1, tldOffset) + " ") >= 0;
			},
			is: function is(domain) {
				var tldOffset = domain.lastIndexOf(".");
				if (tldOffset <= 0 || tldOffset >= domain.length - 1) {
					return false;
				}
				var sldOffset = domain.lastIndexOf(".", tldOffset - 1);
				if (sldOffset >= 0) {
					return false;
				}
				var sldList = SLD.list[domain.slice(tldOffset + 1)];
				if (!sldList) {
					return false;
				}
				return sldList.indexOf(" " + domain.slice(0, tldOffset) + " ") >= 0;
			},
			get: function get(domain) {
				var tldOffset = domain.lastIndexOf(".");
				if (tldOffset <= 0 || tldOffset >= domain.length - 1) {
					return null;
				}
				var sldOffset = domain.lastIndexOf(".", tldOffset - 1);
				if (sldOffset <= 0 || sldOffset >= tldOffset - 1) {
					return null;
				}
				var sldList = SLD.list[domain.slice(tldOffset + 1)];
				if (!sldList) {
					return null;
				}
				if (sldList.indexOf(" " + domain.slice(sldOffset + 1, tldOffset) + " ") < 0) {
					return null;
				}
				return domain.slice(sldOffset + 1);
			},
			noConflict: function noConflict() {
				if (root.SecondLevelDomains === this) {
					root.SecondLevelDomains = _SecondLevelDomains;
				}
				return this;
			}
		};

		return SLD;
	});
}, function (module, exports, __webpack_require__) {

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];

			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};
}]);