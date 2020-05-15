const dayjs = require('dayjs');
const { toCurrency, humanize } = require('./utils');


exports.text = () => ({
  _input: 'text',
  _type: 'text',
  _autocapitalize: false,
  _autocomplete: false,
  _autocorrect: false,
  _spellcheck: false,
  _xAutocompletetype: false
});

exports.name = () => ({
  _input: 'name',
  _type: 'text',
  _autocapitalize: 'on',
  _autocomplete: 'name',
  _autocorrect: 'off',
  _spellcheck: 'off',
  _xAutocompletetype: 'nume-full'
});

exports.date = () => ({
  _input: 'date',
  _type: 'text',
  _autocapitalize: false,
  _autocomplete: false,
  _autocorrect: false,
  _spellcheck: false,
  _xAutocompletetype: false,
  // _pattern: /./,
  _format: (d) => dayjs(d).format('MM/DD/YYYY') // allow a default date format at the global level
  // _formatter: (val) => formatDate(val)
});

exports.email = () => ({
  _input: 'email',
  _type: 'email',
  _autocapitalize: 'off',
  _autocomplete: 'email',
  _autocorrect: 'off',
  _spellcheck: 'off',
  _xAutocompletetype: 'email'
  // pattern: 'email validator',
  // placeholder: 'email@website.com',
});

exports.url = () => ({
  _input: 'url',
  _type: 'text',
  _pattern: 'https://.*'
});

exports.number = () => ({
  _input: 'number',
  _type: 'number',
  _pattern: '[0-9]*'
});

exports.checkbox = () => ({
  _input: 'checkbox',
  _type: '',
  _checked: false,
  _value: false
});

exports.switch = () => ({
  _input: 'checkbox',
  _type: 'switch',
  _checked: false,
  _value: false
});

exports.textarea = () => ({
  _input: 'textarea',
  _type: 'text'
});

exports.currency = () => ({
  _input: 'currency',
  _type: 'text',
  _prefix: '$',
  _autocapitalize: false,
  _autocomplete: false,
  _autocorrect: false,
  _spellcheck: false,
  _format: toCurrency,
  _xAutocompletetype: false
});

exports.select = (_options) => ({
  _input: 'select',
  ..._options && { _options }
});

exports.radio = () => ({
  _input: 'radio',
  _type: 'text'
});

exports.radiogroup = (_options) => ({
  _input: 'radiogroup',
  _type: 'text',
  ..._options && { _options }
});

exports.fieldset = () => ({
  _input: 'fieldset'
});

exports.password = () => ({
  _input: 'text',
  _type: 'password',
  _autocapitalize: false,
  _autocomplete: false,
  _autocorrect: false,
  _spellcheck: false,
  _xAutocompletetype: false
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

exports.tags = () => ({
  _input: 'combobox',
  _type: 'tags',
  _mode: 'tags',
  _search: true,
  _single: false,
  _remote: false,
});

exports.selectsearch = () => ({
  _input: 'combobox',
  _mode: 'default',
  _remote: false,
  _single: true
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
  _pattern: '[0-9]*',
  _autocapitalize: 'off',
  _autocomplete: 'phone',
  _autocorrect: 'off',
  _spellcheck: 'off',
  _xAutocompletetype: 'phone'
});

exports.ccnumber = () => ({
  _input: 'ccnumber',
  _type: 'tel',
  _autocapitalize: 'off',
  _autocomplete: 'ccnumber',
  _autocorrect: 'off',
  _spellcheck: 'off',
  _xAutocompletetype: 'ccnumber'
});





// custom inputs

exports.currencyRange = () => ({
  _css: 'FieldsetRow',
  _input: 'fieldset',
  _label: false,
  // _format: (val, field) => {
  //   console.log('\n\n\n\n');
  //   console.log('IM IN AMOUNT FORMAT!!!!');

  //   if (val.min && val.max) {
  //     return `${field.children[0].format(val.min)}–${field.children[1].format(val.min)}`;
  //   }
  //   return val;
  // },
  min: {
    _input: 'currency',
    // _format: (val) => toCurrency(val),
    _phrase: (val) => `over ${val}`
  },
  max: {
    _input: 'currency',
    // _format: (val) => toCurrency(val),
    _phrase: (val) => `under ${val}`
  },
  uno: {
    dos: {
      tres: 'textarea'
    }
  }
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

exports.dateRange = (_options) => ({
  _input: 'daterange',
  _label: 'Date range',
  ..._options && { _options },
  _format: (val, date) => {
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
});




exports.SHORTHAND_FLAGS = {
  '*': { _required: true },
  '!': { _disabled: true },
  '@': (_model) => ({
    _type: 'association',
    _model
  })
  // ':': 'type',
  // '?': '_help'
  // '()': '_placeholder'
};



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
