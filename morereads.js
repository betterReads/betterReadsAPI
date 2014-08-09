var parseString = require('xml2js').parseString;
var OperationHelper = require('apac').OperationHelper;

Morereads = {
  getBookImages: function(credentials, isbns, callback) {
    var opHelper = new OperationHelper({
      awsId: credentials.awsId,
      awsSecret: credentials.awsSecret,
      assocId: credentials.assocId
    });

    return opHelper.execute('ItemLookup', {
      'IdType': 'ISBN',
      'ItemId': isbns,
      'SearchIndex': 'Books',
      'ResponseGroup': 'Images'
    }, callback);
  }
};

module.exports = Morereads;

