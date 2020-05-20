const { typeOf, isValue, humanize, isFieldset, dotify, hasChildren } = require('./utils');
const klona = require('klona');
const dotProp = require('dot-prop');
const defs = require('./defs');
const { merge } = require('merge-anything');


const expandShorthand = (str) => {
  let field = {};
  const input = str.replace(/\*|!|([@:][a-zA-Z]*)/g, (match) => {
    const matchSetting = defs.SHORTHAND_FLAGS[match];
    field = merge(field, matchSetting);
    // Object.assign(field, matchSetting);
    if (!matchSetting) {
      field = merge(field, defs.SHORTHAND_FLAGS[match.charAt(0)](match.substr(1)));
      // Object.assign(field, defs.SHORTHAND_FLAGS[match.charAt(0)](match.substr(1)));
    }
    return '';
  });

  return merge(field, defs[input]());
}


// #flags are true false
// true flag = attribute name but with no value
// false flag = no attribute in DOM at all
// # attributes
// string = string is the value of attribute
const baseField = (_key) => ({
  _key,
  _label: humanize(_key),
  _help: null,
  _prefix: null,
  _format: null,
  _phrase: null,
  _model: null,
  _multiple: null,
  _attributes: {
    id: _key,
    type: null,
    placeholder: false,
    required: false,
    disabled: false,
    pattern: null,
    value: undefined,
    class: '',
  }
});


const expandFields = (schema, parentProp) => Object
  .keys(schema)
  .reduce((obj, key) => {
    obj[key] = !key.startsWith('_')
      ? toField(schema, key, parentProp ? `${parentProp}.${key}` : key)
      : schema[key];
    return obj;
  }, {});


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

    const defaultInput = defs[schema[key]._input || field._input];

    field = merge(defaultInput ? defaultInput() : {}, field, expandFields(schema[key], name));
  }

  return merge(baseField(key), field);
}


const copyMultipleField = (fields, key, index) => {
  const arrayKeyRegex = /\.\d+\./;
  const firstKey = key.replace(arrayKeyRegex, '.0.');
  const dupe = klona(dotProp.get(fields, firstKey));
  dupe._attributes.name = dupe._attributes.name.replace(arrayKeyRegex, `.${index}.`);
  // dupe.name = dupe.name.replace(arrayKeyRegex, `.${index}.`);
  dotProp.set(fields, key, dupe);
}





// const hydrate = (fields, doc, type) => {
//   console.log('dotified', dotify(doc));

//   Object.entries(dotify(doc)).forEach(([key, value]) => {
//     console.log('\n\n\n');
//     console.log('key value in hydrate');
//     console.log({ key });
//     console.log({ value });

//     if (dotProp.has(fields, key)) {
//       console.log('IM IN FIELDS SO HYDRATE');

//       if (type === '_attributes.value' && dotProp.has(fields, `${key}._options`)) {
//         const options = dotProp.get(fields, `${key}._options`);
//         const option = options.find(option => option.value === value);
//         if (option) option.selected = true;
//       } else {
//         dotProp.set(fields, `${key}.${type}`, value);
//       }
//     } else {
//       // const isArray = matches = key.match(/\.(\d+)\./);
//       // if (isArray && !dotProp.has(fields, key)) {
//       //   copyMultipleField(fields, key, matches[1]);
//       // }
//     }
//   });
// }


const hydrate = (fields, doc, type) => {
  // console.log('\n\n\ndotify(doc)');
  // console.log(dotify(doc));

  // console.log('\n\n\ndotify(fields)');
  // console.log(dotify(fields));

  const dottedFields = dotify(fields);

  // console.log(dottedFields);

  const hydrateSelect = (key, value) => {
    const options = dotProp.get(fields, `${key}._options`);
    const option = options.find(option => option.value === value);
    if (option) {
      // dotProp.set(fields, `${key}.${type}`, value);
      option.selected = true;
    }
  }


  const keys = Object
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
          hydrateSelect(key, value);
        }

        dotProp.set(fields, `${docKey}.${type}`, value);
      }
    });

  // console.log(keys);

  // Object.entries(dotify(doc)).forEach(([key, value]) => {
  //   const isArray = key.match(/\.(\d+)\./);
  //   if (isArray && !dotProp.has(fields, key)) {
  //     copyMultipleField(fields, key, isArray[1]);
  //     keys.push(key);
  //   }

  //   if (type === '_attributes.value' && dotProp.has(fields, `${key}._options`)) {
  //     const options = dotProp.get(fields, `${key}._options`);
  //     const option = options.find(option => option.value === value);
  //     if (option) {
  //       dotProp.set(fields, `${key}.${type}`, value);
  //       option.selected = true;
  //     }
  //   } else {
  //     if (keys.includes(key)) {
  //       dotProp.set(fields, `${key}.${type}`, value);
  //     }
  //   }
  // });
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

  // const foo = dotify(fields);
  // console.log({ foo });
  // console.log('field names');

  // console.log(
  //   Object
  //     .keys(foo)
  //     .filter(key => key.includes('_attributes.name'))
  //     .reduce((obj, key) => {
  //       obj[key] = foo[key];
  //       return obj;
  //     }, {})
  // );
  // console.log(Object.keys(foo).filter(key => key.includes('_attributes.name')));

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


