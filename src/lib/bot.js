const { logger } = require('../services/logger');
const twitter = require('../services/twitter');

const { config } = require('../config');

/**
 * Initializes a hook. only for your tweets.
 * @param {*} app
 */
async function startHook(app) {
  await twitter.hook(app);
}

/**
 * Cleans existing filter rules and inserts new ones
 */
async function insertRules() {
  let currentRules;

  try {
    // Gets the complete list of rules currently applied to the stream
    currentRules = await twitter.getAllRules();

    // Delete all rules. Comment the line below if you want to keep your existing rules.
    await twitter.deleteAllRules(currentRules);
    let rules = [];
    // Add rules to the stream. Comment the line below if you don't want to add new rules.

    if (config.twitter.useCustomRule) {
      rules = [
        {
          value: `${config.twitter.useCustomRule}`,
          tag: `${config.twitter.customRuleTag}`,
        },
      ];
    } else {
      rules = [
        {
          value: `(${config.twitter.terms
            .trim()
            .split(',')
            .join(' OR')}) from:${
            config.twitter.username_to_watch
          } -is:retweet`,
          tag: 'elon dogecoin tweets',
        },
      ];
    }
    await twitter.setRules(rules);
  } catch (e) {
    logger.error({ error: e }, 'An error occured while inserting stream');
    throw e;
  }
}

/**
 * Initializes the tweets stream
 */
async function startStream() {
  try {
    // Listen to the stream.
    // This reconnection logic will attempt to reconnect when a disconnection is detected.
    // To avoid rate limits, this logic implements exponential backoff, so the wait time
    // will increase if the client cannot reconnect to the stream.
    await insertRules();
    const filteredStream = twitter.streamConnect();
    let timeout = 0;
    filteredStream.on('timeout', () => {
      // Reconnect on error
      logger.warn('A connection error occurred. Reconnecting…');
      setTimeout(() => {
        timeout += 1;
        twitter.streamConnect();
      }, 2 ** timeout);
      twitter.streamConnect();
    });
  } catch (error) {
    logger.error({ error }, 'An error occured while inserting stream');
    throw error;
  }
}

module.exports = {
  startHook,
  startStream,
};
