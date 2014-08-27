# angular-hyper-resource [![Build Status](https://travis-ci.org/petejohanson/angular-hyper-resource.svg?branch=master)](https://travis-ci.org/petejohanson/angular-hyper-resource)

A hypermedia client/library for [AngularJS](http://angularjs.org/). A [HAL](http://tools.ietf.org/html/draft-kelly-json-hal-06) media type extension is included by default, but support for other media types can be added.

## Installation

### Bower

angular-hyper-resource is available via Bower. To install:

    $ bower install --save angular-hyper-resource

### Manual

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/petejohanson/angular-hyper-resource/master/dist/angular-hyper-resource-full.min.js
[max]: https://raw.github.com/petejohanson/angular-hyper-resource/master/dist/angular-hyper-resource-full.js

In your web page:

```html
<script src="angular.js"></script>
<script src="dist/angular-hyper-resource-full.min.js"></script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## To Do

* Handling of arrays of links for a given rel.
* HTTP Link header extension
* Extensions for other media types (e.g. Siren, Uber)
* Hypermedia Actions? (Not present in HAL)
* Allow configuration of custom media types to be processed by HAL extension
* Differentiate between embedded link vs embedded representation (See Siren spec)
* Correct relative URI resolution for following links.
* Sane error handling