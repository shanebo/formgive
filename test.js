const { expect } = require('chai');
const { toFields, mapFieldValues } = require('./schema');

describe('Foo', function() {
  it('renders content', function() {

    const fields = toFields({
      name: '*name',
      email: '*email',
      address: {
        _class: 'Box-Fldst FldstAddress',
        _type: 'fieldset',
        addressLine1: '*text',
        addressLine2: 'text',
        city: '*text',
        state: '*text',
        postalCode: '*text',
        country: '*text'
      },
      payment: {
        _class: 'Box-Fldst PaymentSet',
        _type: 'fieldset',
        creditCard: '*number',
        expiration: '*number',
        securityCode: '*number',
        foo: {
          _class: 'Box-Fldst PaymentSet',
          _type: 'fieldset',
          creditCard: '*number',
          expiration: '*number',
          securityCode: '*number'
        }
      }
    });

    console.log(JSON.stringify(fields, null, 2));


    expect(fields).to.eql('foo');
  });


  it.only('arbitrary structure', function() {

    const fields = toFields({
      _fieldset: {
        firstName: '*name',
        name: '*name',
        email: '*email'
      }
      // address: {
      //   _class: 'Box-Fldst FldstAddress',
      //   _type: 'fieldset',
      //   addressLine1: '*text',
      //   addressLine2: 'text',
      //   city: '*text',
      //   state: '*text',
      //   postalCode: '*text',
      //   country: '*text'
      // },
      // payment: {
      //   _class: 'Box-Fldst PaymentSet',
      //   _type: 'fieldset',
      //   creditCard: '*number',
      //   expiration: '*number',
      //   securityCode: '*number',
      //   foo: {
      //     _class: 'Box-Fldst PaymentSet',
      //     _type: 'fieldset',
      //     creditCard: '*number',
      //     expiration: '*number',
      //     securityCode: '*number'
      //   }
      // }
    });

    console.log(JSON.stringify(fields, null, 2));


    expect(fields).to.eql([
      {
        _label: "_fieldset",
        _prop: "_fieldset",
        _placeholder: false,
        _help: false,
        _multiple: false,
        _required: false,
        _pattern: null,
        _model: false,
        _disabled: false,
        _autocapitalize: false,
        _autocomplete: false,
        _value: undefined,
        _autocorrect: false,
        _spellcheck: false,
        _xAutocompletetype: false,
        _class: "",
        _type: "fieldset",
        _children: [
          {
            _label: "First Name",
            _prop: "firstName",
            _placeholder: false,
            _help: false,
            _multiple: false,
            _required: true,
            _pattern: null,
            _model: false,
            _disabled: false,
            _autocapitalize: "on",
            _autocomplete: "name",
            _value: undefined,
            _autocorrect: "off",
            _spellcheck: "off",
            _xAutocompletetype: "nume-full",
            _class: "",
            _input: "name",
            _type: "text",
            _name: "firstName"
          },
          {
            _label: "name",
            _prop: "name",
            _placeholder: false,
            _help: false,
            _multiple: false,
            _required: true,
            _pattern: null,
            _model: false,
            _disabled: false,
            _autocapitalize: "on",
            _autocomplete: "name",
            _autocorrect: "off",
            _spellcheck: "off",
            _xAutocompletetype: "nume-full",
            _class: "",
            _value: undefined,
            _input: "name",
            _type: "text",
            _name: "name"
          },
          {
            _label: "email",
            _prop: "email",
            _placeholder: false,
            _help: false,
            _multiple: false,
            _required: true,
            _pattern: null,
            _model: false,
            _disabled: false,
            _autocapitalize: "off",
            _autocomplete: "email",
            _autocorrect: "off",
            _spellcheck: false,
            _xAutocompletetype: false,
            _class: "",
            _input: "email",
            _type: "text",
            _value: undefined,
            spellcheck: "off",
            xAutocompletetype: "email",
            _name: "email"
          }
        ]
      }
    ]);
  });
});
