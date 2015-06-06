module.exports = {
  name: 'Numerics',
  fn: numericsTest,
  readCycles: 5000,
  writeCycles: 5000
};

function numericsTest() {
  var val = Math.round(Math.random() * 0xffff);
  return {
    a: val * 1.0,
    b: val * 2.0,
    c: val * 0.5,
    d: val * 100.0
  };
}
