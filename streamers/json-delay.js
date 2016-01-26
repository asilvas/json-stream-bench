module.exports = {
  name: 'JSON-delay',
  multiple: 0.25,
  writer: function(obj, cb) {
    setImmediate(function() {
      cb(null, JSON.stringify(obj));
    });
  },
  reader: function(json, cb) {
    setImmediate(function() {
      cb(null, JSON.parse(json));
    });
  }
};
