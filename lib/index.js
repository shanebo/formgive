import kindOf from 'kind-of';
import { capitalize, humanize, makeId, defaultModify, hasKeys } from './utils.js';


class ValidationError extends Error {
  constructor(errors) {
    super(JSON.stringify(errors, null, 2));
    // super('Validation failed');
    this.errors = errors;
  }
}


function buildUnknownInput(input, cfg) {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const known = new Set(Object.keys(cfg.props || {}));
  const out = {};

  for (const key of Object.keys(input)) {
    if (!known.has(key)) {
      out[key] = input[key];
    }
  }

  return out;
}


function rebindPartitionCompositions(schema) {
  const cfg = schema.config;

  if (!cfg.partitionInput) {
    return;
  }

  if (!cfg.compositions) {
    cfg.compositions = {};
  }

  cfg.compositions.knownInput = Object.keys(cfg.props || {});
  cfg.compositions.unknownInput = (input) => buildUnknownInput(input, cfg);
}


function hasPresentProp(input, key) {
  return Boolean(
    input
    && typeof input === 'object'
    && Object.prototype.hasOwnProperty.call(input, key)
    && input[key] !== undefined
  );
}


function normalizeOpts(opts = {}) {
  return {
    strict: true,
    partial: false,
    validate: true,
    ...opts
  };
}


