var parseString = require('xml2js').parseString;
var OperationHelper = require('apac').OperationHelper;

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
      'ResponseGroup': 'Images'
    }, callback);
  }
};

module.exports = Morereads;

