# angular-hy-res [![Build Status](https://travis-ci.org/petejohanson/angular-hy-res.svg?branch=master)](https://travis-ci.org/petejohanson/angular-hy-res)

A hypermedia client/library for [AngularJS](http://angularjs.org/). [HAL](http://tools.ietf.org/html/draft-kelly-json-hal-06), [Siren](https://github.com/kevinswiber/siren), and [Link header](https://tools.ietf.org/html/rfc5988) extensions are included by default, but support for other media types can be added.
angular-hy-res is an thin AngularJS wrapper around the core [hy-res](http://github.com/petejohanson/hy-res) library. 

## Support

For any questions, please post to the [AngularHyRes Google Group](https://groups.google.com/forum/#!forum/angular-hy-res).

## Installation

### Bower

angular-hy-res is available via Bower. To install:

    $ bower install --save angular-hy-res

### NPM

angular-hy-res is also published as an node module w/ NPM. To install:

    $ npm install --save angular-hy-res

It is recommended to use it along with [Browserify](http://browserify.org/) or
[Webpack](https://webpack.github.io/).

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

_Note: For more documentation, refer to the full [API documentation](http://petejohanson.github.io/hy-res/)
for the core `hy-res` library._

The core of angular-hy-res is found in the `hrCore` AngularJs module. To enable it, add that module to your own
module definition. In addition, if you want to use the Collection+JSON, HAL, Siren, or Link header integration,
you must include the `hrCollectionJson`, `hrHal`, `hrSiren`, or `hrLinkHeader` modules:

```javascript
angular.module('myApp', [
    'hrCore',
    'hrCollectionJson',
    'hrHal',
    'hrSiren',
    'hrLinkHeader',
    'hrJson'
  ]);
```

The `hrJson` module handles data for simple `application/json` responses, with no additional
hypermedia controls present.

_In the future, integration with other hypermedia formats, e.g. Uber, JSON-LD, will be available in their own modules._

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

Returns a `hrWebLink` that can be followed to retrieve the root hy-res `Resource`. See [Resource](http://petejohanson.github.io/hy-res/Resource.html)
for details on the API available once once you have retrieved the root.

### Collection+JSON Extension

By default, the Collection+JSON extension will only process links an embedded resources in responses if the HTTP response
`Content-Type` header equals `application/vnd.collection+json`. If you have a custom media type that extends Collection+JSON, you can register
it with with the `hrCollectionJsonExtensionProvider` in the `mediaTypes` array:

```javascript
angular.module('myModule', ['hrCollectionJson'])
  .config(function(hrCollectionJsonExtensionProvider) {
    hrSirenExtensionProvider.mediaTypes.push('application/vnd.myco.mytype');
  });
```

Collection+JSON queries are exposed as forms, and can be accessed using `Resource#$form`
or `Resource#$forms`. For adding items, a form is accessible using the
`create-form` IANA standard link relation.

Collection items can be extracted using the `item` standard link relation using
`Resource#$sub` or `Resource#$subs`.

A given embedded item can be edited by using the form with the `edit-form` standard
link relation.

### HAL Extension

By default, the HAL extension will only process links an embedded resources in responses if the HTTP response
`Content-Type` header equals `application/hal+json`. If you have a custom media type that extends HAL, you can register
it with with the `hrHalExtensionProvider` in the `mediaTypes` array:

```javascript
angular.module('myModule', ['hrHal'])
  .config(function(hrHalExtensionProvider) {
    hrHalExtensionProvider.mediaTypes.push('application/vnd.myco.mytype');
  });
```

### Siren Extension

By default, the Siren extension will only process links an embedded resources in responses if the HTTP response
`Content-Type` header equals `application/vnd.siren+json`. If you have a custom media type that extends Siren, you can register
it with with the `hrSirenExtensionProvider` in the `mediaTypes` array:

```javascript
angular.module('myModule', ['hrSiren'])
  .config(function(hrSirenExtensionProvider) {
    hrSirenExtensionProvider.mediaTypes.push('application/vnd.myco.mytype');
  });
```

At this point, the Siren extension includes both the Siren `links` and the sub-entity embedded links in the set
 queried by the `$link` function of `hrResource`.

## Examples

A complete working example can be found at [angular-hy-res-example](https://github.com/petejohanson/angular-hy-res-example),
which demonstrates the below pagination concept. A public copy is deployed to Heroku at:

[https://angular-hy-res-example.herokuapp.com/](https://angular-hy-res-example.herokuapp.com/)

For example, given a HAL collection resource that uses the standard link relations `next` and `prev` to control
paging through the collection, and the `item` relation for each item in the collection, here is a sample response:

```json
{
    "_links": {
        "self": { "href": "/page/2" },
        "next": { "href": "/page/3" },
        "prev": { "href": "/page/1" }
    },
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
    $scope.page = root.$followOne('http://api.myserver.com/rel/posts');
    $scope.posts = $scope.page.$followAll('item');
    
    var follow = function(rel) {
      $scope.page = $scope.page.$followOne(rel);
      $scope.posts = $scope.page.$followAll('item');
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
      return $scope.page.$has('next');
    };
    
    $scope.hasPrev = function() {
      return $scope.page.$has('prev');
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
    <li ng-repeat="post in posts">{{post.title}}</li>
  </ul>
</div>
```

Another complete working example can be found at [pollsApiClient](https://github.com/XVincentX/pollsApiClient),
which uses most of library features, such as actions, links, pagination, link following and so on. A public copy is deployed to Heroku at:

[https://pollsapiclient.herokuapp.com/](https://pollsapiclient.herokuapp.com/)
