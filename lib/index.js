const { typeOf, isValue, isFieldset, hasChildren, uid } = require('./utils');
const defs = require('./defs');
const { hydrate } = require('./hydration');
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


const mapOptions = (type, key, options, name) => options.map((option, o) => {
    const obj = merge(defs.baseField(key), extendInput(type));
    obj._label = option.label;
    obj._attributes.tabindex = '0';
    obj._attributes.id = `${key}-${uid()}`;
    obj._attributes.value = option.value;
    if (option.default) {
      obj._attributes.selected = true;
      obj._attributes.checked = true;
    }
    obj._attributes.name = name;
    return obj;
  });


const toField = (schema, key, name) => {
  const schemaValue = schema[key];

  let field = {
    _attributes: { name }
  };

  if (typeOf(schemaValue) === 'string') {
    field = merge(field, expandFields(expandShorthand(schemaValue), name));
  }

  if (typeOf(schemaValue) === 'array') {
    field._input = 'set';
    field = merge(defs.baseField(key), field);
    field._template = expandFields(schemaValue[0], `${name}.$index`);
    field._items = [];
    return field;
  }

  if (typeOf(schemaValue) === 'object') {
    if (isFieldset(schema, key)) {
      field._input = 'fieldset';
    }

    const defKey = schemaValue._input || field._input;
    const def = extendInput(defKey);
    if (def._input && schemaValue._input !== def._input) {
      // always use definition input type
      // to enable extending of base definitions
      delete schemaValue._input;
    }
    field = merge(def, field, expandFields(schemaValue, name));
  }

  if (field._options) {
    field._options = mapOptions(field._type, key, field._options, name);
  }

  if (field._attributes.name.match(/\.\$index\./)) {
    field._attributes['data-template-name'] = field._attributes.name;
  }

  return merge(defs.baseField(key), field);
}

const formatErrors = (errors) => {
  return errors.reduce((obj, error) => {
    const errorField = error.extensions && error.extensions.dotPath
      ? error.extensions.dotPath
          .replace(/.*\.input(\.|$)/, '')
          .replace(/\[(\d+)\]/, (_, i) => `.${i}`)
      : '';

    const arrayField = errorField.replace(/\.\d+\..+/, '');
    if (arrayField !== errorField) {
      if (dotProp.get(obj, arrayField) === undefined) {
        dotProp.set(obj, arrayField, []);
      }
    }

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
      .filter(([key, field]) => !key.startsWith('_') && field._attributes.checked !== false && isValue(field._attributes.value))
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
    hydrate(fields, doc, formatErrors(errors));
  }

  return fields;
}


exports.hydrateValues = (fields, doc) => {
  hydrate(fields, doc);
  return fields;
}


exports.toSentence = (fields) => {
  return toHydratedFields(fields).map(field => field.valuePhrased).join(' ');
}
