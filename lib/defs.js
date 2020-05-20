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

exports.text = () => ({
  _input: 'text',
  // _type: 'text',
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
  _input: 'name',
  // _type: 'text',
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
  _input: 'email',
  _type: 'email',
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

exports.currency = () => ({
  _input: 'currency',
  _type: 'text',
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

exports.checkbox = () => ({
  _input: 'checkbox',
  _type: '',
  // _checked: false,
  // _value: false,
  _attributes: {
    // type: 'checkbox',
    // autocapitalize: 'off',
    // autocomplete: 'off',
    // autocorrect: 'off',
    // spellcheck: 'off'
    // pattern: 'email validator',
    // placeholder: 'email@website.com',
  }
});

exports.switch = () => ({
  _input: 'checkbox',
  _type: 'switch',
  // _checked: false,
  // _value: false,
  _attributes: {
    // type: 'checkbox'
    // autocapitalize: 'off',
    // autocomplete: 'off',
    // autocorrect: 'off',
    // spellcheck: 'off'
    // pattern: 'email validator',
    // placeholder: 'email@website.com',
  }
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

exports.date = () => ({
  _input: 'date',
  _type: 'text',
  // _pattern: /./,
  _format: (d) => dayjs(d).format('MM/DD/YYYY'), // allow a default date format at the global level
  // _formatter: (val) => formatDate(val)
  _attributes: {
    type: 'text',
    // _autocapitalize: false,
    // _autocomplete: false,
    // _autocorrect: false,
    // _spellcheck: false,
    // _xAutocompletetype: false,
  }
});

exports.select = (_options) => ({
  _input: 'select',
  ..._options && { _options }
});

exports.radiogroup = (_options) => ({
  _input: 'radiogroup',
  _type: 'text',
  ..._options && { _options }
});

exports.fieldset = () => ({
  _input: 'fieldset'
});

// exports.switch = () => ({
//   _input: 'checkbox',
//   _type: 'switch',
//   _checked: false,
//   _value: false
// });

exports.tags = () => ({
  _input: 'combobox',
  _type: 'tags',
  _mode: 'tags',
  _search: true,
  _single: false,
  _remote: false,
});







exports.url = () => ({
  _input: 'url',
  _type: 'text',
  _attributes: {
    type: 'url',
    pattern: 'https://.*'
  }
});

exports.number = () => ({
  _input: 'number',
  _type: 'number',
  _attributes: {
    type: 'number',
    pattern: '[0-9]*'
  }
});




exports.radio = () => ({
  _input: 'radio',
  _type: 'text'
});


exports.password = () => ({
  _input: 'text',
  _type: 'password',
  _attributes: {
    type: 'password',
    autocapitalize: 'off',
    autocomplete: 'current-password',
    autocorrect: 'off',
    spellcheck: 'off'
  }
});

exports.option = () => ({
  _input: 'combobox',
  _type: 'option',
  _mode: 'default',
  _search: false,
  _remote: false,
  _single: true
});

exports.multioption = () => ({
  _input: 'combobox',
  _type: 'multioption',
  _mode: 'default',
  _search: true,
  _remote: false,
  _single: false
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
  _type: 'tags',
  _mode: 'tags',
  _remote: false,
  _search: true,
  _single: false
});

exports.phone = () => ({
  _input: 'phone',
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
  _input: 'ccnumber',
  _type: 'tel',
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





// custom inputs

exports.currencyRange = () => ({
  _css: 'FieldsetRow',
  _input: 'fieldset',
  // _label: 'Amount',
  // _format: (val) => `${toCurrency(val.min)} - ${toCurrency(val.max)}`,
  _format: (val) => {
    const hasMin = val.hasOwnProperty('min');
    const hasMax = val.hasOwnProperty('max');

    if (hasMin && hasMax) {
      return `${toCurrency(val.min)} - ${toCurrency(val.max)}`;
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
  _input: 'text'
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
    // _label: 'Date range',
    _css: '',
    // ..._options && { _options },
    key: {
      _label: 'Date range',
      // _label: 'Date range',
      _input: 'select',
      ..._options && { _options },
      // _format: (val) => {
      //   if (val) {
      //     return humanize(val);
      //   }
      // }
    },
    start: 'date',
    end: 'date',
    _format: (val, date) => {
      console.log('\n\n\n_format stuff');
      console.log({ val });
      console.log({ date });

      if (val.key) {
        return humanize(val.key);
      }

      // if (!date) {
      //   date = val;
      // }

      const rangeVals = [];

      if (val.start) {
        rangeVals.push(dayjs(val.start).format('MM/DD/YYYY'));
      } else {
        rangeVals.push('Anytime past');
      }

      if (val.end) {
        rangeVals.push(dayjs(val.end).format('MM/DD/YYYY'));
      } else {
        rangeVals.push('Today');
      }

      return rangeVals.join('—')
    }
  };
}

// exports.dateRange = (_options) => ({
//   _input: 'daterange',
//   _label: 'Date range',
//   ..._options && { _options },
//   _format: (val, date) => {
//     console.log('\n\n\n_format stuff');
//     console.log({ val });
//     console.log({ date });


//     if (val.key) {
//       return humanize(val.key);
//     }

//     // if (!date) {
//     //   date = val;
//     // }

//     const rangeVals = [];

//     if (val.start) {
//       rangeVals.push(dayjs(val.start).format('MM/DD/YYYY'));
//     } else {
//       rangeVals.push('Anytime past');
//     }

//     if (val.end) {
//       rangeVals.push(dayjs(val.end).format('MM/DD/YYYY'));
//     } else {
//       rangeVals.push('Today');
//     }

//     return rangeVals.join('—')
//   }
// });







/*
IDEAS
--> fields --> hydrateFields --> filters

name: '*text',
givenAt: '*datetime',
amount: '!currency',
type: formgive.input.select(res.locals.types.enumValues)
date: formgive.input.dateRange(res.locals.dateKeys.enumValues)

type: formgive.input.text({
  placeholder: '50 char max',
  require: true
})

date: {
  _input: 'dateRange',
  _options: data
}
formgive.input.dateRange(res.locals.dateKeys.enumValues)

date: formgive.input.dateRange(res.locals.dateKeys.enumValues)
*/
