var request = require('request');

describe('should test better reads API', function() {
  //test base URL
  it("should respond with 'better reads API'", function(done) {
    request("http://localhost:8045/", function(error, response, body){
      expect(body).toEqual("better reads API");
      done();
    });
  });

  // test booksOnShelf endpoint
  it("should query bookshelf", function(done) {
    var params={id: '4067289', shelf: 'to-read', page: 2, per_page: 30, sort: 'bossy'};
    request.get({url: "http://localhost:8045/booksOnShelf", qs: params}, function(error, response, body){
      console.log(body);
      expect(!!JSON.parse(body).length).toEqual(true);
      done();
    });
  });

  // test userShelves endpoint
  it("should query user shelves", function(done) {
    var params={id: '4067289', page: 1};
    request.get({url: "http://localhost:8045/userShelves", qs: params}, function(error, response, body){
      console.log(body);
      expect(!!JSON.parse(body).length).toEqual(true);
      done();
    });
  });

  // test searchBooks endpoint
  it("should query search books method", function(done) {
    var params={query: 'vonnegut', page: 2, search: 'author'};
    request.get({url: "http://localhost:8045/searchBooks", qs: params}, function(error, response, body){
      console.log(body);
      expect(!!JSON.parse(body).length).toEqual(true);
      done();
    });
  });

  // test bookReviews endpoint
  it("should query book reviews", function(done) {
    var params={isbn: '1400067820', rating: 4, iframe: true};
    request.get({url: "http://localhost:8045/bookReviews", qs: params}, function(error, response, body){
      console.log(JSON.parse(body).reviews_widget);
      expect(!!JSON.parse(body).reviews_widget).toEqual(true);
      done();
    });
  });


});