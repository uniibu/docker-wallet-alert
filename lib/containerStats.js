const shell = require('shelljs');
const config = require('config');
const wait = require('util').promisify(setTimeout);
const escapeDoubleQuotes = str =>
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
  'ripplet-node': 'ripplet-cli',
  'zec-node': 'zcash-cli',
  'dgb-node': 'digibyte-cli',
  'bsvd-node': 'bitcoin-cli',
  'btg-node': 'bgold-cli',
  'dashd-node': 'dash-cli',
  'stellar-node': 'staller-cli'
};
const shellExec = async (command, retry = 5) => {
  const runCmd = (cmd) => new Promise((resolve) => {
    shell.exec(cmd, { silent: true }, (code, stdout, stderr) => {
      if (stderr) return resolve(false);
      resolve(stdout.trim());
    });
  })
  let result = false;
  for (let i = 0; i < retry; i++) {
    await wait(1000);
    result = await runCmd(command)
    if (!!result === true) {
      break;
    }
  }
  return result;
}
const dockExec = async (method, cmd, container) => {
  let command;
  if (method == 'exec') {
    command = `docker exec ${container} /bin/bash -c "${escapeDoubleQuotes(cmd)}"`;
  } else {
    command = `docker ${method} ${cmd}`;
  }
  const execresult = await shellExec(command);
  return execresult;
};

const parseVersion = (version, container) => {
  try {
    if (container.includes('parity')) {
      if (typeof version === 'string') {
        version = JSON.parse(version);
      }
      version = version.result.version;
      return `Parity ${version.major}.${version.minor}.${version.patch}`
    }else if (container.includes('ripple')) {
      return 'Ripplet ' + version
    }else if (container.includes('stellar')) {
      return 'Stellar ' + version
    }else {
      if (typeof version === 'string') {
        version = JSON.parse(version);
      }
      return version.subversion.replace(/\//g,'')
    }
  } catch (e) {
    return 0;
  }
}
exports.getWalletInfos = async (container, rpcPort) => {
  try {
    const info = { name: container };
    let rpcCmd = '';
    let versionCmd = '';
    if (container.includes('parity')) {
      rpcCmd = `curl --fail --silent --show-error --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:${rpcPort}`;
      versionCmd = `curl --fail --silent --show-error --data '{"method":"parity_versionInfo","params":[],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:${rpcPort}`
    } else if (container.includes('ripple')) {
      rpcCmd = `${clis['ripplet-node']} getBalance`;
      versionCmd = `${clis['ripplet-node']} --version`;
    } else if (container.includes('stellar')) {
      rpcCmd = `${clis['stellar-node']} getBalance`;
      versionCmd = `${clis['stellar-node']} --version`;
    } else {
      rpcCmd = `${clis[container]} getblockchaininfo`;
      versionCmd = `${clis[container]} getnetworkinfo`;
    }

    const [status, stats, rpc, version] = await Promise.all([
      dockExec('ps', `-f "name=${container}" --format "{{.Status}}"`),
      dockExec('stats', `${container} --no-stream --format "{\\"cpu\\": \\"{{.CPUPerc}}\\", \\"memory_usage\\": \\"{{.MemUsage}}\\", \\"memory_perc\\": \\"{{.MemPerc}}\\"}"`),
      dockExec('exec', rpcCmd, container),
      dockExec('exec', versionCmd, container)
    ]);
    info.status = status;
    info.stats = JSONParse(stats);
    info.rpc = !!rpc;
    info.version = parseVersion(version, container)
    return info;
  } catch (e) {
    return false;
  }
};
const parseContainers = (str) => {
  const [name, ports] = str.split(' ');
  const port = ports.match(/0.0.0.0:(\d+)-/)[1];
  return {name: name.replace('-node', '').toUpperCase(),node:name, port: parseInt(port)}
}
exports.getContainers = async () => {
  let list = (await dockExec('ps', '-f "name=node" --format "{{.Names}} {{.Ports}}"')).split('\n');
  const c = {};
  for (let l of list) {
    const {name,node,port} = parseContainers(l);
    if(config.has(name)) {
      c[node] = config.get(name);
    }else {
      c[node] = port
    }
  }
  console.log(c);
  return c;
};

exports.restartCont = async container => {
  await dockExec('restart', `-t 20 ${container}`);
};