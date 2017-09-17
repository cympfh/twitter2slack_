var request = require('request');
var twitter = require('twitter');

var config = require('./.config.json');
var client = new twitter(config.twitter);

// to Slack channel
function post(text, username, options) {
    headers = {
        "Content-type": "application/json"
    };
    data = {
        "username": username,
        "fallback": "Hi",
        "channel": "#timeline_twitter",
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
        if (err) { console.log('Err from Slack:', err); }
        if (response) { console.log('Response:', response.body); }
    });
}

function log(msg) {
    post(msg, 'info', {icon_emoji: ':information_source:'});
}

function twit(tweet) {
    username = tweet.user.screen_name
    icon_url = tweet.user.profile_image_url
    id = tweet.id_str
    text = `https://twitter.com/${username}/status/${id}`
    if (tweet.user.protected) {
        text += "\n:key: " + tweet.text;
    }
    post(text, username, {icon_url: icon_url});
}

function is_black(name) {
    var a;
    for (a of config.blacks) {
        if (a == name) return true;
    }
    return false;
}

function main() {
    client.stream('user', {}, (stream) => {
        console.log('Hello');
        log('Hello');
        stream.on('data', (tweet) => {
            if (!tweet || !tweet.user || !tweet.text) return;
            username = tweet.user.screen_name;
            console.log(username, `black?=${is_black(username)}`);
            if (is_black(username)) return;
            console.log(tweet);
            twit(tweet);
        })
        stream.on('end', (tweet) => {
            console.log('end (restarting after 1 sec)');
            log('end (restarting after 1 sec)');
            setTimeout(main, 1000);
        });
    })
}

main()
