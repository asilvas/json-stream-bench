module.exports = {
  name: 'JSON-delay',
  multiple: 0.25,
  writer: function(obj, cb) {
    setTimeout(function() {
      cb(null, JSON.stringify(obj));
    }, 10);
  },
  reader: function(json, cb) {
    setTimeout(function() {
      cb(null, JSON.parse(json));
    }, 10);
  }
};
