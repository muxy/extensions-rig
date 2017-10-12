const si = require('systeminformation');

const getStats = ()=> {
  return new Promise((resolve, reject) => {
    Promise.all([si.currentLoad(), si.mem()])
    .then((data) => {
      resolve({
        CPU: data[0].currentload,
        RAM: data[1].active / data[1].total * 100
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