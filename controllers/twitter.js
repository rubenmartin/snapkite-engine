var Twitter = require('node-tweet-stream');

var isValidTweet = function (tweet, config) {
  var validTweet = true;

  //
  // Check that track keywords are part of tweet's text
  //
  var trackKeywords = config.application.trackKeywords.replace(',','|');
  var trackKeywordsRegex = new RegExp(trackKeywords, 'gim');

  if (! tweet.text.match(trackKeywordsRegex)) {
    validTweet = false;
  }

  // Validate tweet with filters
  config.application.filters.forEach(function (filter) {
    if (validTweet) {
      validTweet = require('../filters/' + filter).isValid(tweet);
    }
  });

  return validTweet;
};

module.exports = function (config, handleTweet) {
  var TWITTER_CONSUMER_KEY = config.twitter.api.consumerKey;
  var TWITTER_CONSUMER_SECRET = config.twitter.api.consumerSecret;
  var TWITTER_ACCESS_TOKEN_KEY = config.twitter.api.accessTokenKey;
  var TWITTER_ACCESS_TOKEN_SECRET = config.twitter.api.accessTokenSecret;
  var TWITTER_PICTURE_TRACK_KEYWORD = "pic twitter com";

  var keywords = [TWITTER_PICTURE_TRACK_KEYWORD, config.application.trackKeywords].join(' ');

  var twitter = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    token: TWITTER_ACCESS_TOKEN_KEY,
    token_secret: TWITTER_ACCESS_TOKEN_SECRET
  });

  twitter.on('tweet', function (tweet) {
    if (isValidTweet(tweet, config)) {
      handleTweet(tweet);
    }
  });

  twitter.on('error', function (error) {
    console.error('[Snapkite][Error] ' + error);
  })

  twitter.track(keywords);
};
