module.exports = {
  name: 'JSON',
  multiple: 1.0,
  writer: function(obj, cb) {
    cb(null, JSON.stringify(obj));
  },
  reader: function(json, cb) {
    cb(null, JSON.parse(json));
  }
};
