const { typeOf, isValue, humanize, isFieldset, dotify } = require('./utils');
const klona = require('klona');
const dotProp = require('dot-prop');
const defs = require('./defs');


const expandShorthand = (str) => {
  const field = {};
  const input = str.replace(/\*|!|([@:][a-zA-Z]*)/g, (match) => {
    const matchSetting = defs.SHORTHAND_FLAGS[match];
    Object.assign(field, matchSetting);
    if (!matchSetting) {
      Object.assign(field, defs.SHORTHAND_FLAGS[match.charAt(0)](match.substr(1)));
    }
    return '';
  });

  return {
    ...field,
    ...defs[input]()
  };
}


// #flags are true false
// true flag = attribute name but with no value
// false flag = no attribute in DOM at all
// # attributes
// string = string is the value of attribute
const baseField = (_key) => ({
  _key,
  _label: humanize(_key),
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
  .reduce((obj, key) => {
    obj[key] = !key.startsWith('_')
      ? toField(schema, key, parentProp ? `${parentProp}.${key}` : key)
      : schema[key];
    return obj;
  }, {});


const toField = (schema, key, _name) => {
  let field = {
    _name
  };

  if (typeOf(schema[key]) === 'string') {
    field = {
      ...field,
      ...expandFields(expandShorthand(schema[key]), _name)
    };
  }

  if (typeOf(schema[key]) === 'array') {
    return schema[key].map((childSchema, index) => expandFields(childSchema, `${_name}.${index}`));
  }

  if (typeOf(schema[key]) === 'object') {
    if (isFieldset(schema, key)) {
      field._input = 'fieldset';
    }

    const defaultInput = defs[schema[key]._input || field._input];

    field = {
      ...defaultInput && defaultInput(),
      ...field,
      ...expandFields(schema[key], _name)
    };
  }

  return {
    ...baseField(key),
    ...field
  };
}


const copyMultipleField = (fields, key, index) => {
  const arrayKeyRegex = /\.\d+\./;
  const firstKey = key.replace(arrayKeyRegex, '.0.');
  const dupe = klona(dotProp.get(fields, firstKey));
  dupe._name = dupe._name.replace(arrayKeyRegex, `.${index}.`);
  dotProp.set(fields, key, dupe);
}


const hydrate = (fields, doc, type) => {
  Object.entries(dotify(doc)).forEach(([key, value]) => {
    const isArray = matches = key.match(/\.(\d+)\./);
    if (isArray && !dotProp.has(fields, key)) {
      copyMultipleField(fields, key, isArray[1]);
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
    const errorField = error.extensions.dotPath
      .replace(/.*\.input\./, '')
      .replace(/\[(\d+)\]/, (_, i) => `.${i}`);
    return dotProp.set(obj, errorField, error.message);
  }, {});
}


exports.toFields = (schema, doc, errors = []) => {
  const fields = expandFields(schema);

  if (doc) {
    hydrate(fields, doc, 'value');
  }

  if (errors) {
    hydrate(fields, formatErrors(errors), 'error');
  }

  return fields;
}


const toSentence = exports.toSentence = (fields) => {
  return Object.entries(fields)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, field]) => {
      const { _value, _phrase, _format } = field;

      if (Object.keys(field).filter(key => !key.startsWith('_')).length) {
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


exports.input = (name, data) => defs[name](data);




// email: {
//   _input: 'email',
//   _label: 'Email',
//   _key: 'email',
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
