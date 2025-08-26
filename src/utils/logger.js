const util = require('util');
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
let currentLevel = (() => {
  const lvl = process.env.LOG_LEVEL ? process.env.LOG_LEVEL.toLowerCase() : null;
  if (lvl && LOG_LEVELS.hasOwnProperty(lvl)) return lvl;
  if (process.env.NODE_ENV === 'production') return 'warn';
  return 'debug';
})();
function formatLog(level, args) {
  const timestamp = new Date().toISOString();
  const levelTag = `[${level.toUpperCase()}]`;
  const message = args.map(arg => {
    if (arg instanceof Error) {
      return arg.stack || arg.message;
    }
    if (typeof arg === 'object') {
      try {
        return util.inspect(arg, { depth: null, colors: false });
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
  return `${levelTag} [${timestamp}] ${message}`;
}
function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}
const logger = {};
['error', 'warn', 'info', 'debug'].forEach(level => {
  logger[level] = (...args) => {
    if (!shouldLog(level)) return;
    const output = formatLog(level, args);
    if (level === 'error') {
      console.error(output);
    } else {
      console.log(output);
    }
  };
});
logger.setLevel = (level) => {
  if (LOG_LEVELS.hasOwnProperty(level)) {
    currentLevel = level;
  }
};
logger.isLevelEnabled = (level) => {
  return LOG_LEVELS.hasOwnProperty(level) && LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
};
module.exports = logger;