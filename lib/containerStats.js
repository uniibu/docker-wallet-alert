const shell = require('shelljs');
const config = require('config');
const escapeDoubleQuotes = str => // thanks @slevithan!
  str.replace(/\\([\s\S])|(")/g, '\\$1$2');
const JSONParse = str => {
  try {
    str = JSON.parse(str);
    return str;
  } catch (e) {
    return false;
  }
};
const clis = {
  'bitcoind-node': 'bitcoin-cli',
  'litecoind-node': 'litecoin-cli',
  'dogecoind-node': 'dogecoin-cli',
  'bchd-node': 'bitcoin-cli',
  'ripplet-node': 'ripplet-cli'
};
const dockExec = (method, cmd, container) => new Promise((resolve) => {
  let command;
  if (method == 'exec') {
    command = `docker exec ${container} /bin/bash -c "${escapeDoubleQuotes(cmd)}"`;
  } else {
    command = `docker ${method} ${cmd}`;
  }
  shell.exec(command, { silent: true }, (code, stdout, stderr) => {
    if (stderr) return resolve(false);
    resolve(stdout.trim());
  });
});

exports.getWalletInfos = async (container, rpcPort) => {
  try {
    const info = { name: container };
    let rpcCmd = '';
    if (container.includes('parity')) {
      rpcCmd = `curl --fail --silent --show-error --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:${rpcPort}`;
    } else if (container.includes('ripple')) {
      rpcCmd = `${clis['ripplet-node']} getBalance`;
    } else {
      rpcCmd = `${clis[container]} getblockchaininfo`;
    }
    const [status, stats, rpc] = await Promise.all([
      dockExec('ps', `-f "name=${container}" --format "{{.Status}}"`),
      dockExec('stats', `${container} --no-stream --format "{\\"cpu\\": \\"{{.CPUPerc}}\\", \\"memory_usage\\": \\"{{.MemUsage}}\\", \\"memory_perc\\": \\"{{.MemPerc}}\\"}"`),
      dockExec('exec', rpcCmd, container)
    ]);
    info.status = status;
    info.stats = JSONParse(stats);
    info.rpc = !!rpc;
    return info;
  } catch (e) {
    return false;
  }
};
exports.getContainers = async () => {
  let list = (await dockExec('ps', '-f "name=node" --format "{{.Names}}"')).split('\n');
  const c = {};
  for (let l of list) {
    c[l] = config.get(l.replace('-node', '').toUpperCase());
  }
  return c;
};

exports.restartCont = async container => {
  await dockExec('restart', `-t 20 ${container}`);
};