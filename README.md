# Read Twitter Timeline from Slack

read only

## config.yml

```bash
$ cat config.yml

slack:
  webhookurl: https://hooks.slack.com/services/222222222/888888888/tttttttttttttttttttttttt
  token: xoxb-000000000000-000000000000000000000000
  channelId: CDDDDDDDZ

twitter:
  username: cympfh
  consumer_key: QQQQQQQQQQQQQQQQQQQQQQ
  consumer_secret: JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ
  access_token_key: 1900000000-ooooooooooooooooooooooooooooooooooooooo
  access_token_secret: OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

mode: black
whites: []
blacks:
  - ampeloss
```

Configure webhook url for Slack channel, consumer/token keys for Twitter.

### Black list & White list (optional)

The 3 fields `mode`, `blacks` and `whites` are optional.

The `mode` can be `black` or `white`.
By default, `mode=black`.

When `mode=black`, it works as black list mode.
All tweets from `blacks` are muted.
The `blacks` is a list of user-screen-names (e.g. `hogehoge` for the user `@hogehoge`).
If the `blacks` field is omitted in the config, it be an empty.

When `mode=white`, Only tweets from `whites` are displayed.

## dependencies

- node
    - ([nodebrew](https://github.com/hokaccha/nodebrew) is recommended)
- node modules
    - type `npm install`
