const klona = require('klona');
const dotProp = require('dot-prop');
const { typeOf, humanize } = require('./utils');
const INPUT_TABLE = require('./inputs');


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


const getNonMetaProps = (obj) => Object.keys(obj).filter(prop => !META_PROPS.includes(prop));
const getMetaProps = (obj) => Object.keys(obj).filter(prop => META_PROPS.includes(prop));




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




// const toFields = (schema, doc, errors = []) => {
//   const fields = toNonMetaFields(klona(schema));

//   return fields;

//   // errors = errors.reduce((obj, error) => {
//   //   const errorField = error.extensions.dotPath.replace(/.*\.input\./, '');
//   //   return dotProp.set(obj, errorField, error.message);
//   // }, {});

//   // if (doc) {
//   //   const hydratedFields = cleanedFields.map(field => hydrateField(field, doc, errors));
//   //   return addParamNames(hydratedFields);
//   // }
//   // // const hydratedFields = cleanedFields.map(field => hydrateField(field, doc));
//   // return addParamNames(cleanedFields);
// }














/*
call toFields(schema)
iterate over top level props
for each nonsetting prop expand into field
if value of prop is object call this fn again
*/


const isFieldset = (schema, prop) => !getMetaProps(schema[prop]).length || prop === 'fieldset';


const toField = (schema, prop) => {
  let field = {};

  if (typeOf(schema[prop]) === 'string') {
    field = expandNonMetaFields(expandShorthand(schema[prop]));

  } else if (typeOf(schema[prop]) === 'object') {
    if (isFieldset(schema, prop)) {
      field._input = 'fieldset';
    }

    field = {
      ...field,
      ...expandNonMetaFields(schema[prop])
    };
  }

  return {
    ...baseField(prop),
    ...field
  };
}


const expandNonMetaFields = (schema) => {
  const obj = {};
  Object.keys(schema).forEach(prop => {
    obj[prop] = !prop.startsWith('_')
      ? toField(schema, prop)
      : schema[prop];
  });
  return obj;
}


// const expandNonMetaFields = (schema) => {
//   const obj = {};

//   Object.keys(schema).forEach(prop => {
//     if (!prop.startsWith('_')) {
//       if (typeOf(schema[prop]) === 'string') {
//         obj[prop] = expandNonMetaFields(expandShorthand(schema[prop]));

//       } else if (typeOf(schema[prop]) === 'object') {

//         if (isFieldset(schema, prop)) {
//           obj[prop] = {
//             _input: 'fieldset'
//           };
//         }

//         obj[prop] = {
//           ...obj[prop] || {},
//           ...expandNonMetaFields(schema[prop])
//         };
//       }

//       if (typeOf(schema[prop]) !== 'array') {
//         obj[prop] = {
//           ...baseField(prop),
//           ...obj[prop]
//         };
//       }
//     } else {
//       obj[prop] = schema[prop];
//     }
//   });

//   return obj;
// }


// const expandNonMetaFields = (schema, obj) => {
//   Object.keys(schema).forEach(prop => {
//     console.log({prop});

//     if (!prop.startsWith('_')) {
//       if (typeOf(schema[prop]) === 'string') {
//         obj[prop] = expandNonMetaFields(expandShorthand(schema[prop]), {});
//       }

//       if (typeOf(schema[prop]) === 'object') {
//         if (!obj[prop]) {
//           obj[prop] = {};
//         }

//         if (!getMetaProps(schema[prop]).length || prop === 'fieldset') {
//           obj[prop]._input = 'fieldset';
//         }
//         obj[prop] = expandNonMetaFields(schema[prop], obj[prop]);
//       }

//       if (typeOf(schema[prop]) !== 'array') {
//         obj[prop] = {
//           ...baseField(prop),
//           ...obj[prop]
//         };
//       }
//     } else {
//       obj[prop] = schema[prop];
//     }
//   });

//   return obj;
// }


const toFields = exports.toFields = (schema, doc, errors = []) => {
  console.log(expandShorthand('text'));
  console.log(Object.keys(schema));
  console.log({schema});
  return expandNonMetaFields(schema, {});
}




exports.input = (name, data) => {
  const schema = klona(INPUT_TABLE[name]);

  if (data) {
    schema._options = data;
  }

  return schema;
}
