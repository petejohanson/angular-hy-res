'use strict';

/*jshint expr: true*/

var chai = require('chai');

var should = chai.should();

module.exports.unresolvedResourceBehavior = function(context) {
  describe('(shared)', function() {
    beforeEach(function() {
      this.resource = context.resource;
    });

    it('should not be $resolved', function() {
      this.resource.$resolved.should.be.false;
    });

    it('should have a $promise', function() {
      this.resource.$promise.should.not.be.null;
    });

    it('should not have an $error', function() {
      should.not.exist(this.resource.$error);
    });
  });
};

module.exports.resolvedResourceBehavior = function(context) {
  describe('(shared)', function() {
    beforeEach(function() {
      this.resource = context.resource;
      this.rootScope = context.rootScope;
    });

    it('should be $resolved', function() {
      this.resource.$promise.should.eventually.have.property('$resolved', true);
    });

    it('should not have an $error', function() {
      this.resource.$promise.should.eventually.have.property('$error', null);
    });

    it('should have a completed promise', function() {
      this.rootScope.$digest();
      this.resource.$promise.should.eventually.eql(this.resource);
    });
  });
};
