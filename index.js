'use strict';

var angular = require('angular');

angular.module('hrHyRes', [
  require('./core'),
  require('./hal'),
  require('./siren'),
  require('./link-header'),
  require('./json')
]);

module.exports='hrHyRes';
