'use strict';

/*jshint expr: true*/

require('es6-promise').polyfill();

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

var should = chai.should();
chai.use(chaiAsPromised);

describe('angular-hy-res: hrSirenExtension', function () {
  describe('the extension', function() {
    var hrSirenExtension;

    // load the controller's module
    beforeEach(angular.mock.module('hrSiren'));

    beforeEach(angular.mock.inject(function(_hrSirenExtension_) {
      hrSirenExtension = _hrSirenExtension_;
    }));

    describe('extension applicability', function() {
      it('should apply to application/vnd.siren+json content type', function() {
        hrSirenExtension.applies({}, { 'content-type': 'application/vnd.siren+json' }).should.be.true;
      });
    });
    describe('links parser', function() {
      it('should return the basic link', function() {
        var links = hrSirenExtension.linkParser({links: [ { rel: ['self'], href: '/orders/123' } ] }, {}, 200);
        links.self[0].href.should.eql('/orders/123');
      });

      it('should return link for each relation in rel array', function() {
        var links = hrSirenExtension.linkParser({links: [ { rel: ['self', 'order'], href: '/orders/123' } ] }, {}, 200);
        links.self[0].href.should.eql('/orders/123');
        links.order[0].href.should.eql('/orders/123');
      });

      it('should return a link array for duplicate link rels', function() {
        var links = hrSirenExtension.linkParser({
          links: [
            { rel: ['self'], href: '/orders/123' },
            { rel: ['section'], href: '/orders?page=2' },
            { rel: ['section'], href: '/orders?page=3' }
          ]
        },{}, 200);
        links.section.length.should.eql(2);
        links.section[0].href.should.eql('/orders?page=2');
      });

      it('should include sub-entity links', function() {
        var links = hrSirenExtension.linkParser({
          links: [
            { rel: ['self'], href: '/orders/123' }
          ],
          entities: [
            {
              rel: ['order'],
              href: '/orders/123'
            }
          ]
        }, {}, 200);

        links.order[0].href.should.eql('/orders/123');
      });
    });

    describe('the embedded parser', function() {
      it('should return the fully embedded entities', function() {
        var embedded = hrSirenExtension.embeddedParser({
          entities: [
            {
              rel: ['order'],
              links: [
                { rel: ['self'], href: '/orders/123' }
              ],
              title: 'My Order #123'
            }
          ]
        }, {});

        embedded.order[0].title.should.eql('My Order #123');
      });
    });

    describe('data parser', function() {
      it('should return the properties field values', function() {
        var data = hrSirenExtension.dataParser({
          links: [ { rel: ['self'], href: '/orders/123' } ],
          properties: {
            name: 'John Doe'
          }
        }, {});

        data.should.eql({ name: 'John Doe' });
      });

      it('should include the title, if present', function() {
        var data = hrSirenExtension.dataParser({
          links: [ { rel: ['self'], href: '/orders/123' } ],
          properties: {
            name: 'John Doe'
          },
          title: 'My Order #123'
        }, {});

        data.should.eql({
          name: 'John Doe',
          title: 'My Order #123'
        });
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module('hrSiren', function(hrSirenExtensionProvider) {
        hrSirenExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrSirenExtension) {
        hrSirenExtension.applies({}, { 'content-type': 'application/vnd.myco.blog' }).should.be.true;
      });
    });
  });
});
