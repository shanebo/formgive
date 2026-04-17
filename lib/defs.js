const { toCurrency, humanize, uid } = require('./utils');
const countries = require('./countries');
const toDateFormat = (d) => new Intl.DateTimeFormat('en-US').format(new Date(d));


function text() {
  return {
    input: 'input',
    type: 'text',
    autocapitalize: null,
    autocomplete: null,
    autocorrect: null,
    spellcheck: null,
    xAutocompletetype: null
  };
}

function name() {
  return {
    input: 'input',
    type: 'text',
    autocapitalize: 'on',
    autocomplete: 'name',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'name-full'
  };
}

function email() {
  return {
    input: 'input',
    type: 'email',
    autocapitalize: 'off',
    autocomplete: 'email',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'email'
  };
}

function phone() {
  return {
    input: 'input',
    type: 'tel',
    // pattern: '[0-9]*',
    autocapitalize: 'off',
    autocomplete: 'phone',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'phone'
  }
}

function ccnumber() {
  return {
    input: 'input',
    type: 'tel',
    // pattern: '[0-9]*',
    autocapitalize: 'off',
    autocomplete: 'ccnumber',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'ccnumber'
  };
}

function currency() {
  return {
    input: 'input',
    prefix: '$',
    format: toCurrency,
    type: 'number',
    step: '.01',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'off'
  };
}

function url() {
  return {
    input: 'input',
    type: 'url',
    pattern: 'https://.*'
  };
}

function int() {
  return {
    input: 'input',
    type: 'number',
    step: '1',
    min: '1'
  };
}

function password() {
  return {
    input: 'input',
    type: 'password',
    autocapitalize: 'off',
    autocomplete: 'current-password',
    autocorrect: 'off',
    spellcheck: 'off'
  };
}

function float() {
  return {
    input: 'input',
    type: 'number',
    step: '.01',
    min: '.01'
  };
}

function textarea() {
  return {
    input: 'textarea',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: 'false'
  };
}






function chip() {
  return {
    input: 'checkbox',
    type: 'chip'
  };
}

function Switch() {
  return {
    input: 'checkbox',
    type: 'switch'
  };
}

function checkbox() {
  return {
    input: 'checkbox',
    type: 'checkbox'
  };
}

function choices() {
  return {
    input: 'select',
    type: 'choices'
  };
}

function radio() {
  return {
    input: 'select',
    type: 'radio'
  };
}

function switches() {
  return {
    input: 'select',
    type: 'switch',
    multiple: true
  };
}

function chips() {
  return {
    input: 'select',
    type: 'chips',
    multiple: true
  };
}

function checkboxes() {
  return {
    input: 'select',
    type: 'checkbox',
    multiple: true
  };
}







function multioption(options = []) {
  return {
    input: 'combobox',
    type: 'multioption',
    search: false,
    remote: false,
    single: false,
    options
  };
}

function tags() {
  return {
    input: 'combobox',
    type: 'tags',
    mode: 'tags',
    search: true,
    single: false,
    remote: false,
  };
}

function association() {
  return {
    input: 'combobox',
    type: 'association',
    mode: 'search',
    remote: true,
    search: false,
    single: true,
  };
}

function associations() {
  return {
    input: 'combobox',
    type: 'associations',
    mode: 'search',
    remote: true,
    search: false,
    single: false,
  };
}


function date() {
  return {
    input: 'date',
    type: 'text',
    format: (d) => toDateFormat(d),
  };
}

function dateRange(options = []) {
  return {
    input: 'daterange',
    format: (val, date) => {
      if (val.key) {
        return humanize(val.key);
      }

      const range = [];

      range.push(
        val.start
          ? toDateFormat(val.start)
          : 'Anytime past',
        val.end
          ? toDateFormat(val.end)
          : 'Today'
      );

      return range.join('—');
    },
    key: {
      label: 'Date range',
      input: 'select',
      options
    },
    start: 'date',
    end: 'date'
  };
}

function currencyRange() {
  return {
    input: 'fieldset',
    format: (val) => {
    const hasMin = val.hasOwnProperty('min');
    const hasMax = val.hasOwnProperty('max');

    if (hasMin && hasMax) {
      return `${toCurrency(val.min)}–${toCurrency(val.max)}`;
    } else if (hasMin) {
      return `${toCurrency(val.min)}–Above`;
    } else if (hasMax) {
      return `$0–${toCurrency(val.max)}`;
    }
  },
  phrase: (val) => val.toLowerCase(),
    min: 'currency',
    max: 'currency'
  }
}


function address(options = countries) {
  return {
    input: 'address',
    format: (val) => {
      return val;
    },
    street: {
      input: 'input',
      label: 'Address',
      type: 'text',
      required: true,
      disabled: false,
      autocomplete: 'address-line1',
      xAutocompletetype: 'address-line1',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    streetExtended: {
      input: 'input',
      label: 'Address line 2',
      type: 'text',
      disabled: false,
      autocomplete: 'address-line2',
      xAutocompletetype: 'address-line2',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    locality: {
      input: 'input',
      label: 'City',
      type: 'text',
      required: true,
      disabled: false,
      autocomplete: 'address-level2',
      xAutocompletetype: 'address-line2',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    region: {
      input: 'input',
      label: 'State / Province',
      type: 'text',
      required: true,
      disabled: false,
      autocomplete: 'address-level1',
      xAutocompletetype: 'address-level1',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    postalCode: {
      input: 'input',
      type: 'text',
      pattern: '[a-zA-Z\\d\\s\\-]+',
      required: true,
      disabled: false,
      autocomplete: 'postal-code',
      xAutocompletetype: 'postal-code',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    countryCode: {
      label: 'Country',
      input: 'select',
      required: true,
      disabled: false,
      autocomplete: 'country-name',
      xAutocompletetype: 'country-name',
      options
    }
  };
}


function location(options = countries, attributes) {
  return {
    input: 'location',
    format: (val) => {
      if (!val) return val;
      const { locality, region, postalCode, countryCode } = val;
      const country = countries.find(country => country.value === countryCode);
      return [
          locality,
          region,
          postalCode,
          (country ? country.label : null)
        ]
        .filter(x => x)
        .join(', ');
    },
    locality: {
      input: 'input',
      label: 'City',
      type: 'text',
      autocomplete: 'address-level2',
      xAutocompletetype: 'address-level2',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    region: {
      input: 'input',
      label: 'State / Province',
      type: 'text',
      autocomplete: 'address-level1',
      xAutocompletetype: 'address-level1',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    postalCode: {
      input: 'input',
      type: 'text',
      autocomplete: 'postal-code',
      xAutocompletetype: 'postal-code',
      autocapitalize: null,
      autocorrect: null,
      spellcheck: null
    },
    countryCode: {
      label: 'Country',
      input: 'select',
      autocomplete: 'country-name',
      xAutocompletetype: 'country-name',
      options
    }
  };
};


function direction(options) {
  return {
    input: 'select',
    hidden: true,
    phrase: (val) => val === 'ASC' ? 'ascending' : 'descending',
    format: (val) => humanize(val),
    options
  };
}

function order(options) {
  return {
    input: 'select',
    hidden: true,
    phrase: (val) => `ordered by ${val.toLowerCase()} field`,
    format: (val) => humanize(val),
    options
  };
}

function enumeration(options) {
  return {
    input: 'select',
    phrase: (val) => val.toLowerCase(),
    format: (val) => humanize(val),
    options
  };
}


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