const defaultCoercions = {
  array: (v, type) => {
    if (type === 'string' && v === '') return [];
    if (type === 'string' || type === 'number' || type === 'date') return [v];
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
      if (v === '') return undefined;
      const parsed = parseFloat(v);
      return isNaN(parsed) ? undefined : parsed;
    }
    if (type === 'boolean') return v ? 1 : 0;
    if (type === 'date') return v.getTime();
    return v;
  },
  boolean: (v, type) => {
    if (type === 'string') {
      const normalized = v.toLowerCase();
      if (normalized === 'true' || normalized === 'on') return true;
      if (normalized === 'false' || normalized === 'off') return false;
      return v ? true : false;
    }
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


function isGoneSchema(schema) {
  return schema?.config?.schemaType === 'gone';
}


const FIELD_BLOCKED_KEYS = new Set([
  'schemaType', 'props', 'options', 'optionValues', 'optionsSet', 'lazyOptionsLoader',
  'predicate', 'thenBranch', 'elseBranch', 'transform', 'compositions', 'partitionInput'
]);

const COPY_CONFIG_EXCLUDE = new Set(['props', 'schemaType']);


function create({ type, props, arrayItemType }) {
  const config = { schemaType: type, props };

  let schemaApi;




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

  function computed() {
    config.computed = true;
    return this;
  }

  function fallback(val) {
    config.fallback = kindOf(val) === 'function'
      ? val()
      : val;
    return this;
  }

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

  function options(input) {
    if (kindOf(input) === 'function') {
      config.lazyOptionsLoader = input;
    } else {
      const values = Array.isArray(input)
        ? input
        : [];
      const hasObjects = kindOf(values[0]) === 'object';

      config.options = hasObjects
        ? values
        : values.map((value) => ({ label: value, value }));

      config.optionValues = hasObjects
        ? values.map(({ value }) => value)
        : values;

      config.optionsSet = new Set(config.optionValues);
    }

    return this;
  }


  function createResolveContext(value, scope) {
    const { rootInput, parent } = scope;
    const inputType = kindOf(value);
    const coercedValue = value != null && inputType !== config.schemaType && defaultCoercions[config.schemaType]
      ? defaultCoercions[config.schemaType](value, inputType)
      : value;
    return { value: coercedValue, input: rootInput, data: rootInput, parent: parent ?? null };
  }


  function resolveBranch(branch, ctx) {
    const resolved = typeof branch === 'function'
      ? branch(ctx)
      : branch;

    if (resolved == null) {
      return create({ type: 'gone' });
    }

    if (!resolved?.config) {
      throw new Error('Conditional branches must return a formgive schema');
    }

    return resolved;
  }


  function resolve(value, scope) {
    const { predicate, thenBranch, elseBranch } = config;

    if (typeof predicate !== 'function') {
      return schemaApi;
    }

    const ctx = createResolveContext(value, scope);
    const branch = predicate(ctx) ? thenBranch : elseBranch;
    const resolved = resolveBranch(branch, ctx);

    return resolved === schemaApi
      ? schemaApi
      : resolved.resolve(value, scope);
  }


  function coerceValue(value, scope) {
    const resolved = resolve(value, scope);

    if (resolved !== schemaApi) {
      return resolved.coerceValue(value, scope);
    }

    const { schemaType, computed, transform, nullable, required, fallback } = config;

    if (schemaType === 'gone') {
      return undefined;
    }

    if (computed && kindOf(value) === 'function') {
      value = value();
    }

    if (transform) {
      value = transform(value);
    }

    const inputType = kindOf(value);

    if (value === 'null' && nullable) {
      return null;
    }

    if (value === '' && schemaType !== 'array' && !required && !nullable && fallback === undefined) {
      return undefined;
    }

    if (inputType === schemaType || value === undefined || value === null) {
      return value;
    }

    const coercionFn = defaultCoercions[schemaType];
    return coercionFn
      ? coercionFn(value, inputType)
      : value;
  }


  function allowsNull() {
    return Boolean(config.nullable);
  }


  function data(input, opts = {}, scope = null) {
    const activeScope = scope ?? { rootInput: input, parent: null };
    const resolved = resolve(input, activeScope);

    if (resolved !== schemaApi) {
      return resolved.data(input, opts, activeScope);
    }

    const { schemaType, props, fallback } = config;

    if (schemaType === 'gone') {
      return undefined;
    }

    if (input === null) {
      return null;
    }

    if (props) {
      const obj = opts.strict ? {} : { ...input };
      const childScope = { rootInput: activeScope.rootInput, parent: input };

      for (const [key, prop] of Object.entries(props)) {
        if (opts.partial && !hasPresentProp(input, key)) {
          continue;
        }

        const value = prop.data(input?.[key], opts, childScope);

        if (value !== undefined) {
          obj[key] = value;
        } else {
          delete obj[key];
        }
      }

      return hasKeys(obj)
        ? obj
        : undefined;
    }

    const coercedInput = coerceValue(input, activeScope);

    if (schemaType === 'array' && arrayItemType && Array.isArray(coercedInput)) {
      const itemScope = { rootInput: activeScope.rootInput, parent: null };
      return coercedInput
        .flatMap((item) => {
          const parsedItem = arrayItemType.data(item, opts, itemScope);
          return item === '' && parsedItem === undefined ? [] : [parsedItem];
        });
    }

    return coercedInput !== undefined
      ? coercedInput
      : fallback;
  }


  function modifiers(input, key, scope = null) {
    const activeScope = scope ?? { rootInput: input, parent: null };
    const resolved = resolve(input, activeScope);

    if (resolved !== schemaApi) {
      return resolved.modifiers(input, key, activeScope);
    }

    const { schemaType, modify, props } = config;

    if (schemaType === 'gone') {
      return '';
    }

    const childScope = { rootInput: activeScope.rootInput, parent: input };

    return [modify && modify(key, input)]
      .concat(Object.entries(props || {}).map(([childKey, prop]) => {
        const value = prop.data(input?.[childKey], {}, childScope);
        return prop.modifiers(value, childKey, childScope);
      }))
      .filter(Boolean)
      .join(' ');
  }


  function when(predicate) {
    if (typeof predicate !== 'function') {
      throw new Error('when() requires a predicate function');
    }

    config.predicate = predicate;
    return this;
  }


  function then(branch) {
    config.thenBranch = branch;
    return this;
  }


  function elseBranch(branch) {
    config.elseBranch = branch;
    return this;
  }


  function otherwise(branch) {
    return elseBranch.call(this, branch);
  }


  function conditional(predicate) {
    if (typeof predicate !== 'function') {
      throw new Error('conditional() requires a predicate function');
    }

    config.predicate = predicate;
    config.thenBranch = schemaApi;
    config.elseBranch = create({ type: 'gone' });
    return this;
  }


  function fields(input = {}) {
    return this.schema(input).props || {};
  }


  function loadLazyOptions() {
    if (!config.options && config.lazyOptionsLoader) {
      options(config.lazyOptionsLoader());
    }
  }


  function clearLazyOptions() {
    if (config.lazyOptionsLoader) {
      delete config.options;
      delete config.optionValues;
      delete config.optionsSet;
    }
  }


  function buildObjectField(prop, key, value, parentKey, scope) {
    const name = parentKey ? `${parentKey}.${key}` : key;
    const id = makeId(name.replace(/\./g, '-'));
    const resolvedProp = prop.resolve(value, scope);

    if (isGoneSchema(resolvedProp)) {
      return null;
    }

    const obj = {
      propType: resolvedProp.config.schemaType,
      key,
      id,
      name,
      label: capitalize(humanize(key)),
      ...resolvedProp.schema(value, key, scope),
      modifier: resolvedProp.config.modify && resolvedProp.config.modify(key, value),
      value,
    };

    enrichField(obj, name, value);
    return obj;
  }


  function field(opts = {}) {
    for (const [key, val] of Object.entries(opts)) {
      if (FIELD_BLOCKED_KEYS.has(key)) throw new Error(`field() cannot override internal schema key: "${key}"`);
      config[key] = val;
    }
    return this;
  }

  function sentence(opts = {}) {
    config.sentence = { ...(config.sentence || {}), ...opts };
    return this;
  }

  function defaultSentenceInclude(field) {
    if (field?.propType === 'boolean') return field.value === true;
    return field.value !== undefined;
  }

  function findSelectedOptionLabel(field) {
    const options = field?.options;
    if (!Array.isArray(options) || options.length === 0) return undefined;

    const selected = options.find(opt => opt?.selected === true || opt?.checked === true);
    if (selected?.label !== undefined) return selected.label;

    const match = options.find(opt => opt?.value === field.value);
    return match?.label;
  }

  const USD_CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  function defaultSentenceValueToText(value, field) {
    // Prefer option labels when present
    const optionLabel = findSelectedOptionLabel(field);
    if (optionLabel !== undefined) return String(optionLabel);

    if (value === null) return 'null';

    // Currency formatting (minimal v1 heuristic)
    if (field?.prefix === '$' && typeof value === 'number') {
      return USD_CURRENCY_FORMATTER.format(value);
    }

    return String(value);
  }

  function renderSentenceChunk(field, ctx) {
    // Only include fields that explicitly called .sentence()
    if (!field?.sentence) return '';

    const sentenceCfg = field.sentence;

    const shouldInclude = typeof sentenceCfg.when === 'function'
      ? sentenceCfg.when(field.value, field, ctx)
      : defaultSentenceInclude(field);

    if (!shouldInclude) return '';

    let raw = field.value;

    if (typeof sentenceCfg.format === 'function') {
      raw = sentenceCfg.format(raw, field, ctx);
    }

    let text = typeof sentenceCfg.value === 'function'
      ? sentenceCfg.value(raw, field, ctx)
      : (field?.propType === 'boolean'
        ? field.label
        : defaultSentenceValueToText(raw, field));

    text = text === undefined || text === null ? '' : String(text);

    if (typeof sentenceCfg.transform === 'function') {
      text = String(sentenceCfg.transform(text, raw, field, ctx));
    }

    if (typeof sentenceCfg.phrase === 'function') {
      return String(sentenceCfg.phrase(text, raw, field, ctx)).trim();
    }

    const prefix = typeof sentenceCfg.prefix === 'function'
      ? sentenceCfg.prefix(text, raw, field, ctx)
      : sentenceCfg.prefix;

    const suffix = typeof sentenceCfg.suffix === 'function'
      ? sentenceCfg.suffix(text, raw, field, ctx)
      : sentenceCfg.suffix;

    return [prefix, text, suffix]
      .filter(v => v !== undefined && v !== null && String(v).trim() !== '')
      .map(v => String(v).trim())
      .join(' ')
      .trim();
  }

  function toSentence(input = {}, opts = {}) {
    const schemaTree = this.schema(input);
    const ctx = { root: schemaTree, input, opts };

    const parts = [];

    function walk(node) {
      if (!node) return;

      // Arrays: walk items in order
      if (node.propType === 'array' && Array.isArray(node.items)) {
        node.items.forEach(item => walk(item));
        return;
      }

      // Objects / fieldsets: walk props in insertion order
      if (node.props && hasKeys(node.props)) {
        Object.values(node.props).forEach(child => walk(child));
        return;
      }

      // Leaf field
      const chunk = renderSentenceChunk(node, ctx);
      if (chunk) parts.push(chunk);
    }

    walk(schemaTree);

    return parts
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }


  function enrichField(obj, name, value) {
    if (obj.options) {
      obj.input = 'select';
      obj.options = obj.options.map((opt) => {
        const { label, value: optValue, ...rest } = opt;
        const matched = optValue === value
          || (kindOf(value) === 'array' && value.includes(optValue));

        return {
          ...rest,
          id: makeId(label),
          name,
          type: 'chip',
          label,
          content: label,
          value: optValue,
          ...(matched && {
            selected: true,
            checked: true
          })
        };
      });
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
          obj.type = obj.type || 'switch';
          if (value === true) obj.checked = true;
          break;
        case 'number':
          obj.input = 'input';
          obj.type = obj.type || 'number';
          break;
        default:
          obj.input = obj.input || 'input';
          obj.type = obj.type || 'text';
          break;
      }
    }
  }

  function schema(input = {}, parentKey = '', scope = null) {
    const activeScope = scope ?? { rootInput: input, parent: null };
    const resolved = resolve(input, activeScope);

    if (resolved !== schemaApi) {
      return resolved.schema(input, parentKey, activeScope);
    }

    loadLazyOptions();

    const { schemaType, props, name, label } = config;
    const result = { ...config };
    result.propType = schemaType;

    if (schemaType === 'gone') {
      result.value = undefined;
      return result;
    }

    if (schemaType === 'array') {
      if (Array.isArray(input)) {
        const templateKey = parentKey ? `${parentKey}.INDEX` : `INDEX`;
        const itemScope = { rootInput: activeScope.rootInput, parent: null };
        result.template = arrayItemType.schema(undefined, templateKey, itemScope);
        result.items = input.map((item, i) => {
          const itemKey = parentKey ? `${parentKey}.${i}` : `${i}`;
          const itemSchema = arrayItemType.schema(item, itemKey, itemScope);
          itemSchema.legend = null;
          return itemSchema;
        });
        result.value = input;
      } else {
        result.items = [];
        result.value = input;
      }

      return result;
    }

    // Primitive with name set via field() - enrich for form use
    if (!props && name) {
      result.id = makeId(name.replace(/\./g, '-'));
      result.label = 'label' in config ? label : capitalize(humanize(name));
      result.value = input;
      enrichField(result, name, input);
      return result;
    }

    if (props && hasKeys(props)) {
      if (parentKey && result.input === undefined) {
        result.input = 'fieldset';
        result.legend = capitalize(humanize(parentKey));
      }

      const childScope = { rootInput: activeScope.rootInput, parent: input };

      result.props = Object
        .entries(props)
        .reduce((props, [key, prop]) => {
          const value = prop.data(input?.[key], {}, childScope);
          const field = buildObjectField(prop, key, value, parentKey, childScope);

          if (field) {
            props[key] = field;
          }

          return props;
        }, {});
    }

    return result;
  }


  function validateValue(value) {
    if (config.computed && kindOf(value) === 'function') {
      value = value();
    }

    const { schemaType, nullable, required, pattern, test, positive, negative, integer, float, min, max, minlength, length, maxlength, floatMinDecimals, floatMaxDecimals, optionValues, optionsSet } = config;

    if (value === undefined) {
      return required ? 'is required' : null;
    }

    if (value === null) {
      return allowsNull() ? null : 'cannot be null';
    }

    if (value === '' && schemaType !== 'string' && !nullable && !required) {
      return null;
    }

    const typeIsArray = kindOf(schemaType) === 'array';
    const valueType = kindOf(value);

    if (schemaType === 'array' && optionsSet?.size && valueType === 'array') {
      if (!value.every(item => optionsSet.has(item))) {
        return `should be one of ${optionValues.join(', ')} instead of ${value}`;
      }
    } else if (optionsSet?.has(value) === false) {
      return `should be one of ${optionValues.join(', ')} instead of ${value}`;
    }

    if (value !== null && ((typeIsArray && !schemaType.includes(valueType)) || (!typeIsArray && valueType !== schemaType))) {
      return `should be a ${schemaType}`;
    }

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
      }

      if (!new RegExp(`^-?\\d+(\\.\\d{${floatMinDecimals},${floatMaxDecimals}})?$`).test(value)) {
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
      return `should be length of at least ${minlength}`;
    }

    if (maxlength && value.length > maxlength) {
      return `should be length no more than ${maxlength}`;
    }

    if (pattern && !pattern.test(value)) {
      return 'does not match the pattern';
    }

    if (test && !test(value)) {
      return 'does not pass the custom validator';
    }

    return null;
  }


  function validate(input, key, opts = {}, scope = null) {
    const activeScope = scope ?? { rootInput: input, parent: null };
    const resolved = resolve(input, activeScope);

    if (resolved !== schemaApi) {
      return resolved.validate(input, key, opts, activeScope);
    }

    const { schemaType, props } = config;

    if (schemaType === 'gone') {
      return null;
    }

    if (input === null) {
      return allowsNull() ? null : 'cannot be null';
    }

    loadLazyOptions();

    if (schemaType === 'array' && Array.isArray(input)) {
      const itemScope = { rootInput: activeScope.rootInput, parent: null };
      const arrayErrors = input
        .map((item, index) => arrayItemType.validate(item, `${key}[${index}]`, opts, itemScope))
        .filter(Boolean);

      return arrayErrors.length
        ? arrayErrors
        : null;
    }

    if (!props) {
      return validateValue(input);
    }

    const childScope = { rootInput: activeScope.rootInput, parent: input };
    const errors = {};

    for (const [propKey, prop] of Object.entries(props)) {
      if (opts.partial && !hasPresentProp(input, propKey)) continue;
      const error = prop.validate(input?.[propKey], propKey, opts, childScope);
      if (error) errors[propKey] = error;
    }

    return hasKeys(errors) ? errors : null;
  }


  function parse(input, opts = {}) {
    const scope = { rootInput: input, parent: null };
    const resolved = resolve(input, scope);

    if (resolved !== schemaApi) {
      return resolved.parse(input, opts);
    }

    opts = normalizeOpts(opts);
    clearLazyOptions();

    const result = data(input, opts, scope);
    const errors = opts.validate
      ? validate(result, 'root', opts, { rootInput: result, parent: null })
      : null;

    if (errors) {
      throw new ValidationError(errors);
    }

    return result;
  }


  function safeParse(input, opts = {}) {
    const scope = { rootInput: input, parent: null };
    const resolved = resolve(input, scope);

    if (resolved !== schemaApi) {
      return resolved.safeParse(input, opts);
    }

    opts = normalizeOpts(opts);
    clearLazyOptions();

    const result = data(input, opts, scope);
    const errors = opts.validate
      ? validate(result, 'root', opts, { rootInput: result, parent: null })
      : null;

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

    return Object
      .entries(config.compositions)
      .reduce((obj, [name, compVal]) => {
        if (typeof compVal === 'function') {
          obj[name] = compVal(input);
          return obj;
        }

        obj[name] = compVal.reduce((acc, key) => {
          if (kindOf(key) === 'object') {
            // { originalKey: 'renamedKey' } rename support
            for (const origKey in key) {
              acc[key[origKey]] = input[origKey];
              break;
            }
          } else {
            acc[key] = input[key];
          }
          return acc;
        }, {});

        return obj;
      }, {});
  }


  function partitionInput() {
    if (config.schemaType !== 'object') {
      throw new Error('partitionInput() can only be called on object schemas');
    }

    config.partitionInput = true;
    compose('knownInput', Object.keys(config.props || {}));
    compose('unknownInput', (inp) => buildUnknownInput(inp, config));

    return this;
  }


  function transform(fn) {
    config.transform = fn;
    return this;
  }


  function copyConfigProperties(sourceConfig, targetSchema) {
    for (const key in sourceConfig) {
      if (COPY_CONFIG_EXCLUDE.has(key) || key in targetSchema.config) continue;
      targetSchema.config[key] = key === 'compositions'
        ? Object.fromEntries(
          Object.entries(sourceConfig[key] || {}).map(([name, value]) => [
            name,
            Array.isArray(value) ? [...value] : value
          ])
        )
        : sourceConfig[key];
    }
  }


  function extend(newProps = {}) {
    if (config.schemaType !== 'object') {
      throw new Error('extend() can only be called on object schemas');
    }

    // Create extended props with new props first (for key order), then original props
    // New props override original props if there are conflicts
    const extendedProps = { ...newProps };

    // Add original props that aren't in newProps (preserves order: new first, then original)
    for (const [key, value] of Object.entries(config.props || {})) {
      if (!(key in extendedProps)) {
        extendedProps[key] = value;
      }
    }

    const newSchema = create({ type: 'object', props: extendedProps });
    copyConfigProperties(config, newSchema);
    rebindPartitionCompositions(newSchema);

    return newSchema;
  }


  function merge(otherSchema) {
    if (config.schemaType !== 'object') {
      throw new Error('merge() can only be called on object schemas');
    }

    if (!otherSchema?.config || otherSchema.config.schemaType !== 'object') {
      throw new Error('merge() requires another object schema');
    }

    const mergedProps = {
      ...config.props,
      ...otherSchema.config.props
    };

    const newSchema = create({ type: 'object', props: mergedProps });

    // Other schema's config takes precedence, then fill gaps from this schema
    copyConfigProperties(otherSchema.config, newSchema);
    copyConfigProperties(config, newSchema);
    rebindPartitionCompositions(newSchema);

    return newSchema;
  }


  function pick(keys) {
    if (config.schemaType !== 'object') {
      throw new Error('pick() can only be called on object schemas');
    }

    if (!Array.isArray(keys)) {
      throw new Error('pick() requires an array of keys');
    }

    const pickedProps = {};
    const props = config.props || {};

    for (const key of keys) {
      if (key in props) {
        pickedProps[key] = props[key];
      }
    }

    const newSchema = create({ type: 'object', props: pickedProps });
    copyConfigProperties(config, newSchema);
    rebindPartitionCompositions(newSchema);

    return newSchema;
  }


  function omit(keys) {
    if (config.schemaType !== 'object') {
      throw new Error('omit() can only be called on object schemas');
    }

    if (!Array.isArray(keys)) {
      throw new Error('omit() requires an array of keys');
    }

    const keysSet = new Set(keys);
    const omittedProps = {};

    for (const [key, prop] of Object.entries(config.props || {})) {
      if (!keysSet.has(key)) {
        omittedProps[key] = prop;
      }
    }

    const newSchema = create({ type: 'object', props: omittedProps });
    copyConfigProperties(config, newSchema);
    rebindPartitionCompositions(newSchema);

    return newSchema;
  }


  schemaApi = {
    // return Object.freeze({
    config,
    required,
    nullable,
    disabled,
    computed,
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
    sentence,
    modifier,
    compose,
    partitionInput,
    transform,
    when,
    then,
    else: elseBranch,
    otherwise,
    conditional,
    resolve,
    schema,
    fields,
    toSentence,
    data,
    composeInputs,
    modifiers,
    coerceValue,
    parse,
    safeParse,
    validate,
    extend,
    merge,
    pick,
    omit
  };

  return schemaApi;
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
  callable: () => create({ type: 'function' }),
  mixed: (types) => create({ type: types }),
  define: (name, fn) => formgive[name] = (...args) => fn.apply(this, args),
  when: (predicate) => create({ type: 'conditional' }).when(predicate),
  gone: () => create({ type: 'gone' })
};

export default formgive;
export const { string, date, number, integer, float, object, array, boolean, callable, mixed, define, when, gone } = formgive;
