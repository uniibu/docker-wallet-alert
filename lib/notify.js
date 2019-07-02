const needle = require('needle');
const config = require('config');
const { restartCont } = require('./containerStats');
const symbols = {
  'bitcoind-node': 'btc',
  'litecoind-node': 'ltc',
  'dogecoind-node': 'doge',
  'bchd-node': 'bch',
  'ripplet-node': 'xrp',
  'parityeth-node': 'eth',
  'parityetc-node': 'etc',
  'zec-node': 'zec',
  'dgb-node': 'dgb',
  'bsvd-node': 'bsv',
  'btg-node': 'btg',
  'dashd-node': 'dash',
  'stellar-node': 'xlm'
};
const template = {
  'username': 'Wallet Status',
  'text': 'Status Update',
  'icon_emoji': ':robot_face:',
  'attachments': []
};

function deepcopy(value) {
  if (!(!!value && typeof value == 'object')) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepcopy);
  }
  const result = {};
  Object.keys(value).forEach(
    key => { result[key] = deepcopy(value[key]); });
  return result;
}
module.exports = async r => {
  const payload = deepcopy(template);
  let hasError = false;
  for (const w of r.wallets) {
    if (!w.rpc || !w.status) {
      hasError = true;
      await restartCont(w.name);
    }
    const walletName = symbols[w.name] || w.name;
    payload.attachments.push({
      author_name: w.name,
      author_icon: `https://www.bitsler.com/img/currencies/${walletName}.png`,
      fallback: `${walletName.toUpperCase()} Status - ${w.version}`,
      text: `${walletName.toUpperCase()} Status - *${w.version}*`,
      fields: [{
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
      color: (w.rpc && w.status) ? 'good' : 'danger'
    });
  }
  if (hasError) {
    payload.text = `<!channel> ${payload.text}`;
  }
  payload.attachments.push({
    'author_name': 'wallet_server',
    'author_icon': 'https://www.bitsler.com/img/favicon.png',
    'fallback': 'Server Status',
    'text': 'Server Status',
    'fields': [{
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
  await needle('post', config.get('SLACKURL'), payload, { json: true });
};