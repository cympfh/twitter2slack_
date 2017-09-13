var request = require('request');
var twitter = require('twitter');

var config = require('./.config.json');
var client = new twitter(config.twitter);

blacks = [
    'dummy'
];

// to Slack channel
function post(tweet, debug=false) {

    username = tweet.user.screen_name
    icon_url = tweet.user.profile_image_url
    id = tweet.id_str
    post_url = `https://twitter.com/${username}/status/${id}`

    text = post_url
    if (tweet.user.protected) {
        text += "\n:key: " + tweet.text;
    }

    headers = {
        "Content-type": "application/json"
    };
    data = {
        "username": username,
        "icon_url": icon_url,
        "fallback": "Hi",
        "channel": "#timeline_twitter",
        "text": text
    }
    options = {
        headers: headers,
        body: JSON.stringify(data)
    };
    console.log('POST', options);
    if (!debug) {
        request.post(config.slack.webhookurl, options, (err, response) => {
            console.log('Response:', response.body);
        })
    }
}

function is_black(name) {
    var a;
    for (a of blacks) {
        if (a == name) return true;
    }
    return false;
}

function main(debug=false) {
    client.stream('user', {}, (stream) => {
        stream.on('data', (tweet) => {
            username = tweet.user.screen_name;
            console.log(username, `black?=${is_black(username)}`);
            if (is_black(username)) return;
            console.log(tweet);
            post(tweet);
        })
    })
}

main()
