const klona = require('klona');
const { typeOf, humanize } = require('./utils');
const INPUT_TABLE = require('./inputs');

const META_PROPS = [
  '_label',
  '_prop',
  '_input',
  '_type',
  '_placeholder',
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

const isMetaProp = (prop) => META_PROPS.includes(prop);
const getMetaProps = (obj) => Object.keys(obj).filter(prop => META_PROPS.includes(prop));
const getNonMetaProps = (obj) => Object.keys(obj).filter(prop => !META_PROPS.includes(prop));
const SHORTHAND_FLAGS = {
  '*': { _required: true },
  '×': { _disabled: true },
  '@': (model) => ({
    _type: 'association',
    _model: model
  })
  // '*': 'required',
  // '@': 'model',
  // ':': 'type',
  // '!': 'pattern',
  // '×': 'disabled'
  // ':': '_input',
  // '/': '_disabled'
  // '?': '_help'
  // '()': '_placeholder'
  // '_': '_placeholder'
};


const baseField = (prop) => ({
    _label: humanize(prop),
    _prop: prop,
    _placeholder: false,
    _help: false,
    _multiple: false,
    _required: false,
    _pattern: null,
    _model: false,
    _disabled: false,
    _format: undefined,
    _phrase: undefined,
    _value: undefined,
    _css: ''
  });


// const expandShorthand = (str) => {
//   const regex = /(\*)?([^\:!*]+)(\*)?((?:\:|!)[^\:!*]+)?(\*)?((?:\:|!)[^\:!*]+)?(\*)?$/g;
//   const matches = regex.exec(str).filter(match => match);
//   matches.shift();

//   const field = matches.map(match => {
//     const paramType = match.charAt(0);
//     const param = match.replace(/[@!×\*]/gi, '');

//     console.log('\n\n');
//     console.log({match});
//     console.log({param});
//     console.log({paramType});


//     // const param = SHORTHAND_PARAMS.reduce((match, str) => match.replace(str, ''));

//     if (paramType === '*') {
//       return {
//         required: true
//       };
//     } else if (paramType === '×') {
//       return {
//         disabled: true
//       };
//     } else if (paramType === '@') {
//       return {
//         input: 'select',
//         type: 'relationship',
//         model: param
//       };
//     } else if (!SHORTHAND_PARAMS.includes(paramType)) {
//       return INPUT_TABLE[param];
//     }

//     return {
//       [SHORTHAND_FLAGS[paramType]]: param
//     };
//   });

//   return Object.assign({}, ...field);
// }








const expandShorthand = (str) => {
  const field = {};
  const input = str.replace(/\*|×|([@:][a-zA-Z]*)/g, (match) => {
    const matchSetting = SHORTHAND_FLAGS[match];
    Object.assign(field, matchSetting);
    if (!matchSetting) {

      console.log('match.substr(1)');
      console.log(match.substr(1));
      Object.assign(field, SHORTHAND_FLAGS[match.charAt(0)](match.substr(1)));
    }
    return '';
  });

  return Object.assign(field, INPUT_TABLE[input]);
}



// const expandShorthand = (str) => {
//   const fielder = {};
//   const input = str.replace(/\*|×|([@:][a-zA-Z]*)/g, (flag, prop) => {
//     if (prop) {
//       const type = prop.charAt(0);
//       const val = prop.substr(1);
//       if (type === '@') {
//         Object.assign(fielder, {
//           _type: 'relationship',
//           _model: val
//         });
//       }
//     } else {
//       Object.assign(fielder, SHORTHAND_FLAGS[flag]);
//     }

//     console.log({ flag });
//     console.log({ prop });

//     return '';
//   });

//   if (input) {
//     Object.assign(fielder, INPUT_TABLE[input]);
//   }
//   // console.log({ fielder });
//   return fielder;
// }






// const expandShorthand = (str) => {
//   const regex = /(\*)?([^\:!*]+)(\*)?((?:\:|!)[^\:!*]+)?(\*)?((?:\:|!)[^\:!*]+)?(\*)?$/g;
//   const matches = regex.exec(str).filter(match => match);
//   matches.shift();

//   const field = matches.map(match => {
//     const paramType = match.charAt(0);
//     const param = match.replace(/[@!×\*]/gi, '');
//     return {
//       ...(paramType === '*' && {
//         required: true
//       }),
//       ...(paramType === '×' && {
//         disabled: true
//       }),
//       ...(paramType === '@' && {
//         input: 'select',
//         type: 'relationship',
//         model: param
//       }),
//       ...(!SHORTHAND_PARAMS.includes(paramType) &&
//         INPUT_TABLE[param]
//       )
//       };
//   });

//   return Object.assign({}, ...field);
// }






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
      setting._children = makeFieldsBaby(setting);
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


const makeFieldsBaby = (schema) => {
  return getNonMetaProps(schema).map((prop) => toField(prop, schema[prop]));
}


const hydrateField = (field, doc) => {
  const { prop, children, multiple } = field;
  const item = typeOf(doc) === 'object' ? doc[prop] : '';

  if (children && multiple) {
    const len = item.length;
    const values = [];
    for (let index = 0; index < len; index++) {
      const val = children.map(f => ({
          ...f,
          ...{
            value: item[index][f.prop] // hydrateField()?
          }
        }));
      values.push(val);
    }
    field.values = values;
  } else if (children && !multiple) {
    // object
    field.children = children.map(field => hydrateField(field, item));
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
  }
  return field;
}


const toFields = (schema, doc) => {
  const fields = makeFieldsBaby(klona(schema));
  const cleanedFields = fields.map(removeMetaPropUnderscores);
  if (doc) {
    const hydratedFields = cleanedFields.map(field => hydrateField(field, doc));
    return addParamNames(hydratedFields);
  }
  // const hydratedFields = cleanedFields.map(field => hydrateField(field, doc));
  return addParamNames(cleanedFields);
}


// const toFields = (schema) => {
//   const fields = getNonMetaProps(schema).map((prop) => toField(prop, schema[prop]));
//   const cleanedFields = fields.map(removeMetaPropUnderscores);
//   return addParamNames(cleanedFields);
// }







const getParamName = (field, parent) => {
  // console.log({ parent });
  // console.log('\n\n');
  // console.log({ prop: field.prop });
  // console.log({ multiple: field.multiple });

  return field.multiple
    ? field.prop
    : parent && parent.children && parent.prop !== 'fieldset'
      ? `.${field.prop}`
      : field.prop === 'fieldset'
        ? ''
        : field.prop;
}

const getOldSchoolParamName = (field, parent) => {
  // console.log({ parent });
  // console.log('\n\n');
  // console.log({ prop: field.prop });
  // console.log({ multiple: field.multiple });

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
        // console.log('i have children');
        // console.log({ paramLayer });
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
      // console.log({ item });
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

      // console.log('IN multiple');
      // console.log('\n\n\n');
      // console.log('field.values');
      // console.log(field.values);

    } else {
      // string
      field.value = item;
    }

    return field;
  });
}




const toBase = (type, fields) => {
  const base = {
    type: type
  };

  const walk = (arr, obj) => {
    return arr.forEach(field => {
      if (field.children) {
        obj[field.prop] = {};
        const layer = obj[field.prop];
        field.children = walk(field.children, layer);
      } else {
        obj[field.prop] = field.pattern;
      }
    });
  }

  walk(fields, base);
  return base;
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



exports.toBase = toBase;
exports.toField = toField;
exports.toFields = toFields;
exports.toSentence = toSentence;
exports.mapFieldValues = mapFieldValues;
exports.expandShorthand = expandShorthand;
