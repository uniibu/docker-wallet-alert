const { CronJob } = require('cron');
const contStats = require('./lib/containerStats');
const srvStats = require('./lib/serverStats');
const notify = require('./lib/notify')
if(!process.env.SLACKURL || !process.env.CRON){
  console.error('Missing environment variables')
  process.exit(1)
}
contStats.getContainers().then(containers => {
  new CronJob(process.env.CRON, async () => {
    const result = {
      wallets: await Promise.all(Object.keys(containers).map(c => contStats.getWalletInfos(c, containers[c]))),
      server: await srvStats()
    };
    await notify(result)    
  }, null, true);
});