const klona = require('klona');
const dotProp = require('dot-prop');
const { typeOf, humanize, isFieldset, dotify } = require('./utils');
const INPUT_TABLE = require('./inputs');


const SHORTHAND_FLAGS = {
  '*': { _required: true },
  '!': { _disabled: true },
  '@': (_model) => ({
    _type: 'association',
    _model
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

  return {
    ...field,
    ...INPUT_TABLE[input]
  };
}

// #flags are true false
// true flag = attribute name but with no value
// false flag = no attribute in DOM at all
// # attributes
// string = string is the value of attribute
const baseField = (_prop) => ({
  _label: humanize(_prop),
  _prop,
  _placeholder: false,
  _required: false,
  _disabled: false,
  _help: null,
  _prefix: null,
  _pattern: null,
  _format: null,
  _phrase: null,
  _model: null,
  _value: undefined,
  _multiple: null,
  _css: ''
});


const expandFields = (schema, parentProp) => Object
  .keys(schema)
  .reduce((obj, prop) => {
    obj[prop] = !prop.startsWith('_')
      ? toField(schema, prop, parentProp ? `${parentProp}.${prop}` : prop)
      : schema[prop];
    return obj;
  }, {});


const toField = (schema, prop, _name) => {
  let field = {
    _name
  };

  if (typeOf(schema[prop]) === 'string') {
    field = {
      ...field,
      ...expandFields(expandShorthand(schema[prop]), field._name)
    };
  }

  if (typeOf(schema[prop]) === 'array') {
    return schema[prop].map((childSchema, index) => expandFields(childSchema, `${field._name}.${index}`));
  }

  if (typeOf(schema[prop]) === 'object') {
    if (isFieldset(schema, prop)) {
      field._input = 'fieldset';
    }

    const defaultInput = INPUT_TABLE[schema[prop]._input || field._input];

    field = {
      ...defaultInput && defaultInput,
      ...field,
      ...expandFields(schema[prop], field._name)
    };
  }

  return {
    ...baseField(prop),
    ...field
  };
}

const duplicateExistingArrayItem = (fields, key, index) => {
  const firstKey = key.replace(/\.\d+\./, '.0.');
  const dupe = klona(dotProp.get(fields, firstKey));
  dupe._name = dupe._name.replace(/\.\d+\./, `.${index}.`);
  dotProp.set(fields, key, dupe);
}

const hydrate = (fields, doc, type) => {
  Object.entries(dotify(doc)).forEach(([key, value]) => {
    const isArray = matches = key.match(/\.(\d+)\./);
    if (isArray && !dotProp.has(fields, key)) {
      duplicateExistingArrayItem(fields, key, isArray[1]);
    }

    if (type === 'value' && dotProp.has(fields, `${key}._options`)) {
      const options = dotProp.get(fields, `${key}._options`);
      const option = options.find(option => option.value === value);
      if (option) option.selected = true;
    } else {
      dotProp.set(fields, `${key}._${type}`, value);
    }
  });
}

const formatErrors = (errors) => {
  return errors.reduce((obj, error) => {
    const errorField = error.extensions.dotPath.replace(/.*\.input\./, '').replace(/\[(\d+)\]/, (_, i) => `.${i}`);
    return dotProp.set(obj, errorField, error.message);
  }, {});
}


exports.toFields = (schema, doc, errors = []) => {
  const fields = expandFields(schema);
  
  if (doc) hydrate(fields, doc, 'value');

  if (errors) {
    hydrate(fields, formatErrors(errors), 'error');
  }

  // if (errors) hydrate(fields, errors, 'error');
//   // errors = errors.reduce((obj, error) => {
//   //   const errorField = error.extensions.dotPath.replace(/.*\.input\./, '');
//   //   return dotProp.set(obj, errorField, error.message);
//   // }, {});

  return fields;
}


exports.input = (name, data) => {
  const schema = klona(INPUT_TABLE[name]);
  if (data) {
    schema._options = data;
  }
  return schema;
}


const isValue = (val) => ![undefined, null, ''].includes(val);


const toSentence = exports.toSentence = (fields) => {
  return Object.entries(fields)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, field]) => {
      const { _value, _phrase, _format } = field;

      if (Object.keys(field).filter(prop => !prop.startsWith('_')).length) {
        return toSentence(field);
      }

      if (isValue(_value)) {
        if (_phrase) {
          if (_format) {
            return _phrase(_format(_value, field), field);
          } else {
            return _phrase(_value, field);
          }
        } else if (_format) {
          return _format(_value, field);
        } else {
          return _value;
        }
      } else {
        return _value;
      }
    })
    .filter(fragment => fragment)
    .join(' ');
}









// email: {
//   _label: 'Email',
//   _prop: 'email',
//   _placeholder: false,
//   _required: false,
//   _disabled: false,
//   _help: null,
//   _prefix: null,
//   _pattern: null,
//   _format: null,
//   _phrase: null,
//   _model: null,
//   _value: 'jack@nacho.com',
//   _multiple: null,
//   _css: '',
//   _input: 'email',
//   _type: 'email',
//   _autocapitalize: 'off',
//   _autocomplete: 'email',
//   _autocorrect: 'off',
//   _spellcheck: 'off',
//   _xAutocompletetype: 'email'
// }




// email: {
//   _input: 'email',
//   _label: 'Email',
//   _prop: 'email',
//   _help: null,
//   _prefix: null,
//   _format: null,
//   _phrase: null,
//   _model: null,
//   _multiple: null,
//   _css: '',
//   _attributes: {
//     placeholder: false,
//     required: false,
//     disabled: false,
//     pattern: null,
//     value: 'jack@nacho.com',
//     type: 'email',
//     autocapitalize: 'off',
//     autocomplete: 'email',
//     autocorrect: 'off',
//     spellcheck: 'off',
//     xAutocompletetype: 'email'
//   }
// }
