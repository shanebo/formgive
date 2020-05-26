const dayjs = require('dayjs');
const { toCurrency, humanize } = require('./utils');


exports.SHORTHAND_FLAGS = {
  '*': { _attributes: { required: true } },
  '!': { _attributes: { disabled: true } },
  '@': (_model) => ({
    _type: 'association',
    _model
  })
  // ':': 'type',
  // '?': '_help'
  // '()': '_placeholder'
};


exports.baseField = (_key) => ({
  _key,
  _label: humanize(_key),
  _help: null,
  _prefix: null,
  _format: null,
  _phrase: null,
  _attributes: {
    id: _key,
    required: false,
    disabled: false,
    value: undefined,
    // class: '',
  }
});


exports.fieldset = () => ({
  _input: 'fieldset'
});

exports.textarea = () => ({
  _input: 'textarea',
  _type: 'text',
  _attributes: {
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    spellcheck: 'false'
  }
});







exports.text = () => ({
  _input: 'input',
  _attributes: {
    type: 'text',
    autocapitalize: null,
    autocomplete: null,
    autocorrect: null,
    spellcheck: null,
    xAutocompletetype: null
  }
});

exports.name = () => ({
  _input: 'input',
  _attributes: {
    type: 'text',
    autocapitalize: 'on',
    autocomplete: 'name',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'name-full'
  }
});

exports.email = () => ({
  _input: 'input',
  _attributes: {
    type: 'email',
    autocapitalize: 'off',
    autocomplete: 'email',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'email'
    // pattern: 'email validator',
    // placeholder: 'email@website.com',
  }
});

exports.phone = () => ({
  _input: 'input',
  _type: 'tel',
  _attributes: {
    type: 'tel',
    pattern: '[0-9]*',
    autocapitalize: 'off',
    autocomplete: 'phone',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'phone'
  }
});

exports.ccnumber = () => ({
  _input: 'input',
  _attributes: {
    type: 'tel',
    // pattern: '[0-9]*',
    autocapitalize: 'off',
    autocomplete: 'ccnumber',
    autocorrect: 'off',
    spellcheck: 'off',
    xAutocompletetype: 'ccnumber'
  }
});

exports.currency = () => ({
  _input: 'input',
  _prefix: '$',
  _format: toCurrency,
  _attributes: {
    type: 'text',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'off'
    // pattern: 'email validator',
    // placeholder: 'email@website.com',
  }
});

exports.url = () => ({
  _input: 'input',
  _attributes: {
    type: 'url',
    pattern: 'https://.*'
  }
});

exports.number = () => ({
  _input: 'input',
  _attributes: {
    type: 'number',
    pattern: '[0-9]*'
  }
});

exports.password = () => ({
  _input: 'input',
  _type: 'password',
  _attributes: {
    type: 'password',
    autocapitalize: 'off',
    autocomplete: 'current-password',
    autocorrect: 'off',
    spellcheck: 'off'
  }
});

// 'image'
// 'time'














// CHECKBOXES

exports.checkbox = () => ({
  _input: 'checkbox',
  _type: 'default',
  _attributes: {
    type: 'checkbox',
    checked: false
  }
});

exports.radio = () => ({
  _input: 'checkbox',
  _type: 'radio'
});

exports.switch = () => ({
  _input: 'checkbox',
  _type: 'switch'
});

exports.chip = () => ({
  _input: 'checkbox',
  _type: 'chip'
});






exports.select = (_options) => ({
  _input: 'select',
  _type: 'option',
  ..._options && { _options }
});

exports.option = () => ({
  _input: 'option',
  _attributes: {
    value: undefined,
    selected: false,
    disabled: false
  }
});




// PICKS

exports.pick = (_options) => ({
  _input: 'pick',
  ..._options && { _options }
});

exports['pick:chip'] = (_options) => ({
  _input: 'pick',
  _type: 'chip',
  _multiple: false,
  ..._options && { _options }
});

exports['pick:radio'] = (_options) => ({
  _input: 'pick',
  _type: 'radio',
  _multiple: false,
  ..._options && { _options }
});

exports['pick:chips'] = (_options) => ({
  _input: 'pick',
  _type: 'chip',
  _multiple: true,
  ..._options && { _options }
});

exports['pick:switches'] = (_options) => ({
  _input: 'pick',
  _type: 'switch',
  _multiple: true,
  ..._options && { _options }
});

exports['pick:checkboxes'] = (_options) => ({
  _input: 'pick',
  _type: 'checkbox',
  _multiple: true,
  ..._options && { _options }
});





// COMBOBOXES

