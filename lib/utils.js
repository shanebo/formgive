const { camelcase, humanize } = require('underscore.string');

const META_PROPS = [
  '_label',
  '_key',
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

const getMetaProps = exports.getMetaProps = (obj) => Object
  .keys(obj)
  .filter(key => META_PROPS.includes(key));

// const getNonMetaProps = (obj) => Object.keys(obj).filter(key => !META_PROPS.includes(key));

exports.typeOf = (item) => ({}).toString.call(item).slice(8, -1).toLowerCase();

exports.isValue = (val) => ![undefined, null, ''].includes(val);

exports.isFieldset = (schema, key) => !getMetaProps(schema[key]).length || key === 'fieldset';

exports.toCurrency = val => val.toLocaleString('en', {
  style: 'currency',
  maximumFractionDigits : 2,
  minimumFractionDigits : 2,
  currency: 'USD'
});

exports.humanize = humanize;

exports.camelcase = camelcase;

exports.dotify = (data) => {
  const obj = {};

  function walk(data, layer) {
    for (let key in data) {
      const value = data[key];
      const newKey = layer ? `${layer}.${key}` : key;

      if (value && typeof value === 'object') {
        walk(value, newKey);
      } else {
        obj[newKey] = value;
      }
    }
  }

  walk(data);
  return obj;
}


exports.hasChildren = (field) => Object.keys(field).filter(key => !key.startsWith('_')).length;
