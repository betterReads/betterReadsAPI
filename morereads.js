var parseString = require('xml2js').parseString;
var OperationHelper = require('apac').OperationHelper;
var request = require('request');

var USATodayCache = {};

Morereads = {
  getBookImages: function(params, callback) {
    var opHelper = new OperationHelper({
      awsId: params.awsId,
      awsSecret: params.awsSecret,
      assocId: params.assocId
    });

    return opHelper.execute('ItemLookup', {
      'IdType': 'ISBN',
      'ItemId': params.isbn,
      'SearchIndex': 'Books',
      'ResponseGroup': 'Images,ItemAttributes'
    }, callback);
  },
  getUSATodayBestSellers: function(params, callback) {
    request('http://api.usatoday.com/open/bestsellers/books/ThisWeek?api_key=' + params.USATodayKey, callback);
  },
  getUTBSImages: function(params, callback) {
    Morereads.getUSATodayBestSellers({USATodayKey: params.USATodayKey}, function(err, response, body) {
      var bookImages = {};
      var list = JSON.parse(body).BookLists[0];
      var date = list.BookListDate.BookListAPIUrl;
      console.log(date);
      //return data if already saved
      if (date in USATodayCache) {
        console.log('date in cache');
        callback(USATodayCache[date]);
        return;
      } else {
        console.log('date not in cache');
      }
      var books = list.BookListEntries;
      // console.log(books);
      var isbns=[];
      var calls=0;
      var checks = ['ISBN', 'EISBN', 'EAN', 'ASIN'];
      for (var b = 0; b<50; b++) {
        var book=books[b];
        var isbn=book.ISBN.replace(/\s+/g, '');
        books[b].ISBN=isbn;
        isbns.push(isbn);
        if (isbns.length===10) {
          (function(isbns, b) {
            // console.log(isbns);
            Morereads.getBookImages({awsId: params.awsId, awsSecret: params.awsSecret, assocId: params.assocId, isbn: isbns.join(',')}, function(results) {
              //increment call counter
              calls++;
              if (results.ItemLookupErrorResponse) {
                // console.log(JSON.stringify(results.ItemLookupErrorResponse));
              } else {
                var images = results.ItemLookupResponse.Items[0].Item;
                for (var i=0; i<images.length; i++) {
                  var image = images[i];
                  // console.log(image);
                  for (var c=0; c<checks.length; c++) {
                    var check=checks[c];
                    var thisIsbn;
                    if (image.ItemAttributes[0][check]) {
                      thisIsbn = image.ItemAttributes[0][check][0]
                    } else if (image[check]) {
                      thisIsbn = image[check][0];
                    }
                      
                    if (thisIsbn && !(thisIsbn in bookImages)) {
                      bookImages[thisIsbn] = image.LargeImage[0].URL[0];
                    }
                  }
                }
              }
              //once all calls returned, zip up data
              if (calls===5) {
                // console.log('DONE!');
                // console.log(bookImages);
                for (var B = 0; B<50; B++) {
                  var BOOK = books[B];
                  if (BOOK.ISBN in bookImages) {
                    BOOK.URL = bookImages[BOOK.ISBN];
                  }
                }
                var topFifty = books.slice(0, 50);
                USATodayCache[date] = topFifty;
                callback(topFifty);

                return;
              }
            });
          })(isbns, b);

          isbns=[];
        }
      }
    });
  }
};

module.exports = Morereads;

