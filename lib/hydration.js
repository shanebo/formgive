const { dotify } = require('./utils');
const klona = require('klona');
const dotProp = require('dot-prop');

const hydrateOptions = (fields, key, value) => {
  const options = dotProp.get(fields, `${key}._options`);
  const selectedOption = options.find(option => option._attributes.value === value);

  if (selectedOption) {
    if (selectedOption.hasOwnProperty('_attributes')) {
      selectedOption._attributes.selected = true;
      selectedOption._attributes.checked = true;
    }
  }
}

const hydrateArray = (fields, type, docKey, value) => {
  return value
    .map((item, index) => {
      const field = klona(dotProp.get(fields, `${docKey}.0`));
      return Object.keys(field).filter(key => !key.includes('_'))
        .reduce((obj, key) => {
          dotProp.set(obj, `${key}.${type}`, item[key]);
          obj[key]._attributes.name = obj[key]._attributes.name.replace(/\.\d+\./, `.${index}.`);
          return obj;
        }, field);
    });
}


const hydrate = (fields, doc, type) => {
  const dottedFields = dotify(fields);

  if (type === '_error') {
    const root = doc[''];
    if (root) {
      fields[type] = root;
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
        dotProp.set(fields, docKey, hydrateArray(fields, type, docKey, value));
      } else {
        if (type === '_attributes.value') {
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
        }

        dotProp.set(fields, `${docKey}.${type}`, value);
      }
    });
}

exports.hydrate = hydrate;
