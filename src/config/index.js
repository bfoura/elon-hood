const config = {
  twitter: {
    access_token: process.env.TWITTER_TOKEN,
    access_token_secret: process.env.TWITTER_SECRET,
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN,
    username_to_watch: process.env.TWITTER_USERNAME_TO_WATCH || 'elonmusk',
    terms: process.env.TERMS || 'dog, doge, dogecoin',
    environment: process.env.TWITTER_ENVIRONMENT || 'dev',
  },
  binance: {
    base_url: process.env.BINANCE_BASE_URL || 'https://fapi.binance.com',
    api_key: process.env.BINANCE_API_KEY,
    api_secret: process.env.BINANCE_API_SECRET,
    order: {
      quantity_to_by: parseFloat(process.env.ORDER_QUANTITY_TO_BUY || '10'),
      callback_rate: parseFloat(process.env.ORDER_CALLBACK_RATE || '1.5'),
    },
  },
  serverUrl: process.env.SERVER_URL_DOMAIN,
  route: process.env.SERVER_ROUTE_URL || '/',
  port: process.env.PORT || 3333,
  env: process.env.NODE_ENV || 'development',
};

module.exports = {
  config,
};
