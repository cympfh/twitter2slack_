const fs = require('fs');
const YAML = require('yamljs');
const twitter = require('twitter');

const config = YAML.load('./config.yml');
var client = new twitter(config.twitter);

var mode = config.mode ? config.mode : 'black';
var blacks = config.blacks ? config.blacks : [];
var whites = config.whites ? config.whites : [];

const Slack = require('./core/slack');
const slack = new Slack(config);

const Twitter = require('./core/twitter');

function log(msg) {
    slack.post(msg, 'info', {icon_emoji: ':information_source:'});
}

function twit(tweet) {

    const display_name = Twitter.getName(tweet);
    const icon_url = tweet.user.profile_image_url;

    if (!tweet.retweeted_status) { // when regular tweet (not RT)

        const text = tweet.text;
        slack.post(text, display_name, {icon_url: icon_url});

        // uploading the protected media images
        if (tweet.user.protected && tweet.entities && tweet.entities.media) {
            for (var item of tweet.extended_entities.media) {
                slack.upload_by_bot(item.media_url);
            };
        }

    } else {  // when RT

        const text = `RT ${Twitter.getName(tweet.retweeted_status)}`;
        slack.post(text, display_name, {icon_url: icon_url});
        twit(tweet.retweeted_status);

    }

}

function is_black(name) {
    for (var a of blacks) { if (a == name) return true; }
    return false;
}

function is_white(name) {
    for (var a of whites) { if (a == name) return true; }
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
        });

        stream.on('end', () => suicide('end'));
        stream.on('disconnect', () => suicide('disconnect'));
        stream.on('destroy', () => suicide('destroy'));
        stream.on('close', () => suicide('close'));
        stream.on('error', () => suicide('error'));
    });

}());
