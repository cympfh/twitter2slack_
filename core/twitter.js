function getName(tweet) {
    const name = tweet.user.name;
    return name;
    // const username = tweet.user.screen_name;
    // return `${name} @${username}`;
}

module.exports = {
    getName: getName
};
