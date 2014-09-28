# angular-hy-res [![Build Status](https://travis-ci.org/petejohanson/angular-hy-res.svg?branch=master)](https://travis-ci.org/petejohanson/angular-hy-res)

A hypermedia client/library for [AngularJS](http://angularjs.org/). A [HAL](http://tools.ietf.org/html/draft-kelly-json-hal-06) media type extension is included by default, but support for other media types can be added.

## Installation

### Bower

angular-hy-res is available via Bower. To install:

    $ bower install --save angular-hy-res

_Note: The API is still evolving, so during the 0.0.x series of releases there are no API stability guarantees Those users needed a stable API should set an explicit version in bower.json_

### Manual

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/petejohanson/angular-hy-res/master/dist/angular-hy-res-full.min.js
[max]: https://raw.github.com/petejohanson/angular-hy-res/master/dist/angular-hy-res-full.js

In your web page:

```html
<script src="angular.js"></script>
<script src="dist/angular-hy-res-full.min.js"></script>
```

## Documentation

angular-hy-res offers an alternative to the built in AngularJS `$resource` service that focuses on using hypermedia
controls, links (and/or embedded resources) discovered by link relation, to traverse a hypermedia enabled API.

The core of angular-hy-res is found in the `angular-hy-res` AngularJs module. To enable it, add that module to your own
module definition. In addition, if you want to use the HAL or Link header integration, you must include the `angular-hy-res-hal` or `angular-hy-res-link-header` modules:

```javascript
angular.module('myApp', [
    'angular-hy-res',
    'angular-hy-res-hal',
    'angular-hy-res-link-header'
  ]);
```

_In the future, integration with other hypermedia formats, e.g. Siren, Uber, JSON-LD, will be available in their own modules._

### hrRoot

Most hypermedia APIs are accessed by fetching the API root from a well known URL, and then following links from there
to do any further interactions. The main entry point to `angular-hy-res` is the `hrRoot` service, which allows you
to fetch a resource for the API root. The easiest way to do this is to inject the root in the `$routeProvider`:

```javascript
$routeProvider
  .when('/posts', {
    resolve: {
      root: function(hrRoot) {
        return hrRoot('/api').follow().$promise;
      }
    }
  };
```

_Note: We are using the `$promise` property of a resource to keep the route from resolving until the root is fully fetched._

#### hrRoot(url)

Returns a `hrWebLink` that can be followed to retrieve the root `hrResource`. See `hrResource` for details on the API available
once once you have retrieved the root.

### hrResource

`angular-hy-res` resources behave like `ngResource`, in that resources are returned directly from calls, and the values
in the resource will be merged into the object once the background request(s) complete. Doing so allows the view
layer to directly bind to the resource fields. Should you need to do something once the resource is loaded,
the `$promise` property of the resource is available.

`hrResource offers several functions you can use to interact with links and embedded resources found in
the resource.

#### $follow(rel, options)

This function will follow the given link relation and return either a resource, or array of resources, depending on the
cardinality of the link relation. It will first attempt to locate the link relation in the embedded resources, and fall
back to checking for the presence of a link(s) and loading those. Depending on whether an embedded version is found,
or only a link, will determine whether the resource will already be resolved, or will be so in the future. The optional `options`
parameter can be used to pass additional options to the underlying `$http` request.

```javascript
res.$follow('next')
=> Resource { $resolved: false, $promise: $q promise object }
```

_Note: In HAL, whether a given link relation wil contain a single link object, or a (possibly empty) array of link objects
is considered part of the 'contract', and any change to this cardinality is considered a breaking change._

##### URI Templates

Should the particular link relation contain a [URI Template](http://tools.ietf.org/html/rfc6570) instead of a URL, then
values passed in the `data` property of the `options` parameter will be used to process URI Template, e.g.

For resource with the following link relation:

```json
  "_links": {
    "post": {
      "href": "/posts{/id}",
      "templated": true
    }
  }
```

You can follow the `post` link relation with the following:

```javascript
var postId = '123';
res.$follow(
  'post',
  {
    data: { 
      id: postId
    }
  })
=> Resource { $resolved: false, $promise: $q promise, ... }
```

#### $promise

This property is a `$q` promise that can be used to perform work once the resource is resolved. For resources that were 
embedded, the promise may already resolved when the resource is initially created.

#### $resolved

This property is a simple boolean `true/false` value indicating whether the specific resource has been resolved or not.

#### $link(rel)

This function will return either a `hrWebLink` or a `hrLinkCollection` depending on the cardinality of the relation in
the resource. See the `hrWebLink` section for more details.

```javascript
res.$link('next')
=> hrWebLink { href: '/posts?page=2' }
```

Or for a collection of links:

```javascript
res.$link('posts')
=> hrLinkCollection [ { href: '/posts/123' }, { href: '/posts/345' } ]
```

#### $embedded(rel)

This function will return either a resource, or an array of resources, for the given link relation, depending on the
cardinality of the link relation. If the link relation is not found embedded in the resource, then `null` will be returned
instead.

```javascript
res.$follow('item')
=> hrResource { $resolved: true, $promise: resolved $q promise, ... various properties }
```

### hrWebLink

Currently, there is one implementation of the concept of a link, `hrWebLink`, which encapsulates the data and concepts
codified in [RFC5988](http://tools.ietf.org/html/rfc5988). The standard data fields (if defined for the specific link),
such as `href`, `title`, `type`, etc are all defined on the link. In addition, there just a single function that can be
invoked for the link, `follow`:

#### follow(options)

The `follow` function of an `hrWebLink` is used to dereference the target URI, and returns an `hrResource` instance.
Just like AngularJS' built in `$resource`, a promise is not returned, the resource itself is returned, and it will be
populated with values in some future time, simplifying binding to resource in templates. Should you need a promise,
use the `$promise` property of the `hrResource`.

The optional `options` parameter will be passed to the underlying [`$http`](https://docs.angularjs.org/api/ng/service/$http) service call.
Use options if you need to override the HTTP method for the call, provide query parameters, etc.

### hrLinkCollection

If a `hrResource` instance contains multiple links for the same link relation, then following that relation will
return a `hrLinkCollection` resource. All the expected `Array` accessors, such as `[]`, `length` will work as expected.
In addition, a `follow` function can be used to dereference all the links contained in the collection:

#### `follow(options)`

Returns an `Array` of `hrResource` instances. In addition, the array has a `$promise` property that will resolve
when all of the `hrResource` instances resolve, allowing you to perform some logic once everything has been fetched.

### HAL Extension

By default, the HAL extension will only process links an embedded resources in responses if the HTTP response
`Content-Type` header equals `application/hal+json`. If you have a custom media type that extends HAL, you can register
it with with the `hrHalExtensionProvider` in the `mediaTypes` array:

```javascript
angular.module('myModule', ['angular-hy-res-hal'])
  .config(function(hrHalExtensionProvider) {
    hrHalExtensionProvider.mediaTypes.push('application/vnd.myco.mytype');
  });
```

## Examples

A complete working example can be found at [angular-hy-res-example](https://github.com/petejohanson/angular-hy-res-example),
which demonstrates the below pagination concept.

For example, given a HAL collection resource that uses the standard link relations `next` and `prev` to control
paging through the collection, and the `item` relation for each item in the collection, here is a sample response:

```json
{
    "_links": {
        "self": { "href": "/page/2" },
        "next": { "href": "/page/3" },
        "prev": { "href": "/page/1" }
    }
    "_embedded": {
        "item": [
          {
            "_links": { "self": { "href": "/posts/123" } },
            "title": "MY blog post",
            "tags": [ "blogging", "hypermedia" ]
          }
        ]
    }
}
```

Then the controller can easily be:

```javascript
angular.module('angularHyResDocs')
  .controller('ahrdPageCtrl', function(root) {
    $scope.page = root.$follow('http://api.myserver.com/rel/posts');
    
    var follow = function(rel) {
      $scope.page = $scope.page.$follow('next');
    };
    
    $scope.next = function() {
      if (!$scope.hasNext()) {
        return;
      }
      
      follow('next');
    };
    
    $scope.prev = function() {
      if (!$scope.hasPrev()) {
        return;
      }
      
      follow('prev');
    };
    
    $scope.hasNext = function() {
      angular.isObject($scope.page.$link('next'));
    };
    
    $scope.hasPrev = function() {
      angular.isObject($scope.page.$link('prev'));
    };
    
    $scope.items = function() {
      return $scope.$embedded('item');
    };
  });
```

And the view:

```html
<div>
  <ul class="pagination">
    <li>
      <a ng-click="{{prev()}}" ng-class="{disabled: !hasPrev()}">&laquo;</a>
    </li>
    <li>
      <a ng-click="{{next()}}" ng-class="{disabled: !hasNext()}">&raquo;</a>
    </li>
  </ul>
  <ul>
    <li ng-repeat="post in posts()">{{post.title}}</li>
  </ul>
</div>
```

## To Do

* Extensions for other media types (e.g. Siren, Uber)
* Convenience function on `hrResource` to check for presence of relation in either links or embedded.
* Hypermedia Actions/Forms? (Not present in HAL)
* Handle following a link relation that will be an array once the given resource resolves.
* Mixins for resources based on... profile? link relation that was followed?
* Differentiate between embedded link vs embedded representation (See Siren spec)
* Correct relative URI resolution for following links.
* Sane error handling
