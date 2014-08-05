'use strict';

describe('Module: angular-halogen', function () {
  var ahParser, httpBackend;

  // load the controller's module
  beforeEach(module('angular-halogen'));

  beforeEach(inject(function(_ahParser_, $httpBackend) {
    ahParser = _ahParser_;
    httpBackend = $httpBackend;
  }));

  it('should parse a JSON string', function () {
    var json = '{"name":"John Wayne","array":["a","b"]}';
    var res = ahParser.parse(json);
    expect(res.name).toBe('John Wayne');
    expect(res.array).toEqual(['a','b']);
  });


  it('should make _links accessable via $link', function() {
    var json = '{"_links":{"self":{"href":"/blah","templated":false,"title":"Blah Blah"}}}';

    var res = ahParser.parse(json);
    expect(res._links).toBe(undefined);
    var link = res.$link('self');
    expect(link).not.toBe(null);
    expect(link.href).toBe('/blah');
    expect(link.templated).toBe(false);
    expect(link.title).toBe('Blah Blah');
  });

  it('should make _embedded available via $embedded', function() {
    var json = '{"_embedded":{"order":{"_links":{"self":{"href":"/order/123"}},"title":"Soylent Green"}}}';

    var res = ahParser.parse(json);
    var e = res.$embedded('order');
    expect(e.title).toBe('Soylent Green');
    expect(e.$link('self').href).toBe('/order/123');
  });

  it('should follow links and make http requests', function() {
    httpBackend
      .expectGET('/orders/123')
      .respond({_links:{self:{href:'/orders/123'}},type:'promo'},{'Content-Type': 'application/hal+json'});
    var json = '{"_links":{"order":{"href":"/orders/123"}}}';
    var res = ahParser.parse(json);

    res
      .$follow('order')
      .then(function(resp) {
        expect(resp.data.type).toBe('promo');
        expect(resp.data.$link('self').href).toBe('/orders/123');
      });

    httpBackend.flush();
  });

  it('should follow URI template links and make http requests', function() {
    httpBackend.expectGET('/orders/123').respond('{"type":"promo"}');
    var json = '{"_links":{"order":{"href":"/orders/{id}","templated":true}}}';
    var res = ahParser.parse(json);

    res
      .$follow('order', {data: {id: 123}})
      .then(function(resp) {
        expect(resp.data.type).toBe('promo');
      });

    httpBackend.flush();
  });

/*
  it('can $follow a link relation and issue an HTTP request', function() {
  });
*/

});
