'use strict';

describe('angular-hy-res: hrSirenExtension', function () {
  describe('the extension', function() {
    var hrSirenExtension;

    // load the controller's module
    beforeEach(angular.mock.module('angular-hy-res-siren'));

    beforeEach(angular.mock.inject(function(_hrSirenExtension_) {
      hrSirenExtension = _hrSirenExtension_;
    }));

    describe('extension applicability', function() {
      it('should apply to application/vnd.siren+json content type', function() {
        expect(hrSirenExtension.applies({}, function(header) {
          return header === 'Content-Type' ? 'application/vnd.siren+json' : null;
        }, 200)).toBe(true);
      });
    });
    describe('links parser', function() {
      it('should return the basic link', function() {
        var links = hrSirenExtension.linkParser({links: [ { rel: ['self'], href: '/orders/123' } ] }, {}, 200);
        expect(links.self.href).toEqual('/orders/123');
      });

      it('should return link for each relation in rel array', function() {
        var links = hrSirenExtension.linkParser({links: [ { rel: ['self', 'order'], href: '/orders/123' } ] }, {}, 200);
        expect(links.self.href).toEqual('/orders/123');
        expect(links.order.href).toEqual('/orders/123');
      });

      xit('should return a link array for duplicate link rels', function() {
        var links = hrSirenExtension.linkParser({
          links: [
            { rel: ['self'], href: '/orders/123' },
            { rel: ['section'], href: '/orders?page=2' },
            { rel: ['section'], href: '/orders?page=3' }
          ]
        },{}, 200);
        expect(links.section.length).toBe(2);
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

        expect(links.order.href).toBe('/orders/123');
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

        expect(embedded.order.title).toBe('My Order #123');
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

        expect(data).toEqual({ name: 'John Doe' });
      });

      it('should include the title, if present', function() {
        var data = hrSirenExtension.dataParser({
          links: [ { rel: ['self'], href: '/orders/123' } ],
          properties: {
            name: 'John Doe'
          },
          title: 'My Order #123'
        }, {});

        expect(data).toEqual({
          name: 'John Doe',
          title: 'My Order #123'
        });
      });
    });
  });

  describe('the provider', function() {
    it('handles additional media types', function() {
      angular.mock.module('angular-hy-res-siren', function(hrSirenExtensionProvider) {
        hrSirenExtensionProvider.mediaTypes.push('application/vnd.myco.blog');
      });

      inject(function(hrSirenExtension) {
        expect(hrSirenExtension.applies({}, function(header) {
          return header === 'Content-Type' ? 'application/vnd.myco.blog' : null;
        })).toBeTruthy();
      });
    });
  });
});
