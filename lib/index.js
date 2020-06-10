const { typeOf, isValue, isFieldset, dotify, hasChildren } = require('./utils');
const defs = require('./defs');
const klona = require('klona');
const dotProp = require('dot-prop');
const { merge } = require('merge-anything');


const expandShorthand = (str, options) => {
  let field = {};

  const input = str.replace(/\*|!|([@][a-zA-Z]*)/g, (match) => {
    const matchSetting = defs.SHORTHAND_FLAGS[match];
    field = merge(field, matchSetting);
    if (!matchSetting) {
      field = merge(field, defs.SHORTHAND_FLAGS[match.charAt(0)](match.substr(1)));
    }
    return '';
  });

  return merge(field, extendInput(input, {}, options));
}


const extendInput = (name, def = {}, options) => {
  const defFn = defs[name];

  if (defFn) {
    def = merge(defFn(options), def);
    if (def._input !== name) {
      def = merge(def, extendInput(def._input, def, options));
    }
  }

  return def;
}


const expandFields = (schema, parentProp) => Object
  .keys(schema)
  .reduce((obj, key) => {
    obj[key] = !key.startsWith('_')
      ? toField(schema, key, parentProp ? `${parentProp}.${key}` : key)
      : schema[key];
    return obj;
  }, {});


const mapOptions = (type, key, options) => options.map((option, o) => {
    const obj = merge(defs.baseField(key), extendInput(type));
    obj._label = option.label;
    obj._attributes.tabindex = '0';
    obj._attributes.id = `${key}-${o}`;
    obj._attributes.value = option.value;
    obj._attributes.name = key;
    return obj;
  });


const toField = (schema, key, name) => {
  let field = {
    _attributes: { name }
  };

  if (typeOf(schema[key]) === 'string') {
    field = merge(field, expandFields(expandShorthand(schema[key]), name));
  }

  if (typeOf(schema[key]) === 'array') {
    return schema[key].map((childSchema, index) => expandFields(childSchema, `${name}.${index}`));
  }

  if (typeOf(schema[key]) === 'object') {
    if (isFieldset(schema, key)) {
      field._input = 'fieldset';
    }

    const defKey = schema[key]._input || field._input;
    field = merge(extendInput(defKey), field, expandFields(schema[key], name));
  }

  if (field._options) {
    field._options = mapOptions(field._type, key, field._options);
  }

  return merge(defs.baseField(key), field);
}


const hydrate = (fields, doc, type) => {
  const dottedFields = dotify(fields);

  const hydrateOptions = (key, value) => {
    const options = dotProp.get(fields, `${key}._options`);
    const option = options.find(option => option._attributes.value === value);

    if (option) {
      if (option.hasOwnProperty('_attributes')) {
        option._attributes.selected = true;
        option._attributes.checked = true;
      }
    }
  }

  Object
    .keys(dottedFields)
    .filter(key => key.includes('_attributes.name'))
    .map(key => ({
      key: dottedFields[key],
      multiple: dottedFields[key].match(/\.(\d+)\./)
    }))
    .forEach(({key, multiple}) => {
      const docKey = key.replace(/\.\d+\..*$/, '');
      const value = dotProp.get(doc, docKey);
      if (!value) return;

      if (multiple) {
        const multipleFields = value
          .map((item, index) => {
            const field = klona(dotProp.get(fields, `${docKey}.0`));
            return Object.keys(field).filter(key => !key.includes('_'))
              .reduce((obj, key) => {
                dotProp.set(obj, `${key}.${type}`, item[key]);
                obj[key]._attributes.name = obj[key]._attributes.name.replace(/\.\d+\./, `.${index}.`);
                return obj;
              }, field);
          });

        dotProp.set(fields, docKey, multipleFields);
      } else {
        if (type === '_attributes.value' && dotProp.has(fields, `${key}._options`)) {
          hydrateOptions(key, value);
        }

        dotProp.set(fields, `${docKey}.${type}`, value);
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


const toPhrase = (field) => {
  const { _phrase } = field;
  const value = toFormat(field);
  return _phrase
    ? _phrase(value, field)
    : value;
}


const toFormat = (field) => {
  const { _format, _attributes: { value } } = field;
  return _format
    ? _format(value, field)
    : value;
}


const createFilterData = (field) => {
  const { _label, _hidden } = field;
  const { value, name } = field._attributes;
  return {
    key: _label,
    hidden: _hidden,
    value,
    valueFormatted: toFormat(field),
    valuePhrased: toPhrase(field),
    name,
  }
}


const toHydratedFields = exports.toHydratedFields = (fields) => {
  const filters = [];

  const prune = (fields) => {
    Object.entries(fields)
      .filter(([key, field]) => !key.startsWith('_') && isValue(field._attributes.value))
      .forEach(([key, field]) => {
        const { _format, _phrase } = field;

        if (hasChildren(field)) {
          if (_format || _phrase) {
            filters.push(createFilterData(field));
          } else {
            prune(field);
          }
        } else {
          filters.push(createFilterData(field));
        }
      });
  }

  prune(fields);
  return filters;
}


exports.input = (name, options) => expandShorthand(name, options);


exports.toFields = (schema, doc, errors = []) => {
  const fields = expandFields(schema);

  if (doc) {
    hydrate(fields, doc, '_attributes.value');
  }

  if (errors.length) {
    hydrate(fields, formatErrors(errors), '_error');
  }

  return fields;
}


exports.hydrateValues = (fields, doc) => {
  hydrate(fields, doc, '_attributes.value');
  return fields;
}


exports.toSentence = (fields) => {
  return toHydratedFields(fields).map(field => field.valuePhrased).join(' ');
}