// const toSentence = exports.toSentence = (fields) => {
//   return Object.entries(fields)
//     .filter(([key]) => !key.startsWith('_'))
//     .map(([key, field]) => {
//       const { _value, _phrase, _format } = field;

//       if (Object.keys(field).filter(key => !key.startsWith('_')).length) {
//         return toSentence(field);
//       }

//       if (isValue(_value)) {
//         if (_phrase) {
//           if (_format) {
//             return _phrase(_format(_value, field), field);
//           } else {
//             return _phrase(_value, field);
//           }
//         } else if (_format) {
//           return _format(_value, field);
//         } else {
//           return _value;
//         }
//       } else {
//         return _value;
//       }
//     })
//     .filter(fragment => fragment)
//     .join(' ');
// }




const toSentence = exports.toSentence = (fields) => {
  return toHydratedFields(fields).map(field => field.value).join(' ');

  // return Object.entries(fields)
  //   .filter(([key]) => !key.startsWith('_'))
  //   .map(([key, field]) => {
  //     const { _value, _phrase, _format } = field;

  //     if (Object.keys(field).filter(key => !key.startsWith('_')).length) {
  //       return toSentence(field);
  //     }

  //     if (isValue(_value)) {
  //       if (_phrase) {
  //         if (_format) {
  //           return _phrase(_format(_value, field), field);
  //         } else {
  //           return _phrase(_value, field);
  //         }
  //       } else if (_format) {
  //         return _format(_value, field);
  //       } else {
  //         return _value;
  //       }
  //     } else {
  //       return _value;
  //     }
  //   })
  //   .filter(fragment => fragment)
  //   .join(' ');
}


// const pruneFields = (fields) => {
//   const pruned = [];

//   const checkEm = (fields) => {
//     Object.entries(fields)
//       .filter(([key]) => !key.startsWith('_'))
//       .forEach(([key, field]) => {
//         console.log(field._attributes);


//         if (Object.keys(field).filter(key => !key.startsWith('_')).length) {
//           console.log(Object.keys(field).filter(key => !key.startsWith('_')));
//           checkEm(field);
//         } else if (![undefined, null, ''].includes(field._attributes.value)) {
//           pruned.push(field);
//         }
//       });
//   }

//   checkEm(fields);
//   return pruned;
// }

const getValue = (field, value, _format, _phrase) => {
  if (_phrase) {
    if (_format) {
      return _phrase(_format(value, field), field);
    } else {
      return _phrase(value, field);
    }
  } else if (_format) {
    return _format(value, field);
  } else {
    return value;
  }
}


const toHydratedFields = exports.toHydratedFields = (fields) => {
  const filters = [];

  const prune = (fields) => {
    const matches = Object.entries(fields)
      .filter(([key]) => !key.startsWith('_'))
      .filter(([key, field]) => isValue(field._attributes.value))
      .forEach(([key, field]) => {
        // console.log({key});
        // console.log({field});

        const { _format, _phrase } = field;
        const { value } = field._attributes;

        if (hasChildren(field)) {
          if (_format || _phrase) {
            filters.push({
              key: field._label,
              value: getValue(field, value, _format, _phrase),
              name: field._attributes.name
            });
          } else {
            prune(field);
          }
        } else {
          filters.push({
            key: field._label,
            value: getValue(field, value, _format, _phrase),
            name: field._attributes.name
          });
          // filters.push(field);
          // filters.push(field);
        }


        // if (!(_format || _phrase)) {
        //   prune(field);
        // } else {
        //   filters.push(field);
        // }


      // if (isValue(value)) {
      //   if (_phrase) {
      //     if (_format) {
      //       return _phrase(_format(value, field), field);
      //     } else {
      //       return _phrase(value, field);
      //     }
      //   } else if (_format) {
      //     return _format(value, field);
      //   } else {
      //     return value;
      //   }
      // } else {
      //   return value;
      // }
    });
    // .filter(fragment => fragment)
    // .join(' ');
  }


  prune(fields);
  return filters;
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









// 1. schema
// 2. expand schema
// 3. expanded schema are fields
// 4. fields are used for forms, fitlers, and quicklinks
// 5. fields can have formatters and phrases
// 6. some field inputs should have format and phrase responsibilities at the input level even if they have children fields
// 7. fields should be hydrated with a doc and/or errors when applicable
// 8. ideally hydration would structure the format/phrase use case when fields have values or not accordingly




// [
//   {
//     _input: 'daterange',
//     _format: () => 'foo',
//     _phrase: () => 'foo',
//     key: 'select',
//     start: 'date',
//     end: 'date'
//   }
// ]


// [
//   {
//     _input: 'daterange',
//     _format: () => 'foo',
//     _phrase: () => 'foo',
//     _attributes: {
//       value: daterangeobj
//     }
//   }
// ]


// [
//   {
//     _input: 'key'
//   }

//   {
//     _input: 'start'
//   }

//   {
//     _input: 'start'
//   }
// ]
