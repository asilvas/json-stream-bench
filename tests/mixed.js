module.exports = {
  name: 'Mixed Types',
  fn: test,
  readCycles: 2000,
  writeCycles: 2000
};

function test() {
  var val = Math.round(Math.random() * 0xffff);
  return {
    a: val,
    b: val < 0xaaaa,
    c: new Date(),
    d: 'abc'
  };
}
