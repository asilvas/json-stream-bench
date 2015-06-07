module.exports = {
  name: 'Heavy Nesting',
  fn: test,
  readCycles: 1000,
  writeCycles: 1000
};

function test() {
  var obj = {};

  var lastNode = obj;
  for (var i = 0; i < 30; i++) {
    lastNode = lastNode.a = {};
    lastNode.b = Math.round(Math.random() * 0xffff);
  }

  return obj;
}
