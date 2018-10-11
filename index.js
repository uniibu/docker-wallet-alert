
const config = require('config');
const { CronJob } = require('cron');
const contStats = require('./lib/containerStats');
const srvStats = require('./lib/serverStats');
const notify = require('./lib/notify');

const start = async function(){
  if(!config.get('SLACKURL') || !config.get('CRON')){
    throw new Error('Missing environment variables');
  }
  const containers = await contStats.getContainers();
  new CronJob(config.get('CRON'), async () => {
    const result = {
      wallets: await Promise.all(Object.keys(containers).map(c => contStats.getWalletInfos(c, containers[c]))),
      server: await srvStats()
    };
    await notify(result);    
  }, null, true);
};

if (require.main === module) {
  start();
} else {
  module.exports = start;
}