//server related dependencies
var express = require('express');
var app = express();
var port = process.env.PORT || 80045;
var goodreads = require('./goodreads');
var credentials = require('./credentials.js');
var request = require('request');

//download html from iframe
var getIframeHtml = function(url) {
  request(url, function (error, response, body) {
    if (error) {
      throw error;
    }
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
};

//set up goodreads object with key and secret
var gr = new goodreads.client({
  'key': credentials.key,
  'secret': credentials.secret
});

// gr.requestToken(function() {
//   console.log(arguments);
// });

//get all user's shelves
// gr.getShelves('4067289', function(json) {
//   var userShelves=[];
//   if (json) {
//     var shelves=json.GoodreadsResponse.shelves[0].user_shelf;
//     // console.log(shelves);
//     for (var i=0; i<shelves.length; i++) {
//       var shelf = shelves[i];
//       console.log(shelf.name, shelf.id);
//       userShelves.push(shelf.name);
//     }
//     console.log(userShelves);
//   }
// });


//search for author
//only returns one result
// gr.searchAuthor('Vonnegut', function(json) {
//   if (json) {
//     console.log(json.GoodreadsResponse.author);
//   }
// });

//search for book
// gr.searchBook({query: 'vonnegut', page: 2, search: 'all'}, function(json) {
//   if (json) {
//     //list of books
//     console.log(json.GoodreadsResponse.search[0].results[0].work);
//     //book image details
//     console.log(json.GoodreadsResponse.search[0].results[0].work[0].best_book[0]);
//   }
// });

//good reads review
// returns an iframe; need to adjust CSS to as to make it look nicer
gr.getReviewsByIsbn('1400067820', function(json) {
  //pull out iframe data
  var xml=json.GoodreadsResponse.book[0].reviews_widget[0];

  //search for iframe url
  var iframeInd = xml.indexOf('<iframe');
  var iframeEnd = xml.indexOf('width', iframeInd);

  var iframeUrl = xml.slice(iframeInd+29, iframeEnd-2);
  console.log(iframeUrl);

  //load html from iframe link
  getIframeHtml(iframeUrl);

});

//integrate NYT best seller API

//see friend updates

//add book to shelf (to-read, read, etc)

//rate book


app.get('/*', function(req, res){
  res.send('better reads API');
});

app.get('/booksOnShelf', function(req, res) {
  //get all books from certain shelf
  //max per_page of 200

  //example:
  // gr.getSingleShelf({id: '4067289', shelf: 'to-read', page: 1, per_page: 5}, function(json) {
  //   if (json) {
  //     console.log(json.GoodreadsResponse.books[0].book);
  //   }
  // });
  var gr = new goodreads.client({
    'key': req.body.key,
    'secret': req.body.secret
  });

  gr.getSingleShelf(req.body.params, function(data) {
    res.send(200, JSON.stringify(data));
  });

});

var server = app.listen(port, function(){
  console.log('Server is listening on port ' + port);
});
