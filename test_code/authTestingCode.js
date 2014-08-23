//initialize and get tokens
var auth = {};
var gr = initGR({method: undefined});
gr.requestToken(function(data) {
  console.log(data);
  auth.token =  data.requestToken;
  auth.secret = data.requestSecret;
  auth.url = data.url;

  // MUST UNCOMMENT THIS TO TEST OAUTH
  // open(data.url);
});


// setTimeout(function() {
//   var gr = new goodreads.client({
//     key: credentials.key,
//     secret: credentials.secret,
//     accessToken: auth.token,
//     accessSecret: auth.secret
//   });
//   // gr.getUpdates(function(err, data, results) {
//   //   console.log(err, data);
//   // });
//   gr.processCallback(auth.token, auth.secret, 1, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
//     console.log(error, oauthAccessToken, oauthAccessTokenSecret, results);
//     var gr2 = new goodreads.client({
//       key: credentials.key,
//       secret: credentials.secret,
//       accessToken: oauthAccessToken,
//       accessSecret: oauthAccessTokenSecret
//     });
//     // gr2.getUpdates(function(err, data, results) {
//     gr2.getUserId(function(err, data, results) {
//       parseString(data, function(err, result) {
//         console.log(result.GoodreadsResponse.user[0].$.id);
//       });
//     });

//   });
// }, 5000);