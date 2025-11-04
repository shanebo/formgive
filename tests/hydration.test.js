import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, number, integer, boolean, object, string } from '../lib/index.js';

describe('hydration', () => {
  test('partial hydration - only some fields provided', () => {
    const Schema = object({
      name: string(),
      email: string(),
      age: number()
    });

    const schema = Schema.schema({ name: 'John' });

    expect(schema.props.name.value).toEqual('John');
    expect(schema.props.email.value).toEqual(undefined);
    expect(schema.props.age.value).toEqual(undefined);
  });

  test('hydration with nested partial data', () => {
    const Schema = object({
      name: string(),
      address: object({
        street: string(),
        city: string(),
        zip: string()
      })
    });

    const schema = Schema.schema({
      name: 'John',
      address: {
        street: '123 Main St'
        // city and zip not provided
      }
    });

    expect(schema.props.name.value).toEqual('John');
    expect(schema.props.address.props.street.value).toEqual('123 Main St');
    expect(schema.props.address.props.city.value).toEqual(undefined);
    expect(schema.props.address.props.zip.value).toEqual(undefined);
  });

  test('hydration with array partial data', () => {
    const Schema = object({
      tags: array(object({
        name: string(),
        color: string()
      }))
    });

    const schema = Schema.schema({
      tags: [
        { name: 'tag1' }, // missing color
        { name: 'tag2', color: 'blue' }
      ]
    });

    expect(schema.props.tags.items[0].props.name.value).toEqual('tag1');
    expect(schema.props.tags.items[0].props.color.value).toEqual(undefined);
    expect(schema.props.tags.items[1].props.name.value).toEqual('tag2');
    expect(schema.props.tags.items[1].props.color.value).toEqual('blue');
  });

  test('hydrates checkboxes with checked state', () => {
    const Schema = object({
      help: boolean(),
      foo: boolean(),
      boo: boolean(),
      gifts: boolean()
    });

    // Boolean fields should show checked: true when value is true
    const schema = Schema.schema({
      help: true,
      foo: false,
      boo: true,
      gifts: true
    });

    expect(schema.props.help.checked).toEqual(true);
    expect(schema.props.foo.checked).toEqual(false);
    expect(schema.props.boo.checked).toEqual(true);
    expect(schema.props.gifts.checked).toEqual(true);
  });

  test('hydrates select options with selected state', () => {
    const options = [
      { label: 'John', value: 1 },
      { label: 'Peter', value: 2 },
      { label: 'Sam', value: 3 }
    ];

    const Schema = object({
      officerId: integer().options(options)
    });

    const schema = Schema.schema({ officerId: 2 });

    // Find the selected option
    const selectedOption = schema.props.officerId.options.find(opt => opt.value === 2);
    expect(selectedOption).toMatchObject({
      value: 2,
      selected: true,
      checked: true
    });

    // Other options should not be selected
    const unselectedOption = schema.props.officerId.options.find(opt => opt.value === 1);
    expect(unselectedOption.selected).toBeUndefined();
    expect(unselectedOption.checked).toBeUndefined();
  });

  test('hydrates select options with string values', () => {
    const options = [
      { label: 'Individual', value: 1 },
      { label: 'Company', value: 2 },
      { label: 'Church', value: 3 }
    ];

    const Schema = object({
      type: integer().options(options)
    });

    const schema = Schema.schema({ type: 1 });

    const selectedOption = schema.props.type.options.find(opt => opt.value === 1);
    expect(selectedOption).toMatchObject({
      value: 1,
      selected: true,
      checked: true
    });
  });

  test('hydrates pick/multiple select with array of values', () => {
    const options = [
      { label: 'Uno', value: 'UNO' },
      { label: 'Dos', value: 'DOS' },
      { label: 'Tres', value: 'TRES' }
    ];

    const Schema = object({
      flags: array(string()).options(options)
    });

    const schema = Schema.schema({ flags: ['UNO', 'TRES'] });

    // Check that multiple options are marked as checked
    const unoOption = schema.props.flags.options.find(opt => opt.value === 'UNO');
    const tresOption = schema.props.flags.options.find(opt => opt.value === 'TRES');
    const dosOption = schema.props.flags.options.find(opt => opt.value === 'DOS');

    expect(unoOption).toMatchObject({
      value: 'UNO',
      selected: true,
      checked: true
    });
    expect(tresOption).toMatchObject({
      value: 'TRES',
      selected: true,
      checked: true
    });
    expect(dosOption.selected).toBeUndefined();
    expect(dosOption.checked).toBeUndefined();
    expect(schema.props.flags.value).toEqual(['UNO', 'TRES']);
  });

  test('hydrates fields with coercion (string to number)', () => {
    const Schema = object({
      age: number(),
      active: boolean()
    });

    const schema = Schema.schema({
      age: '18', // string should be coerced to number
      active: 'true' // string should be coerced to boolean
    });

    expect(schema.props.age.value).toEqual(18);
    expect(schema.props.active.value).toEqual(true);
    expect(schema.props.active.checked).toEqual(true);
  });

  test('hydrates multiple field values in nested structures', () => {
    const Schema = object({
      type: string(),
      foo: object({
        tags: array(object({
          name: string(),
          color: string()
        }))
      })
    });

    const schema = Schema.schema({
      type: 'RESOURCE',
      foo: {
        tags: [
          { name: 'theology' },
          { name: 'practice' },
          { name: 'application' }
        ]
      }
    });

    expect(schema.props.type.value).toEqual('RESOURCE');
    expect(schema.props.foo.props.tags.items).toHaveLength(3);
    expect(schema.props.foo.props.tags.items[0].props.name.value).toEqual('theology');
    expect(schema.props.foo.props.tags.items[1].props.name.value).toEqual('practice');
    expect(schema.props.foo.props.tags.items[2].props.name.value).toEqual('application');
  });
});
