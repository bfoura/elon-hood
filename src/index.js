const { logger } = require('./services/logger');

const bot = require('./lib/bot');

let httpserver;
// let db;
/**
 * Stop the process on sigterm
 *
 * @returns {Promise<void>} Nothing
 * @private
 */
function sigterm() {
  return stop('SIGTERM');
}

/* istanbul ignore next */
/**
 * Stop the process on sigint
 *
 * @returns {Promise<void>} Nothing
 * @private
 */
function sigint() {
  return stop('SIGINT');
}

/* istanbul ignore next */
/**
 * Stop the process on uncaughtException
 *
 * @param {Error} err Uncaught error
 * @returns {Promise<void>} Nothing
 * @private
 */
function uncaughtException(err) {
  return stop('uncaughtException', err);
}

/* istanbul ignore next */
/**
 * Stop the process on unhandledRejection
 *
 * @param {Error} err UnhandledRejection error
 * @returns {Promise<void>} Nothing
 * @private
 */
function unhandledRejection(err) {
  return stop('unhandledRejection', err);
}

/**
 * Bind process events
 * @returns {void} Nothing
 * @private
 */
function bindProcess() {
  process.removeListener('SIGTERM', sigterm);
  process.removeListener('SIGINT', sigint);
  process.removeListener('uncaughtException', uncaughtException);
  process.removeListener('unhandledRejection', unhandledRejection);

  process.once('SIGTERM', sigterm);
  process.once('SIGINT', sigint);
  process.once('uncaughtException', uncaughtException);
  process.once('unhandledRejection', unhandledRejection);
}

/**
 * Start the application
 * @returns {Promise<Express>} The express app
 */
async function start() {
  bindProcess();
  // db = models.getDbClient();
  // await db.sequelize.authenticate();
  // logger.info('Database connected');
  // const queue = queueFactory.createQueue(db);
  // const locker = lockerFactory.createLocker(db);
  logger.info('[start] starting stream');
  await bot.startStream();
  return true;
}

/**
 * Stop function
 * @param {string} code type of error
 * @param {Error} err the error
 * @returns {Promise<void>} Nothing
 */
async function stop(code, err) {
  logger.info('Application stopping', { code });

  if (err) {
    logger.error('Application error', { code });
  }

  // if (slackBot) {
  //   logger.info('Closing slack connection');
  //   slackBot.destroy.apply(slackBot);
  //   logger.info('Slack connection closed');
  // }

  if (httpserver) {
    logger.info('Closing express server');
    await httpserver.close();
    logger.info('Express server closed');
  }

  // logger.info('Shutting down db connection');
  // await db.sequelize.close();
  // logger.info('Connection to db closed');

  logger.info('Application stopped', { code });
}

if (!module.parent) {
  start().then(
    () => {
      logger.info('[main] Bot started');
    },
    (err) => {
      logger.error('[main] Error', { err });
      process.exit(1);
    },
  );
}

module.exports = {
  start,
  stop,
};
