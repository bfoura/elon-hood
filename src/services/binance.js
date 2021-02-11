const moment = require('moment');
const agent = require('superagent');
const crypto = require('crypto');

const { config } = require('../config');
const { logger } = require('./logger');

/**
 * Creates a usdt futures long order with a traling stop
 * @param {*} quantity
 */
async function longTralingStop(quantity, rate = undefined) {
  const symbol = 'DOGEUSDT';
  const side = 'BUY';
  const type = 'TRAILING_STOP_MARKET';
  const reduceOnly = true;
  const callbackRate = rate || 0.1;
  const workingType = 'CONTRACT_PRICE';
  const timestamp = moment().utc().valueOf();
  const queryString = toQueryString({
    symbol,
    side,
    type,
    quantity,
    reduceOnly,
    callbackRate,
    workingType,
    timestamp,
    recvWindow: 10000000,
  });
  const signature = generateSignature(queryString, config.binance.api_secret);

  const url = `${config.binance.base_url}/fapi/v1/order?${queryString}&signature=${signature}`;

  try {
    const { body } = await agent
      .post(url)
      .set('Content-Type', `application/json`)
      .set('X-MBX-APIKEY', config.binance.api_key);

    return body;
  } catch (err) {
    logger.error({ err, queryString }, 'An error occured while creating trade');
    throw new Error(`An error occured while creating trade : ${err}'`);
  }
}

/**
 * Generates a HMAC digest based on Binance api secret and request query string
 * @param {*} text Request query string
 * @param {*} key Binance api secret
 */
function generateSignature(text, key) {
  const hmac = crypto.createHmac('sha256', key).update(text).digest('hex');
  return hmac;
}

/**
 * Converts an object to a request query string
 * @param {*} params Object with keys to convert
 */
function toQueryString(params) {
  const allParamsObject = new URLSearchParams({
    ...params,
  }).toString();
  return allParamsObject;
}

module.exports = {
  longTralingStop,
};
