# docker-wallet-alert
      send slack alerts about other containered wallets

### Via Docker
Create `.env` file somwhere in your directory example `~/alerts/.env`
Required environment variables are below:

```
BITCOIND=8332
PARITYETH=8545
SLACKURL=https://hooks.slack.com/services/SECRETSLACKWEBHOOKAPI
CRON=*/30 * * * * *
```
`BITCOIND` `PARITYETH` `LITECOIND` etc.. are the json rpc ports
`SLACKURL` is the webhook url from slack
`CRON` is the duration of alert on cron format

Run via Docker
```
docker run --name=wallet-alert -d \
      -v ~/alerts/.env:/app/.env
      unibtc/wallet-alert
```