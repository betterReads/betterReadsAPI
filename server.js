//server related dependencies
var express = require('express');
var port = process.env.PORT || 8045;
var goodreads = require('./goodreads');
var request = require('request');
var cors=require('cors');
var bodyParser = require('body-parser');
var open = require('open');
var parseString = require('xml2js').parseString;

//load credentialls locally or from azure
if (process.env.PORT===undefined) {
  var credentials = require('./credentials.js');
} else {
  var credentials = {
    key: process.env['key'],
    secret: process.env['secret']
  };
}

//initialize app and use cors & body parser
var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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

//initialize and get tokens
var auth = {};
var gr = initGR({method: undefined});
gr.requestToken(function(data) {
  console.log(data);
  auth.token =  data.requestToken;
  auth.secret = data.requestSecret;
  auth.url = data.url;

  // MUST UNCOMMENT THIS TO TEST OAUTH
  open(data.url);
});

setTimeout(function() {
  var gr = new goodreads.client({
    key: credentials.key,
    secret: credentials.secret,
    accessToken: auth.token,
    accessSecret: auth.secret
  });
  // gr.getUpdates(function(err, data, results) {
  //   console.log(err, data);
  // });
  gr.processCallback(auth.token, auth.secret, 1, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
    console.log(error, oauthAccessToken, oauthAccessTokenSecret, results);
    var gr2 = new goodreads.client({
      key: credentials.key,
      secret: credentials.secret,
      accessToken: oauthAccessToken,
      accessSecret: oauthAccessTokenSecret
    });
    gr2.getUpdates(function(err, data, results) {
      parseString(data, function(err, result) {
        console.log(result);
      });
    });

  });
}, 5000);

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

//TO DO:
//integrate NYT best seller API
//see friend updates
//rate book
//find goodreads id from isbn

app.get('/preAuthenticate', function(req, res) {
  var gr = initGR(req);
  gr.requestToken(function(data) {
    res.status(200).send(data);
  });
});


app.get('/authenticate', function(req, res) {
  var gr = initGR(req);
  gr.processCallback(req.query.requestToken, req.query.reqSecret, 1, function(err, accessToken, accessSecret, results) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send({accessToken: accessToken, accessSecret: accessSecret});
    }
    
  });
});

app.get('/friendUpdates', function(req, res) {
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
        res.status(200).send(result);
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
  var gr = initGR(req);
  gr.addBooksToShelf(req.data, function(err, data, results) {
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


