const klona = require('klona');
const dotProp = require('dot-prop');
const { typeOf } = require('./utils');
const { toNonMetaFields } = require('./encode');

const removeMetaPropUnderscores = (field) => {
  const obj = {};
  Object.keys(field).forEach(originalKey => {
    const key = originalKey.startsWith('_')
      ? originalKey.substring(1)
      : originalKey;
    const setting = field[originalKey];
    obj[key] = Array.isArray(setting)
      ? setting.map(removeMetaPropUnderscores)
      : setting !== null && typeof setting === 'object'
        ? removeMetaPropUnderscores(setting)
        : setting;
  });
  return obj;
}


const hydrateField = (field, doc, errors) => {
  const { prop, children, multiple } = field;
  const item = typeOf(doc) === 'object' ? doc[prop] : '';
  const error = errors[prop] || {};

  if (children && multiple) {
    const len = item.length;
    const values = [];
    for (let index = 0; index < len; index++) {
      const val = children.map(f => {
        let props = {
            value: item[index][f.prop] // hydrateField()?
        };
        const errorProp = errors[`${prop}[${index}]`];
        if (errorProp) props.error = errorProp[f.prop];
        return {
          ...f,
          ...props
        };
      });
      values.push(val);
    }
    field.values = values;
  } else if (children && !multiple) {
    // object
    field.children = children.map(field => hydrateField(field, item, error));
  } else if (multiple) {
    // array
    field.values = item.map(value => ({
        ...field,
        ...{
          multiple: false,
          label: '',
          value
        }
      }));
  } else {
    // string
    field.value = item;
    if (error) field.error = error;
  }
  return field;
}



const toFields = (schema, doc, errors = []) => {
  const fields = toNonMetaFields(klona(schema));
  const cleanedFields = fields.map(removeMetaPropUnderscores);

  errors = errors.reduce((obj, error) => {
    const errorField = error.extensions.dotPath.replace(/.*\.input\./, '');
    return dotProp.set(obj, errorField, error.message);
  }, {});

  if (doc) {
    const hydratedFields = cleanedFields.map(field => hydrateField(field, doc, errors));
    return addParamNames(hydratedFields);
  }
  // const hydratedFields = cleanedFields.map(field => hydrateField(field, doc));
  return addParamNames(cleanedFields);
}

const getParamName = (field, parent) => {
  return field.multiple
    ? field.prop
    : parent && parent.children && parent.prop !== 'fieldset'
      ? `.${field.prop}`
      : field.prop === 'fieldset'
        ? ''
        : field.prop;
}

const getOldSchoolParamName = (field, parent) => {
  return field.multiple
    ? `${field.prop}[]`
    : parent && parent.children && parent.prop !== 'fieldset'
      ? `[${field.prop}]`
      : field.prop === 'fieldset'
        ? ''
        : field.prop;
}

const addParamNames = (fields) => {
  const populate = (arr, parent = null, paramLayer = '') => {
    return arr.map(field => {
      if (field.children) {
        field.children = populate(field.children, field, paramLayer + getParamName(field, parent));
      } else {
        field.name = paramLayer + getParamName(field, parent);
      }
      return field;
    });
  }

  return populate(fields);
}

const mapFieldValues = (fields, doc) => {
  return fields.map(field => {
    const { prop, children, multiple } = field;

    const item = typeOf(doc) === 'object' ? doc[prop] : '';

    if (children && multiple) {
      const len = item.length;
      const values = [];
      for (let index = 0; index < len; index++) {
        const val = children.map(f => {
          let obj = Object.assign({}, f);
          obj.value = item[index][obj.prop]; // mapFieldValues()
          return obj;
        });
        values.push(val);
      }
      field.values = values;

    } else if (children && !multiple) {
      // object
      field.children = mapFieldValues(children, item);

    } else if (multiple) {
      // array
      field.values = item.map(value => {
        let obj = Object.assign({}, field);
        obj.multiple = false;
        // obj.isChild = true;
        obj.label = '';
        obj.value = value;
        return obj;
      });
    } else {
      // string
      field.value = item;
    }

    return field;
  });
}

const isValue = (val) => ![undefined, null, ''].includes(val);

const toSentence = (fields) => {
  const sentence = fields.map(field => {
    const { value, phrase, format, children } = field;

    if (children) return toSentence(children);

    if (isValue(value)) {
      if (phrase) {
        if (format) {
          return phrase(format(value, field), field);
        } else {
          return phrase(value, field);
        }
      } else if (format) {
        return format(value, field);
      } else {
        return value;
      }
    } else {
      return value;
    }
  }).filter(phrase => phrase);

  return sentence.join(' ');
}

exports.toFields = toFields;
exports.toSentence = toSentence;
exports.mapFieldValues = mapFieldValues;
exports.mapFieldValues = mapFieldValues;
exports.toSentence = toSentence;

