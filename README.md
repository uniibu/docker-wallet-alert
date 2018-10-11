# docker-wallet-alert
      send slack alerts about other containered wallets

### Via Docker
Create `production.json` file somwhere in your directory example `~/alerts/production.json`
Required config variables are below:

```js
{
  "BITCOIND": 8332,
  "PARITYETH": 8545,
  "SLACKURL": "https://SLACKWEBHOOKURL",
  "CRON": "*/30 * * * * *"
}
```
`BITCOIND` `PARITYETH` `LITECOIND` etc.. are the json rpc ports
`SLACKURL` is the webhook url from slack
`CRON` is the duration of alert on cron format

Run via Docker
```
docker run --name=wallet-alert -d \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v ~/.alerts/production.json:/app/config/production.json \
      unibtc/wallet-alert
```