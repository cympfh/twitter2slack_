# Read Twitter Timeline from Slack

read only

## config

```bash
$ cat .config.json
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
    "blacks": []
}
```

Configure webhook url for Slack channel, consumer/token keys for Twitter.
The `blacks` is a list of Twitter accounts (username). The users in blacks does not appeare in your Timeline.
If you don't want to ignore anyone, set an empty list for `blacks`.

## dependencies

- node
    - ([nodebrew](https://github.com/hokaccha/nodebrew) is recommended)
- node modules
    - type `npm install`
