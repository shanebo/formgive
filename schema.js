const { typeOf, camelCase } = require('./utils');
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
  '_pattern',
  '_model',
  '_disabled',
  '_autocapitalize',
  '_autocomplete',
  '_autocorrect',
  '_spellcheck',
  '_xAutocompletetype',
  '_class'
];

const getMetaProps = (obj) => Object.keys(obj).filter(prop => META_PROPS.includes(prop));
const getNonMetaProps = (obj) => Object.keys(obj).filter(prop => !META_PROPS.includes(prop));
const SHORTHAND_PARAMS = ['*', ':', '!'];
const PARAM_TABLE = {
  '*': 'required',
  '@': 'model',
  ':': 'type',
  '!': 'pattern'
  // ':': '_input',
  // '/': '_disabled'
  // '?': '_help'
  // '()': '_placeholder'
  // '_': '_placeholder'
};


const baseField = (prop) => ({
    label: prop,
    prop: camelCase(prop),
    placeholder: false,
    help: false,
    multiple: false,
    required: false,
    pattern: null,
    model: false,
    disabled: false,
    // autocapitalize: false,
    // autocomplete: false,
    // autocorrect: false,
    // spellcheck: false,
    // xAutocompletetype: false,
    value: undefined,
    class: ''
  });


const expandShorthand = (str) => {
  const regex = /(\*)?([^\:!*]+)(\*)?((?:\:|!)[^\:!*]+)?(\*)?((?:\:|!)[^\:!*]+)?(\*)?$/g;
  const matches = regex.exec(str).filter(match => match);
  matches.shift();

  const field = matches.map(match => {
    const paramType = match.charAt(0);
    const param = match.replace(/[@!\*]/gi, '');

    if (paramType === '*') {
      return {
        required: true
      };
    } else if (paramType === '@') {
      return {
        input: 'select',
        type: 'relationship',
        model: param
      };
    } else if (!SHORTHAND_PARAMS.includes(paramType)) {
      return INPUT_TABLE[param];
    }

    return {
      [PARAM_TABLE[paramType]]: param
    };
  });

  return Object.assign({}, ...field);
}


const toField = (prop, value) => {
  const type = typeOf(value);
  // if (prop.startsWith('_')) prop = prop.substring(1);

  const field = (prop, value) => {

    if (type === 'string') {
      return expandShorthand(value);

    } else if (type === 'array') {
      const field = toField(prop, value[0]);
      field._multiple = true;
      return field;

    } else if (type === 'object') {
      // if ((getMetaProps(value).length && !getNonMetaProps(value).length) || (!getMetaProps(value).length && getNonMetaProps(value).length) || prop === 'fieldset') {
      // console.log({ prop });

      // if (!getMetaProps(value).length) {
      if (!getMetaProps(value).length || prop === 'fieldset') {
        value._type = 'fieldset';
      }

      if (value._type === 'fieldset') {
        value._children = toFields(value);
        value._children.forEach(child => delete value[child.label]);
      }

      return value;
    }
  }

  return {
    ...baseField(prop),
    ...field(prop, value)
  };
}


const cleanupFunkNasty = (field) => {
  const obj = {};
  Object.keys(field).forEach(originalKey => {
    const key = originalKey.startsWith('_')
      ? originalKey.substring(1)
      : originalKey;
    const value = field[originalKey];
    obj[key] = Array.isArray(value)
      ? value.map(cleanupFunkNasty)
      : value !== null && typeof value === 'object'
        ? cleanupFunkNasty(value)
        : value;
  });
  return obj;
}


const toFields = (schema) => {
  const fields = getNonMetaProps(schema).map((prop) => toField(prop, schema[prop]));
  const cleanedFields = fields.map(cleanupFunkNasty);
  return addParamNames(cleanedFields);
}







const getParamName = (field, parent) => {
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



/*
const mapFieldValues = (fields, doc) => {
  return fields.map(field => {
    const { _name, _children, _multiple } = field;

    const item = typeOf(doc) === 'object' ? doc[_name] : '';

    if (_children && _multiple) {
      // console.log({ item });
      const len = item.length;
      const values = [];
      for (let index = 0; index < len; index++) {
        const val = _children.map(f => {
          let obj = Object.assign({}, f);
          obj._value = item[index][obj._name]; // mapFieldValues()
          return obj;
        });
        values.push(val);
      }
      field._values = values;

    } else if (_children && !_multiple) {
      // object
      field._children = mapFieldValues(_children, item);

    } else if (_multiple) {
      // array
      field._values = item.map(value => {
        let obj = Object.assign({}, field);
        obj._multiple = false;
        // obj._isChild = true;
        obj._label = '';
        obj._value = value;
        return obj;
      });

      // console.log('IN _multiple');
      // console.log('\n\n\n');
      // console.log('field._values');
      // console.log(field._values);

    } else {
      // string
      field._value = item;
    }

    return field;
  });
}
*/


exports.mapFieldValues = mapFieldValues = (fields, doc) => {
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



exports.toBase = toBase;
exports.toField = toField;
exports.toFields = toFields;
exports.mapFieldValues = mapFieldValues;
exports.expandShorthand = expandShorthand;
