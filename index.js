var request = require('request');
var twitter = require('twitter');

var config = require('./.config.json');
var client = new twitter(config.twitter);

var mode = config.mode ? config.mode : 'black';
var blacks = config.blacks ? config.blacks : [];
var whites = config.whites ? config.whites : [];

// to Slack channel
function post(text, username, options) {
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
    for (a of blacks) { if (a == name) return true; }
    return false;
}

function is_white(name) {
    var a;
    for (a of whites) { if (a == name) return true; }
    return false;
}

(function () {

    var suicide = (reason) => {
        console.log(`Unexpected ${reason} happened. Good bye.`);
        process.exit();
    };

    var last_time = (new Date()).getTime();

    client.stream('user', {}, (stream) => {

        setInterval(() => {
            var now = (new Date()).getTime();
            var dmin = (now - last_time) / 1000 / 60;
            if (dmin > 10) suicide('timeout');
        }, 60);

        console.log('ready');

        stream.on('data', (tweet) => {
            last_time = (new Date()).getTime();
            if (!tweet || !tweet.user || !tweet.text) return;
            username = tweet.user.screen_name;
            console.log(username);
            if (mode == 'white') {
                if (is_white(username)) {
                    console.log(`OK: ${username} is white`)
                    twit(tweet);
                } else {
                    console.log(`NG: ${username} is not white`)
                }
            } else {
                if (is_black(username)) {
                    console.log(`NG: ${username} is black`)
                } else {
                    console.log(`OK: ${username} is not black`)
                    twit(tweet);
                }
            }
        })

        stream.on('end', () => suicide('end'));
        stream.on('disconnect', () => suicide('disconnect'));
        stream.on('destroy', () => suicide('destroy'));
        stream.on('close', () => suicide('close'));
        stream.on('error', () => suicide('error'));
    });

}());
