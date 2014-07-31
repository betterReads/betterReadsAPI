var app = angular.module('goodreads', []);

// app.config(function($httpProvider) {
//     //Enable cross domain calls
//     $httpProvider.defaults.useXDomain = true;

//     //Remove the header used to identify ajax call  that would prevent CORS from working
//     delete $httpProvider.defaults.headers.common['X-Requested-With'];
// });

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
]);

app.controller('queryAuthor', function($http, $scope) {
  $scope.queryGR = function() {
    $http.jsonp('https://www.goodreads.com/book/title.xml?author=Kurt+Vonnegut&key=1fX8DInyZoEz7YVkaQHypg')
      .success(function(data) {
        console.log(data);
      }
    );
  };


});

