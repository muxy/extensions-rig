const cpu = require('windows-cpu');
const os = require('os');

// Wrap cpu usage call in a promise
const loadAsync = ()=> {
  return new Promise((resolve, reject) => {
    cpu.totalLoad((err, results) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(results);
      }
    });
  });
};

// Wrap memory usage call in a promise
const memoryAsync = ()=> {
  return new Promise((resolve, reject) => {
    cpu.totalMemoryUsage((err, results) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(results);
      }
    });
  });
};

const getStats = ()=> {
  return new Promise((resolve, reject) => {
    Promise.all([memoryAsync(), loadAsync()]).then((data) => {
      // Calculate memory  usage
      const mem = data[0];
      const memPercent = mem.usageInKb * 1000 / os.totalmem() * 100;

      // Average CPU load across all CPUs
      const cpuLoad = data[1];
      let load = 0;
      for (let i=0; i<cpuLoad.length; i++) {
        load += cpuLoad[i];
      }

      resolve({
        CPU: load / cpuLoad.length,
        RAM: memPercent
      });
    })
    .catch((err) => {
      reject(err);
    });
  });
};

module.exports = {
  getStats: getStats
};