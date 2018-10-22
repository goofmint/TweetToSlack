const config = require('./config');
const twitter = require('twitter');
const client = new twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token_key: config.twitter.accessToken,
  access_token_secret: config.twitter.accessTokenSecret,
});

const csv = require("fast-csv");
const fs = require('fs');
const options = {'flags': 'a', 'encoding': null, 'mode': 0666};
const writableStream = fs.createWriteStream(config.files.train, options);
const idList = fs.createWriteStream(config.files.id, options);

const request = require('superagent');
const {SpamCheker} = require('./SpamCheker');
const spam = new SpamCheker;

const getTweets = (params) => {
  return new Promise((res, rej) => {
    client.get('search/tweets', params, (error, tweets, response) => {
      if (error) {
        rej(error)
      } else {
        res(tweets)
      }
    });
  })
}

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

const readIds = async () => {
  return new Promise((res, rej) => {
    fs.readFile(config.files.id, 'utf8', (err, data) => {
      err ? rej(err) : res(data.split(/\n/));
    });    
  })
}

const sendToSlack = async (tweet) => {
  const message = tweet.user.screen_name + "さんからのツイート：" + tweet.text + " 。 at " + tweet.created_at + "\n<" + config.twitter.url + tweet.user.screen_name + '/status/' + tweet.id + ">";
  return request.post(config.slack.url)
    .set('Content-Type', 'application/json')
    .send({
     "channel" : config.slack.channel,
     "username" : config.slack.username,
     "icon_emoji": config.slack.emoji,
     "text" : message
    });
}

(async () => {
  const ids = await readIds();
  setInterval(async () => {
    try {
      const tweets = await getTweets({
        q: config.twitter.search,
        lang: config.twitter.lang,
        count: 100
      });
      for (let i = 0; i < tweets.statuses.length; i += 1) {
        const tweet = tweets.statuses[i];
        if (ids.indexOf(tweet.id) > -1) {
          continue;
        } else {
          ids.push(tweet.id);
          idList.write(`${tweet.id}\n`);
        }
        // Check it.
        let isSpam = await spam.isSpam(`${tweet.user.screen_name} ${tweet.text}`);
        let str = `__label__${isSpam ? '1' : '0'} , `;
        str += `${spam.words.join(' ')} ${tweet.user.screen_name}`;
        writableStream.write(`${str}\n`);
        
        // Send to Slack
        if (!isSpam) await sendToSlack(tweet);
      }
    } catch (err) {
      console.log(err);
    }
  }, 1000 * 60);
})();
