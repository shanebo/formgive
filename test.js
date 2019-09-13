// const { expect } = require('chai');
// const { toFields, mapFieldValues } = require('./schema');

const {
  expect
} = require('chai');

const { toFields, mapFieldValues } = require('./schema');

// const { toBase, toValidDoc } = require('../app/subapps/hub/validator');
// const { arrayToObject } = require('../app/helpers');


const expectToEqual = (actual, expected) => {
  // console.log('\n\n\n\n');
  // console.log(actual);
  expect(actual).to.deep.equal(expected);
}


describe('Schema Parser', () => {
  describe('Shorthand', () => {
    it('simple text field', () => {
      const actual = toFields({
        name: 'text'
      });

      const expected = [{
        label: 'name',
        prop: 'name',
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
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
        label: 'email',
        prop: 'email',
        placeholder: false,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: false,
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

    it('required relationship using select', () => {
      const actual = toFields({
        author: '*@Author'
      });

      const expected = [{
        label: 'author',
        prop: 'author',
        placeholder: false,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: 'Author',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'relationship',
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
        label: 'price',
        prop: 'price',
        placeholder: false,
        help: false,
        multiple: false,
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

    it('multiple via relationship', () => {
      const actual = toFields({
        'tags': ['@Tag']
      });

      const expected = [{
        label: 'tags',
        prop: 'tags',
        placeholder: false,
        help: false,
        multiple: true,
        required: false,
        pattern: null,
        model: 'Tag',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'relationship',
        name: 'tags[]'
      }];

      expectToEqual(actual, expected);
    });

    it('checkbox', () => {
      const actual = toFields({
        'member': 'checkbox'
      });

      const expected = [{
        label: 'member',
        prop: 'member',
        placeholder: false,
        help: false,
        multiple: false,
        required: false,
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
          _label: 'name',
          _type: 'text',
          _required: true,
          _input: 'text'
        }
      });

      const expected = [{
        label: 'name',
        prop: 'name',
        placeholder: false,
        help: false,
        multiple: false,
        required: true,
        pattern: null,
        model: false,
        disabled: false,
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
            _label: 'color',
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
        model: false,
        label: 'theme',
        prop: 'theme',
        type: 'fieldset',
        children: [{
          css: '',
          disabled: false,
          value: undefined,
          placeholder: false,
          help: false,
          multiple: false,
          required: false,
          pattern: null,
          model: false,
          label: 'color',
          type: 'text',
          input: 'color',
          name: 'theme[color]',
          prop: 'color'
        }]
      }];

      expectToEqual(actual, expected);
    });


    it('fieldset with metas', () => {
      const actual = toFields({
        theme: {
          _label: 'theme',
          _type: 'fieldset',
          color: {
            _label: 'color',
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
        model: false,
        label: 'theme',
        type: 'fieldset',
        prop: 'theme',
        children: [{
          css: '',
          disabled: false,
          value: undefined,
          placeholder: false,
          help: false,
          multiple: false,
          required: false,
          pattern: null,
          model: false,
          label: 'color',
          type: 'text',
          input: 'color',
          name: 'theme[color]',
          prop: 'color'
        }]
      }];

      expectToEqual(actual, expected);
    });


    it('select with options', () => {
      const actual = toFields({
        title: {
          _label: 'title',
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
        pattern: null,
        model: false,
        label: 'title',
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
          _label: 'tags',
          _input: 'select',
          _type: 'relationship',
          _model: 'Tag'
        }]
      });

      const expected = [{
        label: 'tags',
        prop: 'tags',
        placeholder: false,
        help: false,
        multiple: true,
        required: false,
        pattern: null,
        model: 'Tag',
        disabled: false,
        value: undefined,
        css: '',
        input: 'select',
        type: 'relationship',
        name: 'tags[]'
      }];

      expectToEqual(actual, expected);
    });

    it('multiple with multiple fields', () => {
      const actual = toFields({
        comments: [{
          user: 'text',
          date: 'text',
          comment: 'markdown'
        }]
      });

      const expected = [{
        children: [
          {
            help: false,
            input: 'text',
            label: 'user',
            model: false,
            multiple: false,
            prop: 'user',
            pattern: null,
            placeholder: false,
            css: '',
            name: 'comments[][user]',
            required: false,
            disabled: false,
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
            label: 'date',
            model: false,
            multiple: false,
            prop: 'date',
            css: '',
            pattern: null,
            placeholder: false,
            name: 'comments[][date]',
            disabled: false,
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
            input: 'markdown',
            label: 'comment',
            model: false,
            multiple: false,
            disabled: false,
            css: '',
            value: undefined,
            prop: 'comment',
            pattern: 'markdown validator',
            placeholder: 'Enter markdown',
            name: 'comments[][comment]',
            required: false,
            type: 'text'
          }
        ],
        help: false,
        label: 'comments',
        model: false,
        multiple: true,
        prop: 'comments',
        disabled: false,
        css: '',
        value: undefined,
        pattern: null,
        placeholder: false,
        required: false,
        type: 'fieldset'
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
        body: 'markdown',
        comments: [
          {
            user: 'text',
            date: 'text',
            comment: 'markdown'
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
