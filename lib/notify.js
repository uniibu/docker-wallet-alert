const needle = require('needle');
const symbols = {
  'bitcoind-node': 'btc',
  'litecoind-node': 'ltc',
  'dogecoind-node': 'doge',
  'bchd-node': 'bch',
  'rippled-node': 'xrp',
  'parityeth-node': 'eth',
  'parityetc-node': 'etc'
};

const template = {	
  'username': 'Wallet Status',
  'text': '<!channel> Status Update',
  'icon_emoji': ':robot_face:',
  'attachments': []    
};
             
module.exports = async function(r){
  const payload = Object.assign({}, template);
  for(const w of r.wallets){
    payload.attachments.push({
      author_name: w.name,
      author_icon: `https://www.bitsler.com/img/img-${symbols[w.name]}.png`,
      fallback: `${symbols[w.name].toUpperCase()} Status`,
      text: `${symbols[w.name].toUpperCase()} Status`,
      fields: [
        {
          title: 'Container',
          value: `Status: ${w.status || 'DOWN'}\nJson-Rpc: ${w.rpc ? 'Up and Running': 'DOWN'}`,
          short: true
        },
        {
          title: 'Stats',
          value: `CPU: ${w.stats.cpu}\nMEM: ${w.stats.memory_usage} (${w.stats.memory_perc})`,
          short: true
        },
      ],
      color: (w.rpc && w.status) ? 'good':'danger'
    });
  }
  payload.attachments.push({
    'author_name': 'wallet_server',
        	'author_icon': 'https://www.bitsler.com/img/favicon.png',
    'fallback': 'Server Status',
    'text': 'Server Status',
    'fields': [
      {
        'title': 'CPU Usage',
        'value': r.server.cpu,
        'short': true
      },
      {
        'title': 'Memory',
        'value': `Free: ${r.server.mem.free}\nTotal: ${r.server.mem.total}`,
        'short': true
      },
      {
        'title': 'Disk Usage',
        'value': `Free: ${r.server.diskstat.free}\nTotal: ${r.server.diskstat.total}`,
        'short': true
      }                  
    ],
    'color': 'good',
	  'footer': 'Bitsler Wallet API',
    'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png',
    'ts': new Date() / 1000
  });
  console.log(payload)
  await needle('post', process.env.SLACKURL, payload, {json: true});
};
