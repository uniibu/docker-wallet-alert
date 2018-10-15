# docker-wallet-alert
      send slack alerts about other containered wallets

### Via Docker
Create a named volume

```
docker volume create --name=notify-data
```

Create `default.json` file somwhere in your directory example `~/.walletnotify/default.json`
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
docker run -v notify-data:/app --name=walletnotify -d \
      -v $HOME/.walletnotify/default.json:/app/config/default.json \
      unibtc/wallet-alert:latest
```

Auto Install
```
sudo bash -c "$(curl -L https://git.io/fxEj5)"
```