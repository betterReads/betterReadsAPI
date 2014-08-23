//server related dependencies
var express = require('express');
var port = process.env.PORT || 8045;
var goodreads = require('./goodreads');
var request = require('request');
var cors=require('cors');
var bodyParser = require('body-parser');
var open = require('open');
var parseString = require('xml2js').parseString;
var morereads = require('./morereads');
var mysql = require('mysql');

var OperationHelper = require('apac').OperationHelper;

//load credentials locally or from azure
if (process.env.PORT===undefined) {
  var credentials = require('./credentials.js');
} else {
  var credentials = {
    key: process.env['key'],
    secret: process.env['secret'],
    awsId: process.env['awsId'],
    awsSecret: process.env['awsSecret'],
    assocId: process.env['assocId'],
    USATodayKey: process.env['USATodayKey'],
    dbHost: process.env['dbHost'],
    dbUser: process.env['dbUser'],
    dbPassword: process.env['dbPassword'],
    database: process.env['database']
  };
}

// morereads.getBookImages({awsId: credentials.awsId, awsSecret: credentials.awsSecret, assocId: credentials.assocId, isbn: '075640407X,0553381695,0802130305,0763662585'}, function(err, results) {
//   parseString(results, function(err, data) {
//     var products = data.ItemLookupResponse.Items[0].Item;
//     console.log(products[0].DetailPageURL[0])
//     // console.log(products);
//     // for (var product = 0; product < products.length; product++) {
//     //   console.log(JSON.stringify(products[product]));
//     // }
//   });
// });

//initialize app and use cors & body parser
var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//set up database connection
var connection = mysql.createPool({
  connectionLimit: 10,
  host: credentials.dbHost,
  user: credentials.dbUser,
  password: credentials.dbPassword,
  database: credentials.database
});

// SERVER FUNCTIONS
//download html from iframe
var getIframeHtml = function(url, callback) {
  request(url, function (error, response, body) {
    if (error) {
      throw error;
    }
    if (!error && response.statusCode == 200) {
      callback(body);
    }
  });
};
// END OF SERVER FUNCTIONS

//set up goodreads object with key and secret
var initGR = function(req) {
  if (req.method==='GET') {
    var params=req.query;
  } else if (req.method==='POST') {
    var params=req.body;
  }
  // var gr = new goodreads.client({
  //   'key': params.key,
  //   'secret': params.secret
  // });
  var gr = new goodreads.client({
    'key': credentials.key,
    'secret': credentials.secret
  });
  return gr;
};

app.get('/bookImages', function(req, res) {
  morereads.getBookImages(req.query, function(err, results) {
      if (err) {
        res.status(400).send(err);
      } else {
        parseString(results, function(err, data) {
          if (err) {
            res.status(400).send(err);
          } else {
            var products = data.ItemLookupResponse.Items[0].Item;
            res.status(200).send(products);
          }
        });
      }
  });
});

app.get('/weeklyBestSellers', function(req, res) {
  if (req.query.source===undefined || req.query.source==='USAToday') {  
    //only query images if explicitly requested
    if (req.query.images==='true') {
      morereads.getUTBSImages(req.query, function(response) {
        res.status(200).send(response);
      });    
    } else {
      morereads.getUSATodayBestSellers(req.query, function(err, response, body) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send(JSON.parse(body).BookLists[0]);
        }
      });
    }
  }
});

app.get('/preAuthenticate', function(req, res) {
  var gr = initGR(req);
  gr.requestToken(function(data) {
    res.status(200).send(data);
  });
});


app.get('/authenticate', function(req, res) {
  console.log('authenticating');
  console.log(req.query);
  var gr = initGR(req);

  gr.processCallback(req.query.requestToken, req.query.requestSecret, 1, function(err, accessToken, accessSecret, results) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send({accessToken: accessToken, accessSecret: accessSecret});
    }
    
  });
});

app.get('/friendUpdates', function(req, res) {
  console.log(req.query);
  var gr = new goodreads.client({
    key: credentials.key,
    secret: credentials.secret,
    accessToken: req.query.accessToken,
    accessSecret: req.query.accessSecret
  });

  gr.getUpdates(function(err, data, results) {
    parseString(data, function(err, result) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(result.GoodreadsResponse.updates[0].update);
      }
    });
  });

});

