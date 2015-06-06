var JSONStream = require('JSONStream');

module.exports = {
  name: 'JSONStream-delay',
  multiple: 0.1,
  writer: function(obj, cb) {
    var stream = JSONStream.stringify(false);
    stream.on('end', function() {
      cb && cb(null, '');
      cb = null;
    }).on('error', function(err) {
      cb && cb(err);
      cb = null;
    }).on('data', function(json) {
      cb && cb(null, json);
      cb = null;
    })
    ;

    setTimeout(function() {
      stream.write(obj);
      stream.end();
    }, 10);
  },
  reader: function(json, cb) {
    var parser = JSONStream.parse();
    parser.on('root', function(root) {
      cb && cb(null, root);
      cb = null;
    }).on('error', function(err) {
      cb && cb(err);
      cb = null;
    }).on('end', function() {
      cb && cb(null, {});
      cb = null;
    })
    ;

    setTimeout(function() {
      parser.write(json);
      parser.end();
    }, 10);

  }
};
