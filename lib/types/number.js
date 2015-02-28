require('../../')
  .validator(isNumber)
  .caster(toNumber)
  .default(0)
  .type('number');

function isNumber(value) {
  return 'number' === typeof value;
}

function toNumber(value) {
  return Number(value);
}
