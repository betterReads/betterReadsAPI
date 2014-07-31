//server related dependencies
var express = require('express');
var app = express();
var port = process.env.PORT || 80045;
var goodreads = require('./goodreads');
var credentials = require('./credentials.js');


gr = new goodreads.client({
  'key': credentials.key,
  'secret': credentials.secret
});

// gr.requestToken(function() {
//   console.log(arguments);
// });

// var userShelves=[];
// //get all user's shelves
// gr.getShelves('4067289', function(json) {
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


// //get all books from certain shelf
// //max per_page of 200
// gr.getSingleShelf('4067289', {shelf: 'to-read', page: 1, per_page: 5}, function(json) {
//   if (json) {
//     console.log(json.GoodreadsResponse.books[0].book);
//   }
// });


//search by author or book

//search amazon for reviews by isbn

//see friend updates



app.get('/*', function(req, res){
  res.send('Hello world');
});

var server = app.listen(port, function(){
  console.log('Server is listening on port ' + port);
});
