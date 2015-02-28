module.exports = require('./lib/model')
  .use(require('./lib/getter-setter'))
  .use(require('./lib/cast'))
  .use(require('./lib/methods'))
  .use(require('./lib/attrs'))
  .use(require('./lib/validation'))
  .use(require('./lib/required'))
  .use(require('./lib/defaults'))
  .use(require('./lib/discriminators'));

require('./lib/types');