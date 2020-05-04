// const { expect } = require('chai');
// const { toFields, mapFieldValues } = require('./schema');

const chai = require('chai');
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);

const { expect } = chai;
const { toFields, mapFieldValues, toSentence } = require('./schema');

// const { toBase, toValidDoc } = require('../app/subapps/hub/validator');
// const { arrayToObject } = require('../app/helpers');


const expectToEqual = (actual, expected) => {
  // console.log('\n\n\n\n');
  // console.log(actual);
  expect(actual).to.deep.equal(expected);
}








describe('Hydrated fields', () => {
  it('Simple hydration of multiple field', () => {
    const actual = toFields({
      type: 'text',
      tags: [{
        name: 'text'
      }]
    }, {
      type: 'RESOURCE',
      tags: [
        {
          name: 'theology'
        },
        {
          name: 'practice'
        },
        {
          name: 'application'
        }
      ]
    });

    console.log(actual[1].values);

    expect(actual[1].values).to.deep.includes({
      values: [
        [{
          value: 'theology'
        }],
        [{
          value: 'practice'
        }],
        [{
          value: 'application'
        }]
      ]
    });

    // expect(actual[0].children[0]).to.deep.includes({
    //   value: '123 Sesame street'
    // });
  });

  it('Simple hydration of nested field', () => {
    const actual = toFields({
      address: {
        street: 'text'
      }
    }, {
      address: {
        street: '123 Sesame street'
      }
    });

    console.log(actual[0].children);

    expect(actual[0].children[0]).to.deep.includes({
      value: '123 Sesame street'
    });

    // expect(actual[0].children[0]).to.deep.includes({
    //   value: '123 Sesame street'
    // });
  });

  it('Simple hydration of fields', () => {
    const actual = toFields({
      name: 'text',
      email: 'text',
      address: {
        street: 'text'
      }
    }, {
      name: 'Joe Osburn',
      // email: 'joe@jnodev.com',
      // address: {
      //   street: '123 Sesame street'
      // }
    });

    expect(actual[0]).to.deep.include({
      name: 'name',
      value: 'Joe Osburn'
    });
  });
});









