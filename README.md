# Read Twitter Timeline from Slack

read only

## config.json

```bash
$ cat config.json
{
    "slack": {
        "webhookurl": "https://hooks.slack.com/services/*********/*********/************************"
    },
    "twitter": {
        "consumer_key": "******************1F*Q",
        "consumer_secret": "J************************************BEGtg",
        "access_token_key": "************************************************FC",
        "access_token_secret": "t********************************************"
    },
    "blacks": [],
    "whites": [],
    "mode": "white"
}
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