exports.tags = () => ({
  _input: 'combobox',
  _type: 'tags',
  _mode: 'tags',
  _search: true,
  _single: false,
  _remote: false,
});

// exports.option = () => ({
//   _input: 'combobox',
//   _type: 'option',
//   _mode: 'default',
//   _search: false,
//   _remote: false,
//   _single: true
// });

exports.multioption = (_options) => ({
  _input: 'combobox',
  _type: 'multioption',
  // _mode: 'default',
  // _options: null,
  _search: false,
  _remote: false,
  _single: false,
  ..._options && { _options }
});

exports.association = () => ({
  _input: 'combobox',
  _type: 'association',
  _mode: 'search',
  _remote: true,
  _search: false,
  _single: true
});

exports.associations = () => ({
  _input: 'combobox',
  _type: 'associations',
  _mode: 'search',
  _remote: true,
  _search: false,
  _single: false
});

exports.combobox = () => ({
  _input: 'combobox',
  // _type: 'tags',
  // _mode: 'tags',
  // _remote: false,
  // _search: true,
  // _single: false
});










// CUSTOM

exports.date = () => ({
  _input: 'date',
  _type: 'text',
  // _pattern: /./,
  _format: (d) => dayjs(d).format('MM/DD/YYYY'), // allow a default date format at the global level
  _attributes: {
    type: 'text',
    // _autocapitalize: false,
    // _autocomplete: false,
    // _autocorrect: false,
    // _spellcheck: false,
    // _xAutocompletetype: false,
  }
});

exports.dateRange = (_options) => {
  if (_options) {
    _options.push({
      label: 'Custom',
      value: ''
    });
  }

  return {
    _input: 'daterange',
    _format: (val, date) => {
      if (val.key) {
        return humanize(val.key);
      }

      const range = [];

      range.push(
        val.start
          ? dayjs(val.start).format('MM/DD/YYYY')
          : 'Anytime past',
        val.end
          ? dayjs(val.end).format('MM/DD/YYYY')
          : 'Today'
      );

      return range.join('—');

      // if (val.start) {
      //   rangeVals.push(dayjs(val.start).format('MM/DD/YYYY'));
      // } else {
      //   rangeVals.push('Anytime past');
      // }

      // if (val.end) {
      //   rangeVals.push(dayjs(val.end).format('MM/DD/YYYY'));
      // } else {
      //   rangeVals.push('Today');
      // }

      // return rangeVals.join('—')
    },
    key: {
      _label: 'Date range',
      _input: 'select',
      ..._options && { _options }
    },
    start: 'date',
    end: 'date'
  };
}

exports.currencyRange = () => ({
  _css: 'FieldsetRow',
  _input: 'fieldset',
  // _label: 'Amount',
  // _format: (val) => `${toCurrency(val.min)} - ${toCurrency(val.max)}`,
  _format: (val) => {
    const hasMin = val.hasOwnProperty('min');
    const hasMax = val.hasOwnProperty('max');

    if (hasMin && hasMax) {
      return `${toCurrency(val.min)}–${toCurrency(val.max)}`;
    } else if (hasMin) {
      return `Over ${toCurrency(val.min)}`;
    } else if (hasMax) {
      return `Under ${toCurrency(val.min)}`;
    }
  },
  _phrase: (val) => val.toLowerCase(),
// _format: (val, field) => {
  //   console.log('\n\n\n\n');
  //   console.log('IM IN AMOUNT FORMAT!!!!');

  //   if (val.min && val.max) {
  //     return `${field.children[0].format(val.min)}–${field.children[1].format(val.min)}`;
  //   }
  //   return val;
  // },
  min: 'currency',
  max: 'currency'
  // min: {
  //   _input: 'currency',
  //   // _format: (val) => toCurrency(val),
  //   _phrase: (val) => `over ${val}`
  // },
  // max: {
  //   _input: 'currency',
  //   // _format: (val) => toCurrency(val),
  //   _phrase: (val) => `under ${val}`
  // }
});

exports.direction = (_options) => ({
  _css: 'hide',
  _input: 'select',
  _phrase: (val) => val === 'ASC' ? 'ascending' : 'descending',
  _format: (val) => humanize(val),
  ..._options && { _options }
});

exports.order = (_options) => ({
  _css: 'hide',
  _input: 'select',
  _phrase: (val) => `ordered by ${val.toLowerCase()} field`,
  _format: (val) => humanize(val),
  ..._options && { _options }
});

exports.enum = (_options) => ({
  _input: 'select',
  _phrase: (val) => val.toLowerCase(),
  _format: (val) => humanize(val),
  ..._options && { _options }
});

exports.keyword = () => ({
  _label: 'Keyword',
  _input: 'input'
});
