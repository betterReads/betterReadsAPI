var parseString = require('xml2js').parseString;
var OperationHelper = require('apac').OperationHelper;
var request = require('request');

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
  }
};

module.exports = Morereads;

