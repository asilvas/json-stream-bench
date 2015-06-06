var os = require("os");

module.exports = {
  getTotalCpuTimeInMs: getTotalCpuTimeInMs
};

function getTotalCpuTimeInMs() {
  var cpus = os.cpus();
  var totalCpuInMs = 0;

  cpus.forEach(function(cpu) {
    Object.keys(cpu.times).forEach(function(timeKey) {
      if (timeKey === 'idle') return;

      totalCpuInMs += cpu.times[timeKey];
    });
  });

  return totalCpuInMs;
}
