const kindOf = require('kind-of');
const { humanize, makeId, defaultModify } = require('./utils');


class ValidationError extends Error {
  constructor(errors) {
    super(JSON.stringify(errors, null, 2));
    // super('Validation failed');
    this.errors = errors;
  }
}




function create({ type, props, arrayItemType }) {
  const config = {
    type,
    // required: false,
    // nullable: false,
    // fallback: undefined,
    props,
    // required: false,
    // nullable: false,
    // fallback: undefined
  };




  const defaultCoercions = {
    array: (v, type) => {
      if (['string', 'number', 'date'].includes(type)) {
        return [v];
      }

      return v;
    },
    string: (v, type) => {
      if (type === 'number' || type === 'boolean' || type === 'date') return String(v);
      if (type === 'array') return v.join(',');
      if (type === 'object' && v !== null) return JSON.stringify(v);
      return v;
    },
    number: (v, type) => {
      if (type === 'string') {
        if (v === '') {
          return undefined;
          // return config.nullable ? null : undefined;
        }

        const parsed = parseFloat(v);
        const result = isNaN(parsed) ? undefined : parsed;
        // const result = isNaN(parsed) ? (config.nullable ? null : undefined) : parsed;
        // console.log({ v, type, parsed, result });
        return result;
      }
      if (type === 'boolean') return v ? 1 : 0;
      if (type === 'date') return v.getTime();
      return v;
    },
    boolean: (v, type) => {
      if (type === 'string') return v ? true : false;
      // if (type === 'string') return v.toLowerCase() === 'true';
      if (type === 'number') return v !== 0;
      return Boolean(v);
    },
    date: (v, type) => {
      if (type === 'string' || type === 'number') {
        const parsed = new Date(v);
        return isNaN(parsed.getTime()) ? v : parsed;
      }
      return v;
    }
  };




  function required() {
    config.required = true;
    return this;
  }

  function nullable() {
    config.nullable = true;
    return this;
  }

  function disabled() {
    config.disabled = true;
    return this;
  }

  function fallback(val) {
    config.fallback = kindOf(val) === 'function'
      ? val()
      : val;
    return this;
  }

  function options(input) {
    // add support for a function being passed in that can do things like query the database for realtime options

    if (kindOf(input) === 'function') {
      config.lazyOptionsLoader = input;
      // setOptions(input());
    } else {
      const hasObjects = kindOf(input[0]) === 'object';

      config.options = hasObjects
        ? input
        : input.map((value) => ({ label: value, value }));

      config.optionValues = hasObjects
        ? input.map(({ value }) => value)
        : input;
    }

    // const hasObjects = kindOf(opts[0]) === 'object';

    // config.options = hasObjects
    //   ? opts
    //   : opts.map((value) => ({ label: value, value }));

    // config.optionValues = hasObjects
    //   ? opts.map(({ value }) => value)
    //   : opts;

    return this;
  }

  // function options(opts) {
  //   // add support for a function being passed in that can do things like query the database for realtime options

  //   const hasObjects = kindOf(opts[0]) === 'object';

  //   config.options = hasObjects
  //     ? opts
  //     : opts.map((value) => ({ label: value, value }));

  //   config.optionValues = hasObjects
  //     ? opts.map(({ value }) => value)
  //     : opts;

  //   return this;
  // }

  function positive() {
    config.positive = true;
    return this;
  }

  function negative() {
    config.negative = true;
    return this;
  }

  function integer() {
    config.integer = true;
    return this;
  }

  function float(minDecimals = 1, maxDecimals = 2) {
    config.float = true;
    config.floatMinDecimals = minDecimals;
    config.floatMaxDecimals = maxDecimals;
    return this;
  }

  function min(n) {
    config.min = n;
    return this;
  }

  function max(n) {
    config.max = n;
    return this;
  }

  function minLength(n) {
    config.minlength = n;
    return this;
  }

  function maxLength(n) {
    config.maxlength = n;
    return this;
  }

  function length(length) {
    config.length = length;
    return this;
  }

  function pattern(regex) {
    config.pattern = regex;
    return this;
  }

  function test(fn = () => { return true; }) {
    config.test = fn;
    return this;
  }

  function modifier(fn) {
    config.modify = fn || defaultModify;
    return this;
  }






  function coerceValue(value) {
    if (config.transform) {
      value = config.transform(value);
    }

    const inputType = kindOf(value);

    if (value === 'null' && config.nullable) {
      return null;
    }

    if (value === '' && !config.required && !config.nullable && config.fallback === undefined) {
      return undefined;
    }

    if (inputType === config.type || value === undefined || value === null) {
      return value;
    }

    const coercionFn = defaultCoercions[config.type];
    return coercionFn
      ? coercionFn(value, inputType)
      : value;
  }





  function data(input, opts = {}) {
    if (config.props) {
      const obj = Object
        .entries(config.props)
        .reduce((output, [key, prop]) => {
          const value = prop.data(prop.coerceValue(input?.[key], opts));

          if (value !== undefined) {
            output[key] = value;
          } else if (value === undefined) {
            // this removes undefined values
            delete output[key];
          }

          return output;
      }, opts.strict ? {} : { ...input });

      return Object.keys(obj).length
        ? obj
        : undefined;
    }

    const coercedInput = coerceValue(input);

    if (config.type === 'array' && arrayItemType && Array.isArray(coercedInput)) {
      return coercedInput.map(item => arrayItemType.data(arrayItemType.coerceValue(item), opts));
    }

    return coercedInput !== undefined
      ? coercedInput
      : config.fallback;
  }


  function modifiers(rawInput, key) {
    const input = data(rawInput);
    return [config.modify && config.modify(key, input)]
      .concat(Object.entries(config.props || {}).map(([key, prop]) => prop.modifiers(input?.[key], key)))
      .filter(Boolean)
      .join(' ');
  }


  function when(key, condition) {
    // somehow push this condition into an array of when conditions
    const { is, be, elseBe } = condition;
    config.triggerKey = key;
    config.condition = (val) => val === is ? be : elseBe;
    return this;
  }


  function field(opts = {}) {
    ['input', 'name', 'classes', 'step', 'min', 'max', 'prefix', 'placeholder', 'legend', 'autocapitalize', 'autocomplete', 'itemOptions', 'multiple', 'autofocus']
      .forEach((key) => {
        if (opts[key]) {
          config[key] = opts[key];
        }
      });

    config.fieldType = opts.type;
    // config.field = opts;
    return this;
  }


  function schema(input = {}, parentKey = '') {
    const result = { ...config };
    result.propType = result.type;


    if (config.type === 'array') {
      if (Array.isArray(input)) {
        const templateKey = parentKey ? `${parentKey}.INDEX` : `INDEX`;
        result.template = arrayItemType.schema(undefined, templateKey);
        result.items = input.map((item, i) => {
          const itemKey = parentKey ? `${parentKey}.${i}` : `${i}`;
          const itemSchema = arrayItemType.schema(item, itemKey);
          itemSchema.legend = null; // probably don't do this but make it possible in the field chain to allow sending locals to components
          return itemSchema;
        });
        result.value = input;
      } else {
        result.items = [];
        result.value = input;
      }

      return result;
    }


    if (config.props && Object.keys(config.props).length) {
      if (parentKey && result.input === undefined) {
        // this has props is a nested prop which should be a fieldset
        result.input = 'fieldset';
        result.legend = humanize(parentKey);
      }

      result.props = Object
        .entries(config.props)
        .reduce((props, [key, prop]) => {
          const value = prop.data(prop.coerceValue(input?.[key]));
          // const value = prop.data(input?.[key]);

          const name = parentKey ? `${parentKey}.${key}` : key;
          const id = makeId(name.replace(/\./g, '-'));

          if (prop.config.lazyOptionsLoader) {
            prop.options(prop.config.lazyOptionsLoader());
          }

          const obj = {
            propType: prop.config.type,
            key,
            id,
            name,
            label: humanize(key),
            ...prop.schema(value, key),
            modifier: prop.config.modify && prop.config.modify(key, value),
            value,
          };

          // if (prop.config.itemOptions) {
          //   console.log({ itemOptions: prop.config.itemOptions });
          //   obj.itemOptions = prop.config.itemOptions;
          // }

          if (obj.options) {
            const parentValue = value;
            obj.input = 'select';
            obj.options = obj.options
              .map(({ label, value }) => ({
                id: makeId(label),
                name,
                // type: prop?.config?.itemOptions?.type || 'chip', // add variant || 'chip' to this
                type: 'chip', // add variant || 'chip' to this
                label,
                content: label,
                value,
                ...(value === parentValue || (kindOf(parentValue) === 'array' && parentValue.includes(value))) && {
                  selected: true,
                  checked: true
                }
                // ...value === parentValue && {
                //   selected: true,
                //   checked: true
                // }
              }));
          } else {
            switch (obj.propType) {
              case 'array':
                // should be an input of collection
                break;
              case 'object':
                // should be an input of fieldset?
                break;
              case 'boolean':
                obj.input = 'choice';
                obj.type = obj.fieldType || 'switch';
                obj.checked = value === true;
                break;
              case 'number':
                obj.input = 'input';
                obj.type = obj.fieldType || 'number';
                break;
              // case 'string':
              //   break;
              default:
                obj.input = obj.input || 'input';
                obj.type = obj.fieldType || 'text';
                break;
            }
          }

          props[key] = obj;

          return props;
        }, {});
    }

    return result;
  }


  function validateValue(value) {
    const { type, nullable, required, pattern, test, positive, negative, integer, float, min, max, minlength, length, maxlength, floatMinDecimals, floatMaxDecimals, options, optionValues } = config;

    if (value === undefined) {
      return required ? 'is required' : null;
    }

    if (value === null && !nullable) {
      return 'cannot be null';
    }

    if (value === null && nullable) {
      return null;
    }

    if (value === '' && type !== 'string' && !nullable && !required) {
      return null;
    }

    const typeIsArray = kindOf(type) === 'array';
    const valueType = kindOf(value);

    if (type === 'array' && optionValues && optionValues.length && !value.every(item => optionValues.includes(item))) {

      if (valueType === 'array' && !value.every(item => optionValues.includes(item))) {
        console.log({ valueType, value, optionValues });
        return `should be one of ${optionValues.join(', ')} instead of ${value}`;
      }

      if (optionValues && !optionValues.includes(value)) {
        return `should be one of ${optionValues.join(', ')} instead of ${value}`;
      }
    }

    if (value !== null && ((typeIsArray && !type.includes(valueType)) || (!typeIsArray && valueType !== type))) {
      console.log({ insideofvalidate: 'insideofvalidate', type, value, valueType, config });
      return `should be a ${type}`;
    }

    // if (value !== null && kindOf(value) !== type) {
    //   return `should be a ${type}`;
    // }

    if (positive && value < 0) {
      return 'should be a positive number';
    }

    if (negative && value > 0) {
      return 'should be a negative number';
    }

    if (integer && !Number.isInteger(value)) {
      return 'should be an integer';
    }

    if (float) {
      if (!/^-?\d*\.\d+$/.test(value)) {
        return 'should be a float';
      } else if (!new RegExp(`^-?\\d+(\\.\\d{${floatMinDecimals},${floatMaxDecimals}})?$`).test(value)) {
        return `should have ${floatMinDecimals}-${floatMaxDecimals} decimal places`;
      }
    }

    if (min && value < min) {
      return `should be ${min} or more`;
    }

    if (max && value > max) {
      return `should be ${max} or less`;
    }

    if (length && value.length !== length) {
      return `should be a length of ${length}`;
    }

    if (minlength && value.length < minlength) {
      return `should be length of at least ${length}`;
    }

    if (maxlength && value.length > maxlength) {
      return `should be length no more than ${length}`;
    }

    // if (optionValues && !optionValues.includes(value)) {
    //   console.log({ optionValues, value });
    //   return `should be one of ${optionValues.join(', ')} instead of ${value}`;
    // }

    // if (options && !options.includes(value)) {
    //   return `should be one of ${options.join(', ')}`;
    // }

    if (pattern && !pattern.test(value)) {
      return 'does not match the pattern';
    }

    if (test && !test(value)) {
      return 'does not pass the custom validator';
    }

    return null;
  }


  function validate(input, key) {
    // console.log({ input, key, config });
    if (config.lazyOptionsLoader) {
      options(config.lazyOptionsLoader());
    }

    if (config.type === 'array' && Array.isArray(input)) {
      // console.log('validating array');
      // console.log({ key, config, input });
      const arrayErrors = input.map((item, index) => arrayItemType.validate(item, `${key}[${index}]`)).filter(Boolean);
      return arrayErrors.length
        ? arrayErrors
        : null;
    }

    if (!config.props) {
      return validateValue(input);
    }

    const errors = Object
      .entries(config.props)
      .map(([key, prop]) => [key, prop.validate(input?.[key], key)])
      .filter(([key, error]) => error)
      .reduce((acc, [key, error]) => ({ ...acc, [key]: error }), {});

    return Object.keys(errors).length
      ? errors
      : null;
  }


  function parse(input, opts = { strict: true }) {
    const result = data(input, opts);
    // const errors = process.env.NODE_ENV === 'development' ? false : validate(result, 'root');
    const errors = validate(result, 'root');

    if (errors) {
      throw new ValidationError(errors);
    }

    return result;
  }


  function safeParse(input) {
    const result = data(input);
    // const errors = process.env.NODE_ENV === 'development' ? false : validate(result, 'root');
    const errors = validate(result, 'root');

    return {
      data: result,
      errors
    };
  }


  function compose(name, keys) {
    if (!config.compositions) {
      config.compositions = {};
    }

    config.compositions[name] = keys;
    return this;
  }


  function composeInputs(input) {
    if (!config.compositions) {
      return {};
    }

    const result = data(input);
    // console.log({ compositions: config.compositions });

    return Object
      .entries(config.compositions)
      .reduce((obj, [name, keys]) => {
        obj[name] = keys.reduce((acc, key) => {
          // console.log({ key });
          if (kindOf(key) === 'object' && key !== null) {
            const [origKey, renamedKey] = Object.entries(key)[0];
            acc[renamedKey] = result[origKey];
          } else {
            acc[key] = result[key];
          }
          return acc;
        }, {});

        return obj;
      }, {});
  }


  function transform(fn) {
    config.transform = fn;
    return this;
  }


  return Object.freeze({
    config,
    required,
    nullable,
    disabled,
    fallback,
    positive,
    negative,
    integer,
    float,
    min,
    max,
    length,
    minLength,
    maxLength,
    pattern,
    test,
    options,
    field,
    modifier,
    compose,
    transform,
    when,
    schema,
    data,
    composeInputs,
    modifiers,
    coerceValue,
    parse,
    safeParse,
    validate
  });
}


