module.exports = {
  name: 'Huge (1MB) Buffer',
  fn: hugeBufferTest,
  readCycles: 5,
  writeCycles: 5
};

function hugeBufferTest() {
  var buf = new Buffer(1024000);
  var rnd = Math.floor(Math.random() * 10).toString();
  buf.fill(rnd);
  return {
    buf: buf
  };
}
