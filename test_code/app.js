var app = angular.module('goodreads', []);

app.controller('queryAuthor', function($http, $scope) {
  var params={id: '4067289', shelf: 'to-read', page: 2, per_page: 30, sort: 'bossy'};

  $scope.queryGR = function() {
    $http({
      url: 'http://localhost:8045/booksOnShelf',
      method: 'GET',
      params: params
    }).success(function(data) {
      console.log('success');
      console.log(data);
      $scope.books=data;
    });
  };


});

