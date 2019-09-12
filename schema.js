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
  '*': '_required',
  '@': '_model',
  ':': '_type',
  '!': '_pattern'
  // ':': '_input',
  // '/': '_disabled'
  // '?': '_help'
  // '()': '_placeholder'
  // '_': '_placeholder'
};


const baseField = (prop) => ({
    _label: prop,
    _prop: camelCase(prop),
    _placeholder: false,
    _help: false,
    _multiple: false,
    _required: false,
    _pattern: null,
    _model: false,
    _disabled: false,
    _autocapitalize: false,
    _autocomplete: false,
    _autocorrect: false,
    _spellcheck: false,
    _xAutocompletetype: false,
    _value: undefined,
    _class: ''
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
        _required: true
      };
    } else if (paramType === '@') {
      return {
        _input: 'select',
        _type: 'relationship',
        _model: param
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

  const field = (prop, value) => {
    if (type === 'string') {
      return expandShorthand(value);

    } else if (type === 'array') {
      const field = toField(prop, value[0]);
      field._multiple = true;
      return field;

    } else if (type === 'object') {
      // if ((getMetaProps(value).length && !getNonMetaProps(value).length) || (!getMetaProps(value).length && getNonMetaProps(value).length) || prop === 'fieldset') {
      console.log({ prop });

      // if (!getMetaProps(value).length) {
      if (!getMetaProps(value).length || prop === '_fieldset') {
        value._type = 'fieldset';
      }

      if (value._type === 'fieldset') {
        value._children = toFields(value);
        value._children.forEach(child => delete value[child._label]);
      }

      return value;
    }
  }

  return {
    ...baseField(prop),
    ...field(prop, value)
  };
}


const toFields = (schema) => {
  const fields = getNonMetaProps(schema).map((prop) => toField(prop, schema[prop]));
  return addParamNames(fields);
}







const getParamName = (field, parent) => {
  // console.log({ parent });
  // console.log('\n\n');
  // console.log({ _prop: field._prop });
  // console.log({ _multiple: field._multiple });

  return field._multiple
    ? `${field._prop}[]`
    : parent && parent._children && parent._prop !== '_fieldset'
      ? `[${field._prop}]`
      : field._prop === '_fieldset'
        ? ''
        : field._prop;
}




const addParamNames = (fields) => {
  const populate = (arr, parent = null, paramLayer = '') => {
    return arr.map(field => {
      if (field._children) {
        // console.log('i have children');
        // console.log({ paramLayer });
        field._children = populate(field._children, field, paramLayer + getParamName(field, parent));
      } else {
        field._name = paramLayer + getParamName(field, parent);
      }
      return field;
    });
  }

  return populate(fields);
}




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





const toBase = (type, fields) => {
  const base = {
    _type: type
  };

  const walk = (arr, obj) => {
    return arr.forEach(field => {
      if (field._children) {
        obj[field._prop] = {};
        const layer = obj[field._prop];
        field._children = walk(field._children, layer);
      } else {
        obj[field._prop] = field._pattern;
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
