import { describe, expect, test } from 'bun:test';
import formgive, { object } from '../lib/index.js';


describe('recipes', () => {
  test('email recipe sets Input + email attrs', () => {
    const Schema = object({
      email: formgive.email()
    });
    const fields = Schema.fields({ email: 'a@b.com' });

    expect(fields.email).toMatchObject({
      component: 'Input',
      type: 'email',
      autocomplete: 'email',
      value: 'a@b.com'
    });
  });


  test('password recipe sets Input + password', () => {
    const Schema = object({
      password: formgive.password()
    });
    expect(Schema.fields({}).password).toMatchObject({
      component: 'Input',
      type: 'password',
      autocomplete: 'current-password'
    });
  });


  test('dateInput does not clobber core date factory', () => {
    expect(typeof formgive.date).toBe('function');
    expect(typeof formgive.dateInput).toBe('function');
    const Schema = object({ when: formgive.dateInput() });
    expect(Schema.fields({}).when).toMatchObject({
      component: 'Input',
      type: 'date'
    });
  });


  test('textarea recipe', () => {
    const Schema = object({
      note: formgive.textarea()
    });
    expect(Schema.fields({}).note.component).toBe('Textarea');
  });


  test('address recipe is Fieldset with nested Inputs', () => {
    const Schema = object({
      home: formgive.address([{ label: 'US', value: 'US' }])
    });
    const home = Schema.fields({
      home: {
        street: '1 Main',
        locality: 'Austin',
        region: 'TX',
        postalCode: '78701',
        countryCode: 'US'
      }
    }).home;

    expect(home.component).toBe('Fieldset');
    expect(home.props.street.component).toBe('Input');
    expect(home.props.countryCode.component).toBe('Select');
  });
});