describe('To sentence', () => {

  it.skip('Sentence of values with currency', () => {
    const fields = toFields({
      amount: {
        min: 'currency',
        max: 'currency'
      }
    });

    const fieldsWithValues = mapFieldValues(fields, {
      amount: {
        min: 30,
        max: 1000
      }
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn joe@jnodev.com';

    expectToEqual(actual, expected);
  });

  it('Sentence of values', () => {
    const fields = toFields({
      name: 'name',
      email: 'email'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      email: 'joe@jnodev.com'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn joe@jnodev.com';

    expectToEqual(actual, expected);
  });

  it('Sentence of values with some phrases', () => {
    const fields = toFields({
      name: {
        _input: 'name',
        _phrase: (val, field) => `My name is ${val}`
      },
      email: 'email'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      email: 'joe@jnodev.com'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'My name is joe osburn joe@jnodev.com';

    expectToEqual(actual, expected);
  });

  it('Sentence of values with some phrases', () => {
    const fields = toFields({
      name: {
        _input: 'name',
        _format: (val, field) => val.toUpperCase(),
        _phrase: (val, field) => `My name is ${val}`
      },
      email: 'email'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'My name is JOE OSBURN';

    expectToEqual(actual, expected);
  });


  it('Sentence with nested fields', () => {
    const fields = toFields({
      name: 'name',
      address: {
        zip: 'text',
        state: 'text',
        country: 'text'
      },
      phone: 'text'
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817-945-6101'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn 76177 TX US 817-945-6101';

    expectToEqual(actual, expected);
  });


  it('Sentence with nested fields with formats and phrases', () => {
    const fields = toFields({
      name: 'name',
      address: {
        state: {
          _input: 'text',
          _phrase: (val, field) => `lives in ${val}`
        }
      },
      phone: {
        _input: 'text',
        _format: (val, field) => val.replace(/\s/g, '-'),
        _phrase: (val, field) => `and can be reached at ${val}`
      }
    });

    const fieldsWithValues = mapFieldValues(fields, {
      name: 'joe osburn',
      address: {
        zip: '76177',
        state: 'TX',
        country: 'US'
      },
      phone: '817 945 6101'
    });

    const actual = toSentence(fieldsWithValues);
    const expected = 'joe osburn lives in TX and can be reached at 817-945-6101';

    expectToEqual(actual, expected);
  });


});

describe('Schema Parser', () => {
  describe('Shorthand', () => {
    it('simple text field', () => {
      const actual = toFields({
        name: 'text'
      });

      const expected = [{
        label: 'Name',
        prop: 'name',
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: false,
        disabled: false,
        autocapitalize: false,
        autocomplete: false,
        autocorrect: false,
        spellcheck: false,
        xAutocompletetype: false,
        value: undefined,
        css: '',
        input: 'text',
        type: 'text',
        name: 'name'
      }];

      expectToEqual(actual, expected);
    });

    it('required email field', () => {
      const actual = toFields({
        email: '*email'
      });

      const expected = [{
        label: 'Email',
        prop: 'email',
        placeholder: false,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: false,
        format: undefined,
        phrase: undefined,
        disabled: false,
        autocapitalize: 'off',
        autocomplete: 'email',
        autocorrect: 'off',
        spellcheck: 'off',
        xAutocompletetype: 'email',
        value: undefined,
        css: '',
        input: 'email',
        type: 'text',
        name: 'email'
      }];

      expectToEqual(actual, expected);
    });

    it('disabled text field', () => {
      const actual = toFields({
        status: '!*text@Donation'
      });

      expect(actual[0]).to.containSubset({
        disabled: true,
        input: 'text'
      });
    });

    it('required association using select', () => {
      const actual = toFields({
        author: '*select@Author'
      });

      const expected = [{
        label: 'Author',
        prop: 'author',
        placeholder: false,
        help: false,
        multiple: false,
        required: true,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: 'Author',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'association',
        name: 'author'
      }];

      expectToEqual(actual, expected);
    });

    it('required url', () => {
      const actual = toFields({
        price: '*url'
        // price: '*number:tel!currency'
      });

      const expected = [{
        label: 'Price',
        prop: 'price',
        placeholder: false,
        help: false,
        multiple: false,
        format: undefined,
        phrase: undefined,
        required: true,
        pattern: 'https://.*',
        model: false,
        disabled: false,
        value: undefined,
        css: '',
        input: 'url',
        type: 'text',
        name: 'price'
      }];

      expectToEqual(actual, expected);
    });

    it('multiple via association', () => {
      const actual = toFields({
        'tags': ['select@Tag']
      });

      const expected = [{
        label: 'Tags',
        prop: 'tags',
        placeholder: false,
        help: false,
        multiple: true,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        format: undefined,
        phrase: undefined,
        model: 'Tag',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'association',
        name: 'tags'
      }];

      expectToEqual(actual, expected);
    });

    it('checkbox', () => {
      const actual = toFields({
        'member': 'checkbox'
      });

      const expected = [{
        label: 'Member',
        prop: 'member',
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: false,
        disabled: false,
        value: false,
        css: '',
        input: 'checkbox',
        type: 'boolean',
        name: 'member'
      }];

      expectToEqual(actual, expected);
    });
  });

  describe('Longhand', () => {

    // it('radio', () => {
    //   const actual = toFields({
    //     hasDonation: {
    //       '_prop': 'hasDonation',
    //       '_label': 'Donor',
    //       '_input': 'radio',
    //       '_options': [
    //         {
    //           'label': 'True',
    //           'value': true
    //         },
    //         {
    //           'label': 'False',
    //           'value': false
    //         }
    //       ]
    //     }
    //   });

    //   const expected = [{}];

    //   expectToEqual(actual, expected);
    // });


    it('simple text field', () => {
      const actual = toFields({
        name: {
          _label: 'Name',
          _type: 'text',
          _required: true,
          _input: 'text'
        }
      });

      const expected = [{
        label: 'Name',
        prop: 'name',
        placeholder: false,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: false,
        disabled: false,
        format: undefined,
        phrase: undefined,
        value: undefined,
        css: '',
        type: 'text',
        input: 'text',
        autocapitalize: false,
        autocomplete: false,
        autocorrect: false,
        spellcheck: false,
        xAutocompletetype: false,
        name: 'name'
      }];

      expectToEqual(actual, expected);
    });


    it('fieldset with no metas', () => {
      const actual = toFields({
        theme: {
          color: {
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });

      const expected = [{
        css: '',
        disabled: false,
        value: undefined,
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
        pattern: null,
        format: undefined,
        phrase: undefined,
        model: false,
        label: 'Theme',
        prop: 'theme',
        input: 'fieldset',
        children: [{
          css: '',
          disabled: false,
          value: undefined,
          placeholder: false,
          help: false,
          format: undefined,
          phrase: undefined,
          multiple: false,
          required: false,
          pattern: null,
          model: false,
          label: 'Color',
          type: 'text',
          input: 'color',
          name: 'theme.color',
          prop: 'color'
        }]
      }];

      expectToEqual(actual, expected);
    });


    it('fieldset with metas', () => {
      const actual = toFields({
        theme: {
          _label: 'Theme',
          _input: 'fieldset',
          color: {
            _label: 'Color',
            _type: 'text',
            _input: 'color'
          }
        }
      });

      const expected = [{
        css: '',
        disabled: false,
        value: undefined,
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
        pattern: null,
        format: undefined,
        phrase: undefined,
        model: false,
        label: 'Theme',
        input: 'fieldset',
        prop: 'theme',
        children: [{
          css: '',
          disabled: false,
          value: undefined,
          placeholder: false,
          format: undefined,
          phrase: undefined,
          help: false,
          multiple: false,
          required: false,
          pattern: null,
          model: false,
          label: 'Color',
          type: 'text',
          input: 'color',
          name: 'theme.color',
          prop: 'color'
        }]
      }];

      expectToEqual(actual, expected);
    });


    it('select with options', () => {
      const actual = toFields({
        title: {
          _label: 'Title',
          _input: 'select',
          _type: 'number',
          _options: [
            {
              label: 'Mr.',
              value: 1
            },
            {
              label: 'Mrs.',
              value: 2
            },
            {
              label: 'Dr.',
              value: 3
            }
          ]
        }
      });

      const expected = [{
        css: '',
        disabled: false,
        value: undefined,
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: false,
        label: 'Title',
        name: 'title',
        input: 'select',
        type: 'number',
        prop: 'title',
        options: [
          {
            label: 'Mr.',
            value: 1
          },
          {
            label: 'Mrs.',
            value: 2
          },
          {
            label: 'Dr.',
            value: 3
          }
        ]
      }];

      expectToEqual(actual, expected);
    });
  });


  describe('Mixed', () => {
    it('multiple via relationship', () => {
      const actual = toFields({
        tags: [{
          _label: 'Tags',
          _input: 'select',
          _type: 'association',
          _model: 'Tag'
        }]
      });

      const expected = [{
        label: 'Tags',
        prop: 'tags',
        placeholder: false,
        help: false,
        multiple: true,
        required: false,
        format: undefined,
        phrase: undefined,
        pattern: null,
        model: 'Tag',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'association',
        name: 'tags'
      }];

      expectToEqual(actual, expected);
    });

    it.skip('multiple with multiple fields', () => {
      const actual = toFields({
        comments: [{
          user: 'text',
          date: 'text',
          comment: 'textarea'
        }]
      });

      const expected = [{
        children: [
          {
            help: false,
            input: 'text',
            label: 'User',
            model: false,
            multiple: false,
            prop: 'user',
            pattern: null,
            placeholder: false,
            css: '',
            name: 'comments[][user]',
            required: false,
            disabled: false,
            format: undefined,
            phrase: undefined,
            format: undefined,
            phrase: undefined,
            autocapitalize: false,
            autocomplete: false,
            autocorrect: false,
            spellcheck: false,
            xAutocompletetype: false,
            value: undefined,
            type: 'text'
          },
          {
            help: false,
            input: 'text',
            label: 'Date',
            model: false,
            multiple: false,
            prop: 'date',
            css: '',
            pattern: null,
            placeholder: false,
            name: 'comments[][date]',
            disabled: false,
            format: undefined,
            phrase: undefined,
            autocapitalize: false,
            autocomplete: false,
            autocorrect: false,
            spellcheck: false,
            xAutocompletetype: false,
            value: undefined,
            required: false,
            type: 'text'
          },
          {
            help: false,
            input: 'textarea',
            label: 'Comment',
            model: false,
            multiple: false,
            disabled: false,
            css: '',
            value: undefined,
            format: undefined,
            phrase: undefined,
            prop: 'comment',
            pattern: 'markdown validator',
            placeholder: 'Enter markdown',
            name: 'comments[][comment]',
            required: false,
            type: 'text'
          }
        ],
        help: false,
        label: 'Comments',
        model: false,
        multiple: true,
        prop: 'comments',
        format: undefined,
        phrase: undefined,
        disabled: false,
        css: '',
        value: undefined,
        pattern: null,
        placeholder: false,
        required: false,
        input: 'fieldset'
      }];

      expectToEqual(actual, expected);
    });

  });


  describe('Doc Validation', () => {
  //   { _type: 'Post',
  // title: 'Post title',
  // body: 'Hi body of post',
  // comments:
  //  [ { user: 'shanebo', date: 'today', comment: 'comment goes here' } ] }


  const model = {
      id: 'Person',
      fields: toFields({
        title: 'text',
        body: 'textarea',
        comments: [
          {
            user: 'text',
            date: 'text',
            comment: 'textarea'
          }
        ]
      })
    };

    // it.only('first pass', () => {
    //   const udoc = {
    //     _type: 'Post',
    //     title: 'Post title',
    //     body: 'Hi body of post',
    //     comments: [{
    //       user: 'shanebo',
    //       date: 'today',
    //       comment: 'comment goes here'
    //     }]
    //   };

    //   const actual = toValidDoc(udoc, model);
    //   console.log({ actual });


    //   const t = arrayToObject([{_title: 'im a title'}, false, { _body: 'im a body' }]);
    //   console.log({ t });



    //   const expected = '';
    //   expectToEqual(actual, expected);
    // });

    // it.only('first pass', () => {
    //   const doc = {
    //     name: 'Shane Thacker',
    //     slogans: [
    //       "It's all gonna burn",
    //       "Hi there buddy"
    //     ],
    //     about: {
    //       region: {
    //         texan: 'true'
    //       }
    //     }
    //   };


    //   const actual = toValidDoc(doc, model);
    //   console.log(actual);
    //   const expected = '';
    //   expectToEqual(actual, expected);
    // });

  });

});
