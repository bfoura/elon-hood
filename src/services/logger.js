const { createLogger, format, transports } = require('winston');

/**
 * Builds a simple console logger
 */
function getLogger() {
  const logger = createLogger({
    exitOnError: false,
    format: format.json(),
  });

  logger.add(
    new transports.Console({
      format: format.simple(),
    }),
  );

  return logger;
}
const logger = getLogger();

module.exports = {
  logger,
};
