var async = require('async');
var cpu = require('./cpu');

var MS_PER_TEST = 3000;
var MS_SLEEP_BETWEEN_TESTS = 1500;

var benchmarks = [
  require('./streamers/json'),
  require('./streamers/json-delay'),
  require('./streamers/JSONStream'),
  require('./streamers/JSONStream-delay')
];

var tests = [
  require('./tests/numerics'),
  require('./tests/mixed'),
  require('./tests/heavy-nested'),
  require('./tests/huge-buffer')
];

var eventLoop = {
  count: 0,
  totalLag: 0,
  lastCheck: Date.now()
};

var isRunning = true;
function updateEventLoopLag() {
  var now = Date.now();
  var elapsed = (now - eventLoop.lastCheck);
  if (elapsed === 0) return isRunning && setImmediate(updateEventLoopLag); // ignore zero deltas to avoid polluting the data
  eventLoop.count++;
  eventLoop.totalLag += elapsed;
  eventLoop.lastCheck = now;

  if (isRunning) {
    setImmediate(updateEventLoopLag);
  }
}

function resetEventLoop() {
  eventLoop = {
    count: 0,
    totalLag: 0,
    lastCheck: Date.now()
  };
}

function getEventLoopLag() {
  return Math.round(eventLoop.totalLag / eventLoop.count);
}

setImmediate(updateEventLoopLag);

function runBenchmark(benchmark, cb) {
  benchmark.timeElapsed = 0;
  benchmark.cpuTimeElapsed = 0;
  benchmark.throughputKBsec = 0;
  benchmark.results = {};

  var testTasks = [];

  tests.forEach(function(test) {
    testTasks.push(createTestTask(benchmark, test));
  });

  console.log('* Benching ' + benchmark.name + '...');
  async.series(testTasks, function(err) {
    if (err) {
      return cb(err);
    }

    cb();
  });
}

function createTestTask(benchmark, test) {
  var objs = [];
  for (var i = 0; i < 10; i++) {
    objs.push(test.fn());
  }
  var objJsons = objs.map(function(obj) {
    return JSON.stringify(obj);
  });

  benchmark.factor = 1.0 / benchmark.multiple;

  var getObjectToTest = function() {
    var rnd = Math.floor(Math.random() * objs.length);
    return {
      obj: objs[rnd],
      json: objJsons[rnd]
    }
  };

  return function(cb) {
    async.series([
      function(cb) {
        if (!benchmark.writer) {
          return setImmediate(cb);
        }

        var objToTest = getObjectToTest();

        // verify writer working
        benchmark.writer(objToTest.obj, function(err, json) {
          if (err) {
            return cb(err);
          }

          if (json != objToTest.json) {
            return cb(new Error('Writer result was NOT VALID! ' + json + ' != ' + objToTest.json));
          }

          cb();
        });
      },
      function(cb) {
        if (!benchmark.reader) {
          return setImmediate(cb);
        }

        var objToTest = getObjectToTest();

        // verify writer working
        benchmark.reader(objToTest.json, function (err, o) {
          if (err) {
            return cb(err);
          }

          var json = JSON.stringify(o);
          if (json != objToTest.json) {
            return cb(new Error('Reader result was NOT VALID! ' + json + ' != ' + objToTest.json));
          }

          cb();
        });
      },
      function(cb) {
        if (!benchmark.writer) {
          console.log('* No write test for ', benchmark.name, ' - skipping...');
          return setImmediate(cb);
        }

        var results = benchmark.results[test.name] = benchmark.results[test.name] || {};
        var name = '  ' + test.name + '.write';
        results.write = {
          paddedName: name + Array(30 - name.length).join(' '),
          start: Date.now(),
          cpuTime: cpu.getTotalCpuTimeInMs()
        };

        resetEventLoop();

        var cycles = 0;
        console.log('* Testing... ' + name);
        var performNextIteration = function() {
          var objToTest = getObjectToTest();

          benchmark.writer(objToTest.obj, function(err) {
            if (err) {
              return cb(err);
            }
            cycles++;
            var now = Date.now();
            if ((now - results.write.start) > MS_PER_TEST) {
              results.write.timeElapsed = now - results.write.start;
              results.write.cpuTimeElapsed = Math.round(cpu.getTotalCpuTimeInMs() - results.write.cpuTime);
              results.write.throughputKBsec = Math.round(cycles * objToTest.json.length * (MS_PER_TEST / results.write.timeElapsed) / 1024);
              return void setTimeout(function() {
                results.write.eventLoopLag = getEventLoopLag();

                benchmark.timeElapsed += results.write.timeElapsed;
                benchmark.cpuTimeElapsed += results.write.cpuTimeElapsed;
                benchmark.throughputKBsec += results.write.throughputKBsec;

                setTimeout(cb, MS_SLEEP_BETWEEN_TESTS);
              }, 100);
            }

            process.nextTick(performNextIteration);
          });
        };

        process.nextTick(performNextIteration);
      },
      function(cb) {
        if (!benchmark.reader) {
          console.log('* No read test for ', benchmark.name, ' - skipping...');
          return setImmediate(cb);
        }

        var results = benchmark.results[test.name] = benchmark.results[test.name] || {};
        var name = '  ' + test.name + '.read';
        results.read = {
          paddedName: name + Array(30 - name.length).join(' '),
          start: Date.now(),
          cpuTime: cpu.getTotalCpuTimeInMs()
        };

        resetEventLoop();

        var cycles = 0;
        console.log('* Testing... ' + name);
        var performNextIteration = function() {
          var objToTest = getObjectToTest();

          benchmark.reader(objToTest.json, function(err) {
            if (err) {
              return cb(err);
            }
            cycles++;
            var now = Date.now();
            if ((now - results.read.start) > MS_PER_TEST) {
              results.read.timeElapsed = now - results.read.start;
              results.read.cpuTimeElapsed = Math.round(cpu.getTotalCpuTimeInMs() - results.read.cpuTime);
              results.read.throughputKBsec = Math.round(cycles * objToTest.json.length * (MS_PER_TEST / results.read.timeElapsed) / 1024);
              return void setTimeout(function() {
                results.read.eventLoopLag = getEventLoopLag();

                benchmark.timeElapsed += results.read.timeElapsed;
                benchmark.cpuTimeElapsed += results.read.cpuTimeElapsed;
                benchmark.throughputKBsec += results.read.throughputKBsec;

                setTimeout(cb, MS_SLEEP_BETWEEN_TESTS);
              }, 100);
            }

            process.nextTick(performNextIteration);
          });
        };

        process.nextTick(performNextIteration);
      }
    ], function(err) {
      if (err) {
        return cb(err);
      }

      cb();
    });
  }
}

