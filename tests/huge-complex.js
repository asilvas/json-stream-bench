module.exports = {
  name: 'Huge Complex',
  fn: test,
  readCycles: 2000,
  writeCycles: 2000
};

function test() {
  var obj = {};

  var lastNode = obj;
  for (var i = 0; i < 100; i++) {
    lastNode = lastNode.a = {};
    lastNode.b = Math.round(Math.random() * 0xffff);
    lastNode.c = lastNode.b < 0xaaaa;
    lastNode.d = new Array(100).join('::');
    lastNode.e = Date.now()
  }

  return obj;
}
