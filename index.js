var model = require('./lib/model');

// Offer access to the native model so people can use their own
// versions of the plugins with it if they choose
exports.raw = model;
  
// Provide a bootstrapped model that has all the major features
// out of the box
exports.model = model
  .use(require('getter-setter'))
  .use(require('cast'))
  .use(require('methods'))
  .use(require('attrs'))
  .use(require('validation'))
  .use(require('required'))
  .use(require('defaults'))
  .use(require('discriminators'));

// These can be overriden by simply calling .type() on model
// again, so its ok to add them globally
require('types')(exports.model);