const formgive = {
  string: () => create({ type: 'string' }),
  date: () => create({ type: 'date' }),
  number: () => create({ type: 'number' }),
  integer: () => create({ type: 'number' }).integer(),
  float: (minDecimals, maxDecimals) => create({ type: 'number' }).float(minDecimals, maxDecimals),
  object: (props) => create({ type: 'object', props }),
  array: (arrayItemType) => create({ type: 'array', arrayItemType }),
  boolean: () => create({ type: 'boolean' }),
  mixed: (types) => create({ type: types }),
  define: (name, fn) => formgive[name] = (...args) => fn.apply(this, args),
  when: (key, condition) => create('when').when(key, condition),
  gone: () => create('undefined'),
};


module.exports = formgive;





/*
// List of attributes common to all HTML <input> elements
id
type
name
value
form
autofocus
required
disabled
readonly
// global attributes that are common to all HTML elements
class
style
title
tabindex
dir
lang
*/


// text:
// - autocomplete
// - minLength
// - maxLength
// - pattern
// - placeholder
// - required
// - value
// - disabled
// - readonly
// - type
// - name
// - id
// - class
// - style


// number:
// - min
// - max
// - step
// - value
// - disabled
// - readonly
// - type
// - name
// - id
// - class
// - style

// password:
// - minLength
// - maxLength
// - pattern
// - placeholder
// - required
// - value
// - disabled
// - readonly
// - type
// - name
// - id
// - class
// - style







