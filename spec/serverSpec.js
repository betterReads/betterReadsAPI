var request = require('request');

describe('should test better reads API', function() {
  it("should respond with 'better reads API'", function(done) {
    request("http://localhost:8045/", function(error, response, body){
      console.log(arguments);
      expect(body).toEqual("better reads API");
      done();
    });
  });
});