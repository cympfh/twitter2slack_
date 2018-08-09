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

function post(tweet) {

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

        const text = `:arrows_counterclockwise: ${Twitter.getName(tweet.retweeted_status)}`;
        slack.post(text, display_name, {icon_url: icon_url}, () => {
            post(tweet.retweeted_status);
        });

    }

}

function post_fav(source, target_object) {
    const display_name = source.name;
    const icon_url = source.profile_image_url;
    const text = `:star: ${target_object.text}`;
    slack.post(text, display_name, {icon_url: icon_url});
}

var _muted = [];
function is_muted(screen_name) {
    return _muted.indexOf(screen_name) >= 0;
};

function update_mute_list() {
    client.get('mutes/users/list.json?include_entities=false&skip_status=true', {}, (err, data) => {
        for (var i in data.users) { _muted[i] = data.users[i].screen_name; }
        console.log(`Mute: ${_muted}`);
    });
}

if (config.mute) {
  update_mute_list();
  setInterval(update_mute_list, 30 * 60 * 1000);
}

function is_black(name) {
    for (var a of blacks) { if (a == name) return true; }
    return false;
}

function is_white(name) {
    for (var a of whites) { if (a == name) return true; }
    return false;
}

function is_ok(username, text) {
    if (is_muted(username)) {
        console.log(`Mute User: ${username}`);
        return false;
    } else {
        for (var ngword of config.ng_words) {
            if (text.indexOf(ngword) >= 0) {
                console.log(`NG Word Found: ${ngword}`);
                return false;
            }
        }
        if (mode == 'white') {
            if (is_white(username)) {
                console.log(`OK: ${username} is white`)
                return true;
            } else {
                console.log(`NG: ${username} is not white`)
                return false;
            }
        } else {
            if (is_black(username)) {
                console.log(`NG: ${username} is black`)
                return false;
            } else {
                console.log(`OK: ${username} is not black`)
                return true;
            }
        }
    }
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
            if (is_ok(tweet.user.screen_name, tweet.text)) {
                post(tweet);
            }
        });

        stream.on('event', (event) => {
            last_time = (new Date()).getTime();
            if (event.event == 'favorite') {
                if (is_ok(event.source.screen_name, '')) {
                    post_fav(event.source, event.target_object);
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
