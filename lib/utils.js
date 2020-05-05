const { camelcase, humanize } = require('underscore.string');

exports.typeOf = (item) => ({}).toString.call(item).slice(8, -1).toLowerCase();

// exports.toCurrency = val => val.toLocaleString('en', { style: 'currency', currency: 'USD' });

exports.toCurrency = val => val.toLocaleString('en', {
  style: 'currency',
  maximumFractionDigits : 2,
  minimumFractionDigits : 2,
  currency: 'USD'
});


exports.humanize = humanize;
exports.camelcase = camelcase;