// button:
// color:
// reset:
// hidden:
// No unique attributes.


// checkbox:
// - checked


// email:
// - multiple
// - pattern
// - size

// file:
// - accept
// - multiple
// - capture

// image:
// - alt
// - formaction
// - formenctype
// - formmethod
// - formnovalidate
// - formtarget
// - height
// - width
// - src


// number:
// - max
// - min
// - step

// password:
// - pattern
// - size

// radio:
// - checked

// range:
// - max
// - min
// - step

// search:
// - pattern
// - size

// submit:
// - formaction
// - formenctype
// - formmethod
// - formnovalidate
// - formtarget

// tel:
// - pattern
// - size

// text:
// - pattern
// - size
// - maxlength
// - minlength

// url:
// - pattern
// - size

// date:
// - max
// - min
// - step

// datetime-local:
// - max
// - min
// - step

// month:
// - max
// - min
// - step

// time:
// - max
// - min
// - step

// week:
// - max
// - min
// - step








// html input types and their attributes
/*
const models = {
  "all":            ["name", "id", "value", "disabled", "readonly", "required", "form", "autofocus"],

  // choice
  "checkbox":       ["checked"],
  "radio":          ["checked"],

  // text
  "number":         ["min", "max", "step"],
  "password":       ["autocomplete", "minlength", "maxlength"],
  "email":          ["autocomplete", "minlength", "maxlength", "pattern"],
  "search":         ["autocomplete", "minlength", "maxlength", "pattern"],
  "tel":            ["autocomplete", "minlength", "maxlength", "pattern"],
  "text":           ["autocomplete", "minlength", "maxlength", "pattern", "size"],
  "url":            ["autocomplete", "minlength", "maxlength", "pattern"],

  // date
  "time":           ["min", "max", "step"],
  "date":           ["min", "max"],
  "datetime-local": ["min", "max"],
  // "month":          ["min", "max"],
  // "week":           ["min", "max"],

  // other
  "range":          ["min", "max", "step"],
  "file":           ["accept", "multiple", "capture"],
  "color":          [],
}
*/
