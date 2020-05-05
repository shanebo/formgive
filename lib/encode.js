const { typeOf, humanize } = require('./utils');
const INPUT_TABLE = require('./inputs');

const SHORTHAND_FLAGS = {
  '*': { _required: true },
  '!': { _disabled: true },
  '@': (model) => ({
    _type: 'association',
    _model: model
  })
  // ':': 'type',
  // ':': '_input',
  // '?': '_help'
  // '()': '_placeholder'
  // '_': '_placeholder'
};

const expandShorthand = (str) => {
  const field = {};
  const input = str.replace(/\*|!|([@:][a-zA-Z]*)/g, (match) => {
    const matchSetting = SHORTHAND_FLAGS[match];
    Object.assign(field, matchSetting);
    if (!matchSetting) {
      Object.assign(field, SHORTHAND_FLAGS[match.charAt(0)](match.substr(1)));
    }
    return '';
  });

  return Object.assign(field, INPUT_TABLE[input]);
}

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

const getNonMetaProps = (obj) => Object.keys(obj).filter(prop => !META_PROPS.includes(prop));
const getMetaProps = (obj) => Object.keys(obj).filter(prop => META_PROPS.includes(prop));

const baseField = (prop) => ({
  _label: humanize(prop),
  _prop: prop,
  _placeholder: false,
  _help: false,
  _multiple: false,
  _required: false,
  _prefix: null,
  _pattern: null,
  _model: false,
  _disabled: false,
  _format: undefined,
  _phrase: undefined,
  _value: undefined,
  _css: ''
});

const createField = (prop, setting) => {
  const type = typeOf(setting);

  if (type === 'string') {
    return expandShorthand(setting);

  } else if (type === 'array') {
    const field = toField(prop, setting[0]);
    field._multiple = true;
    return field;

  } else if (type === 'object') {
    if (!getMetaProps(setting).length || prop === 'fieldset') {
      setting._input = 'fieldset';
    }

    if (setting._input === 'fieldset') {
      setting._children = toNonMetaFields(setting);
      setting._children.forEach(child => delete setting[child._prop]);
    }

    if (INPUT_TABLE[setting._input]) {
      return Object.assign({}, INPUT_TABLE[setting._input], setting);
    }

    return setting;
  }
}

const toField = (prop, setting) => ({
  ...baseField(prop),
  ...createField(prop, setting)
});


const toNonMetaFields = (schema) => getNonMetaProps(schema)
  .map((prop) => toField(prop, schema[prop]));

exports.toNonMetaFields = toNonMetaFields;
