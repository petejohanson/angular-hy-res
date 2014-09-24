/**
 * Created by peter on 9/18/14.
 */
'use strict';

module.exports.unresolvedResourceBehavior = function(context) {
  describe('(shared)', function() {
    beforeEach(function() {
      this.resource = context.resource;
    });

    it('should not be $resolved', function() {
      expect(this.resource.$resolved).toBe(false);
    });

    it('should have a $promise', function() {
      expect(this.resource.$promise).not.toBe(null);
    });

    it('should not have an $error', function() {
      expect(this.resource.$error).toBeNull();
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
      expect(this.resource.$resolved).toBe(true);
    });

    it('should not have an $error', function() {
      expect(this.resource.$error).toBe(null);
    });

    it('should have a completed promise', function(done) {
      var res = this.resource;
      this.resource.$promise.then(function(r) {
        expect(res).toBe(r);
        done();
      });

      this.rootScope.$digest();
    });
  });
};
