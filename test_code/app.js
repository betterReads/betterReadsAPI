var app = angular.module('goodreads', []);

app.controller('queryAuthor', function($http, $scope) {
  var params={id: '4067289', shelf: 'to-read', page: 2, per_page: 30, sort: 'bossy'};

  $scope.queryGR = function() {
    $http({
      url: 'http://localhost:8045/booksOnShelf',
      method: 'GET',
      params: params
    }).success(function(data) {
      console.log('book on shelf search');
      console.log(data);
      $scope.books=data;
    });

    $http({
      url: 'http://localhost:8045/userShelves',
      method: 'GET',
      params: {id: '4067289', page: 1}
    }).success(function(data) {
      console.log('shelf search');
      console.log(data);
    });

    $http({
      url: 'http://localhost:8045/searchBooks',
      method: 'GET',
      params: {query: 'vonnegut', page: 2, search: 'author'}
    }).success(function(data) {
      console.log('book search');
      console.log(data);
    });

  };




});

