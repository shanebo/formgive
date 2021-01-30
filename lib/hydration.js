const { dotify } = require('./utils');
const klona = require('klona');
const dotProp = require('dot-prop');


const hydrateOption = (options, values) => {
  options.forEach((option) => {
    if (!('_attributes' in option)) return;
    const isMatch = typeof option._attributes.value === 'string'
      ? values.map(val => val.toLowerCase()).includes(option._attributes.value.toLowerCase())
      : values.includes(option._attributes.value);
    option._attributes.selected = isMatch;
    option._attributes.checked = isMatch;
  });
}

const hydrateOptions = (fields, key, value) => {
  const field = dotProp.get(fields, key);
  const options = dotProp.get(fields, `${key}._options`);

  if (field._multiple && Array.isArray(value)) {
    hydrateOption(options, value);
  } else if (typeof value === 'object') {
    hydrateOption(options, [value.value]);
  } else {
    hydrateOption(options, [value]);
  }
}

const hydrateArray = (fields, dotPath, value, error = []) => {
  const template = dotProp.get(fields, `${dotPath}._template`);
  const items = value
    .map((item, i) => {
      const field = klona(template);
      const fieldError = error[i] || {};
      return Object
        .keys(field)
        .filter(key => !key.includes('_'))
        .reduce((obj, key) => {
          dotProp.set(obj, `${key}._attributes.value`, item[key]);
          if (fieldError[key]) {
            dotProp.set(obj, `${key}._error`, fieldError[key]);
          }
          obj[key]._attributes.name = obj[key]._attributes.name.replace(/\.\$index\./, `.${i}.`);
          return obj;
        }, field);
  });


  return items;
}

const hydrate = (fields, doc, errors = null) => {
  const dottedFields = dotify(fields);
  const type = '_attributes.value';

  // Add errors on base of field
  if (errors) {
    const root = errors[''];
    if (root) {
      fields['_error'] = root;
    }
  }

  Object
    .keys(dottedFields)
    .filter(key => key.includes('_attributes.name'))
    .forEach((foo) => {
      const key = dottedFields[foo];
      const isArray = dottedFields[foo].match(/\.\$index\./);
      const dotPath = key.replace(/\.\$index\..*$/, '');
      let value = dotProp.get(doc, dotPath);

      if (!value && /Id(\.|$)/.test(key)) {
        const associationDotPath = dotPath.replace(/Id(\.|$)/, '');
        value = dotProp.get(doc, associationDotPath);
      }

      const error = dotProp.get(errors, dotPath);

      if (error && !isArray) {
        dotProp.set(fields, `${dotPath}._error`, error);
      }

      if (!value) return;

      if (isArray) {
        dotProp.set(fields, `${dotPath}._items`, hydrateArray(fields, dotPath, value, error));
      } else {
        const isOptions = dotProp.has(fields, `${key}._options`);
        const isCheckbox = dotProp.get(fields, `${key}._input`) === 'checkbox';

        if (isOptions) {
          hydrateOptions(fields, key, value);
        }

        if (isCheckbox) {
          const shouldBeChecked = dotProp.get(fields, `${key}.${type}`) === value;
          if (shouldBeChecked) {
            dotProp.set(fields, `${key}._attributes.checked`, true);
          }
        }

        dotProp.set(fields, `${dotPath}.${type}`, value);
      }
    });
}

exports.hydrate = hydrate;
