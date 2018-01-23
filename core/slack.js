var request = require('request');


function Slack(config) {

    function post(text, username, options, medias=[]) {
        headers = {
            "Content-type": "application/json"
        };
        data = {
            "username": username,
            "fallback": "Hi",
            "channel": "#timeline",
            "text": text
        }
        for (var key in options) {
            data[key] = options[key];
        }
        console.log('POST', data)
        options = {
            headers: headers,
            body: JSON.stringify(data)
        };
        request.post(config.slack.webhookurl, options, (err, response) => {
            if (err) {
                console.log('Err from Slack:', err);
                return;
            }
            if (response) { console.log('Response:', response.body); }

            function upload_loop(i) {
                if (i >= medias.length) return;
                const url = medias[i];
                console.log('upload', url);
                upload(url, (err) => {
                    upload_loop(i + 1);
                });
            }
            upload_loop(0);
        });
    }

    const SlackUpload = require('node-slack-upload');
    var uploader = new SlackUpload(config.slack.token);

    // to Slack
    function upload(url, cont) {
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
            if (cont) cont(err);
        });
    }

    this.post = post;
}

module.exports = Slack;
