const needle = require('needle');
const twitterWebhooks = require('twitter-webhooks');
const { config } = require('../config');
const { logger } = require('./logger');
const binance = require('./binance');

/**
 * Initializes a user activity hook
 * @param {*} app Express app
 */
async function hook(app) {
  try {
    const args = {
      serverUrl: config.serverUrl,
      route: config.route,
      accessToken: config.twitter.access_token,
      accessTokenSecret: config.twitter.access_token_secret,
      consumerKey: config.twitter.consumer_key,
      consumerSecret: config.twitter.consumer_secret,
      bearerToken: config.twitter.bearer_token,
      environment: config.twitter.environment,
      app,
    };
    const userActivityWebhook = twitterWebhooks.userActivity(args);

    // if (count > 0) {
    const hooks = await userActivityWebhook.getWebhook();
    // }
    if (hooks.length > 0) {
      const hk = hooks.shift();
      await userActivityWebhook.unregister({
        webhookId: hk.id,
      });
    }
    await userActivityWebhook.register();

    // Subscribe for a particular user activity
    const userActivity = await userActivityWebhook.subscribe({
      userId: config.twitter.username_to_watch,
      accessToken: config.twitter.access_token,
      accessTokenSecret: config.twitter.access_token_secret,
    });

    userActivityWebhook.on('event', async (event, userId, data) => {
      if (event !== 'tweet_create') {
        return;
      }
      logger.info(
        { user_id: userId, data, terms: config.twitter.terms },
        '[lib.twitter.onTweetCreated] Received tweed_create event',
      );
      const valid = contains(data, config.twitter.terms);
      if (valid) {
        logger.info(
          { user_id: userActivity.id, data, terms: config.twitter.terms },
          '[lib.twitter.onTweetCreated] tweet_create event is valid',
        );
        const result = await binance.longTralingStop(
          config.binance.order.quantity_to_by,
          config.binance.order.callback_rate,
          config.binance.order.activation_price,
        );
        logger.info(
          { result },
          '[lib.twitter.onTweetCreated] Placed order successfully',
        );
      }
    });
  } catch (error) {
    logger.error(
      { error },
      '[lib.twitter.hook] An error occured while listening to webhook',
    );
  }
}

/**
 * Cheks if some string contains at least one term
 * in a comma separated list of terms
 * @param {*} data string to check
 * @param {*} terms terms to check
 */
function contains(data, terms) {
  let valid = true;
  valid = terms
    .trim()
    .split(',')
    .map((v) => data.indexOf(v) > -1)
    .any((v) => v === true);
  return valid;
}

/**
 * Sets some stream filter rules
 * @param {*} insertRules Stream filter rules to set
 */
async function setRules(insertRules) {
  const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
  const data = {
    add: insertRules,
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.twitter.bearer_token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}

/**
 * Retrieves existing stream filter rules
 */
async function getAllRules() {
  const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';

  const response = await needle('get', rulesURL, {
    headers: {
      authorization: `Bearer ${config.twitter.bearer_token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

/**
 * Deletes existing stream filter rules
 * @param {*} rules Stream filter rules
 */
async function deleteAllRules(rules) {
  const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';

  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids,
    },
  };

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.twitter.bearer_token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

/**
 * Retrieves a tweets stream and listens to it
 */
function streamConnect() {
  const streamURL = 'https://api.twitter.com/2/tweets/search/stream';

  const stream = needle.get(streamURL, {
    headers: {
      'User-Agent': 'v2FilterStreamJS',
      Authorization: `Bearer ${config.twitter.bearer_token}`,
    },
    timeout: 20000,
  });

  stream
    .on('data', async (data) => {
      try {
        if (isKeepAliveSignal(data)) return;
        const json = validateEvent(data);
        logger.info({ json }, '[on_stream] Received valid tweets stream data');
        const result = await binance.longMarket(
          config.binance.order.quantity_to_by,
          config.binance.order.symbol,
        );
        logger.info({ result }, '[on_stream] Placed order successfully');
      } catch (error) {
        logger.info({ data, error }, 'An error occured when validating data');
      }
    })
    .on('error', (error) => {
      if (error.code === 'ETIMEDOUT') {
        stream.emit('timeout');
      }
    });

  return stream;
}

/**
 * Checks wether it is a keep-alive signal
 * to treat it or not
 * @param {*} data keep-alive data
 */
function isKeepAliveSignal(data) {
  const hearBeat = Buffer.from([13, 10]);
  // Keep alive signal received. Do nothing.
  if (data.equals(hearBeat)) return true;
  return false;
}

function validateEvent(data) {
  const json = JSON.parse(data);
  logger.info({ json }, 'Parsed event json :');
  if (!json.data.id || !json.data.text || json.matching_rules.lengh < 1) {
    throw new Error('Event data are Invalid');
  }
  return json;
}

module.exports = {
  hook,
  setRules,
  getAllRules,
  deleteAllRules,
  streamConnect,
};
