const { CronJob } = require('cron');
const contStats = require('./lib/containerStats');
const srvStats = require('./lib/serverStats');
const notify = require('./lib/notify')

const start = async function(){
if(!process.env.SLACKURL || !process.env.CRON){
  throw new Error('Missing environment variables')
}
const containers = await contStats.getContainers()
  new CronJob(process.env.CRON, async () => {
    const result = {
      wallets: await Promise.all(Object.keys(containers).map(c => contStats.getWalletInfos(c, containers[c]))),
      server: await srvStats()
    };
    await notify(result)    
  }, null, true);
}

if (require.main === module) {
    start()
} else {
   module.exports = start
}