const cpuStat = require('cpu-stat');
const memStat = require('mem-stat');
const diskStat = require('diskusage');
function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]})`;
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}
const cpu = () => new Promise((resolve, reject) => {
  cpuStat.usagePercent((err, percent) => {
    if (err) {
      return reject(err);
    }    
    resolve(percent.toFixed(2) +'% average for all ' + cpuStat.totalCores() + ' cores');
  });
});
const disk = () => new Promise((resolve, reject) => {
  diskStat.check('/home', function(err, info) {
    if (err) {
      return reject(err);
    }
    const d = {};
    for(const [k, v] of Object.entries(info)){
      d[k] = bytesToSize(v);
    }
    resolve(d);
    
  });
});
const mem = () => new Promise((resolve) => {
  const m ={};
  for(const [k, v] of Object.entries(memStat.allStats('GiB'))){
    m[k] = `${v.toFixed(2)} ${k.includes('Percent') ? '%': 'GB'}`;
  }
  resolve(m);
});
module.exports = async function(){
  const [cpustat, memstat, diskstat] = await Promise.all([
    cpu(), mem(), disk()
  ]);
  return {cpu: cpustat, mem: memstat, diskstat};
};