var benchmarkTasks = [];

benchmarks.forEach(function(benchmark) {
  benchmark.paddedName = benchmark.name + Array(30 - benchmark.name.length).join(' ');
  benchmarkTasks.push(createBenchmarkTask(benchmark));
});

function createBenchmarkTask(benchmark) {
  return function(cb) {
    runBenchmark(benchmark, function() {
      var lag = 0;
      var lagCount = 0;
      Object.keys(benchmark.results).forEach(function(k) {
        var result = benchmark.results[k];
        if (result.read && result.read.eventLoopLag) {
          lag += result.read.eventLoopLag;
          lagCount++;
        }
        if (result.write && result.write.eventLoopLag) {
          lag += result.write.eventLoopLag;
          lagCount++;
        }
      });

      benchmark.eventLoopLag = Math.round(lag / lagCount);

      cb();
    });
  };
}

// run it
async.series(benchmarkTasks, function(err) {
  if (err) {
    return console.log('* ERROR:', err);
  }

  console.log('* ALL BENCHMARKS COMPLETE');
  printResults();
  // done
});

function printResults() {
  isRunning = false;

  console.log('* RESULTS:');
  console.log('\r\n* Wall Clock (ms):');
  benchmarks.forEach(function(benchmark) {
    printWallClock(benchmark, benchmark, benchmarks[0]);
    Object.keys(benchmark.results).forEach(function(k) {
      printWallClock(benchmark, benchmark.results[k].read, benchmarks[0].results[k].read);
      printWallClock(benchmark, benchmark.results[k].write, benchmarks[0].results[k].write);
    });
  });
  console.log('\r\n* CPU Clock (ms): *** NOTE: Includes all cpu usage -- run only on idle system');
  benchmarks.forEach(function(benchmark) {
    printCPUClock(benchmark, benchmark, benchmarks[0]);
    Object.keys(benchmark.results).forEach(function(k) {
      printCPUClock(benchmark, benchmark.results[k].read, benchmarks[0].results[k].read);
      printCPUClock(benchmark, benchmark.results[k].write, benchmarks[0].results[k].write);
    });
  });
  console.log('\r\n* Throughput (KByte/sec):');
  benchmarks.forEach(function(benchmark) {
    printThroughput(benchmark, benchmark, benchmarks[0]);
    Object.keys(benchmark.results).forEach(function(k) {
      printThroughput(benchmark, benchmark.results[k].read, benchmarks[0].results[k].read);
      printThroughput(benchmark, benchmark.results[k].write, benchmarks[0].results[k].write);
    });
  });
  console.log('\r\n* Avg Event Lag (ms):');
  benchmarks.forEach(function(benchmark) {
    printEventLoopLag(benchmark, benchmark, benchmarks[0]);
    Object.keys(benchmark.results).forEach(function(k) {
      printEventLoopLag(benchmark, benchmark.results[k].read, benchmarks[0].results[k].read);
      printEventLoopLag(benchmark, benchmark.results[k].write, benchmarks[0].results[k].write);
    });
  });
}

function printWallClock(benchmark, test, compare) {
  var compareToJson = ' (base)';
  if (benchmark.name != 'JSON') {
    var diff = Math.round(test.timeElapsed / compare.timeElapsed * 100);
    compareToJson = ' (' + diff + '%)';
  }
  console.log('  ' + test.paddedName + '\t' + test.timeElapsed + compareToJson);
}

function printCPUClock(benchmark, test, compare) {
  var compareToJson = ' (base)';
  if (benchmark.name != 'JSON') {
    var diff = Math.round(test.cpuTimeElapsed / compare.cpuTimeElapsed * 100);
    compareToJson = ' (' + diff + '%)';
  }
  console.log('  ' + test.paddedName + '\t' + test.cpuTimeElapsed + compareToJson);
}

function printThroughput(benchmark, test, compare) {
  var compareToJson = ' (base)';
  if (benchmark.name != 'JSON') {
    var diff = Math.round(test.throughputKBsec / compare.throughputKBsec * 100);
    compareToJson = ' (' + diff + '%)';
  }
  console.log('  ' + test.paddedName + '\t' + test.throughputKBsec + compareToJson);
}

function printEventLoopLag(benchmark, test, compare) {
  var compareToJson = ' (base)';
  if (benchmark.name != 'JSON') {
    var diff = Math.round(test.eventLoopLag / compare.eventLoopLag * 100);
    compareToJson = ' (' + diff + '%)';
  }
  console.log('  ' + test.paddedName + '\t' + test.eventLoopLag + compareToJson);
}
