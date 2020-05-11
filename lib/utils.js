const { camelcase, humanize } = require('underscore.string');

const META_PROPS = [
  '_label',
  '_prop',
  '_input',
  '_type',
  '_placeholder',
  '_prefix',
  '_help',
  '_required',
  '_multiple',
  '_value',
  '_checked',
  '_pattern',
  '_phrase',
  '_format',
  '_model',
  '_disabled',
  '_autocapitalize',
  '_autocomplete',
  '_autocorrect',
  '_spellcheck',
  '_xAutocompletetype',
  '_legend',
  '_css'
];


exports.typeOf = (item) => ({}).toString.call(item).slice(8, -1).toLowerCase();

const getMetaProps = exports.getMetaProps = (obj) => Object.keys(obj).filter(prop => META_PROPS.includes(prop));

exports.isFieldset = (schema, prop) => !getMetaProps(schema[prop]).length || prop === 'fieldset';

// exports.toCurrency = val => val.toLocaleString('en', { style: 'currency', currency: 'USD' });

exports.toCurrency = val => val.toLocaleString('en', {
  style: 'currency',
  maximumFractionDigits : 2,
  minimumFractionDigits : 2,
  currency: 'USD'
});



exports.humanize = humanize;
exports.camelcase = camelcase;


// const getNonMetaProps = (obj) => Object.keys(obj).filter(prop => !META_PROPS.includes(prop));




function dotify(obj) {
  var res = {};
  function recurse(obj, current) {
    for (var key in obj) {
      var value = obj[key];
      var newKey = (current ? current + '.' + key : key);  // joined key with dot
      if (value && typeof value === 'object') {
        recurse(value, newKey);  // it's a nested object, so do it again
      } else {
        res[newKey] = value;  // it's not an object, so set the property
      }
    }
  }

  recurse(obj);
  return res;
}

exports.dotify = dotify;