app.get('/userId', function(req, res) {
  console.log(req.query);
  var gr = new goodreads.client({
    key: credentials.key,
    secret: credentials.secret,
    accessToken: req.query.accessToken,
    accessSecret: req.query.accessSecret
  });

  gr.getUserId(function(err, data, results) {
    parseString(data, function(err, result) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send(result.GoodreadsResponse.user[0].$.id);
      }
    });
  });

});

app.get('/verifyAuthentication', function(req, res) {
  //verify authentication
  console.log(req.query);
  res.status(200).send('Verified!');
});

app.get('/booksOnShelf', function(req, res) {
  //get all books from certain shelf
  //max per_page of 200
  console.log(req.query);
  var gr = initGR(req);
  gr.getBooksOnShelf(req.query, function(data) {
    res.status(200).send(JSON.stringify(data.GoodreadsResponse.books[0].book));
  });
});

app.post('/booksOnShelf', function(req, res) {
  //add book to shelf
  console.log(req.body);
  var gr = new goodreads.client({
    key: credentials.key,
    secret: credentials.secret,
    accessToken: req.body.accessToken,
    accessSecret: req.body.accessSecret
  });

  gr.addBooksToShelf(req.body, function(err, data, results) {
    if (err) {
      res.status(err.statusCode).send(err.data);
    } else {
      res.status(202).send(data);
    }
  });
});


app.get('/userShelves', function(req, res) {
  //list all of a user's shelves
  console.log(req.query);
  var gr = initGR(req);
  // APPEARS THAT THE PAGE PARAMETER IS IRRELEVANT
  gr.getUserShelves(req.query, function(data) {
    // res.status(200).send(JSON.stringify(data.GoodreadsResponse));
    res.status(200).send(JSON.stringify(data.GoodreadsResponse.shelves[0].user_shelf));
  });
});


app.get('/searchBooks', function(req, res) {
  //search for books
  console.log(req.query);
  var gr = initGR(req);
  gr.searchBooks(req.query, function(data) {
    res.status(200).send(JSON.stringify(data.GoodreadsResponse.search[0].results[0].work));
  });
});

app.get('/bookDetail', function(req, res) {
  //search for books
  console.log(req.query);
  var gr = initGR(req);
  gr.getBookDetail(req.query, function(data) {
    if (data.error) {
      res.status(400).send(data.error);
    }
    //save query to sql if id provided
    if (req.query.id) {
      connection.query('INSERT INTO searches (userId, isbn) values (?, ?);', [parseInt(req.query.id), parseInt(data.GoodreadsResponse.book[0].isbn[0])], function(err, rows, fields) {
        if (err) {
          throw err;
        }
      });
    }
    res.status(200).send(JSON.stringify(data.GoodreadsResponse.book[0]));
  });
});

app.get('/bookReviews', function(req, res) {
  //get reviews based on book isbn
  console.log(req.query);
  var gr = initGR(req);
  gr.getReviewsByIsbn(req.query, function(data) {
    console.log('review search');
    if (req.query.iframe===undefined || req.query.iframe==='true') {
      res.status(200).send(JSON.stringify(data.GoodreadsResponse.book[0]));
    } else {
      var xml=data.GoodreadsResponse.book[0].reviews_widget[0];
      //parse iframe url
      var iframeInd = xml.indexOf('<iframe');
      var iframeEnd = xml.indexOf('width', iframeInd);
      var iframeUrl = xml.slice(iframeInd+29, iframeEnd-2);
      //load html from iframe link
      getIframeHtml(iframeUrl, function(iframeHtml) {
        var reviewStart = iframeHtml.indexOf('<div class="gr_reviews_container" id="gr_reviews_');
        var reviewEnd = iframeHtml.indexOf('</html>', reviewStart);
        var reviewHtml = iframeHtml.slice(reviewStart, reviewEnd - 8);
        console.log(reviewHtml);
        res.status(200).send(reviewHtml);
      });
    }
  });
});

app.get('/', function(req, res){
  res.status(200).send('better reads API');
});

var server = app.listen(port, function(){
  console.log('Server is listening on port ' + port);
});

