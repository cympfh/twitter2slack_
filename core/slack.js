var request = require('request');


function Slack(config) {

    function post(text, username, options, cont) {
        const headers = { "Content-type": "application/json" };
        var data = {
            "username": username,
            "fallback": "Hi",
            "channel": "#timeline",
            "text": text
        }
        for (var key in options) {
            data[key] = options[key];
        }
        console.log('POST', data);
        const slack_options = {
            headers: headers,
            body: JSON.stringify(data)
        };
        request.post(config.slack.webhookurl, slack_options, (err, response) => {
            if (err) {
                console.log('Err from Slack:', err);
                return;
            }
            if (response) { console.log('Response:', response.body); }
            if (cont) cont();
        });
    }

    const SlackUpload = require('node-slack-upload');
    var uploader = new SlackUpload(config.slack.token);

    function upload_by_bot(url) {
        /*
         * API doc: https://api.slack.com/methods/files.upload
         * Get the channelId (not the channel name): https://api.slack.com/methods/channels.list/test
         * Get bot-token: https://api.slack.com/bot-users
         */
        uploader.uploadFile({
            file: request.get(url),
            title: url,
            channels: config.slack.channelId
        }, (err, data) => {
            if (err) console.warn(err);
        });
    }

    this.post = post;
    this.upload_by_bot = upload_by_bot;

}

module.exports = Slack;
