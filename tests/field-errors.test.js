import { describe, expect, test } from 'bun:test';
import { array, gone, object, string, when } from '../lib/index.js';

describe('field errors', () => {
  const Schema = object({
    name: string().required(),
    note: string(),
    address: object({
      street: string().required(),
      city: string()
    }),
    rows: array(object({
      field: string().required(),
      value: string()
    })),
    tags: array(string().minLength(2))
  });

  test('attaches errors to fields, nested props and array rows', () => {
    const { data, errors } = Schema.safeParse({
      name: '',
      address: { city: 'Austin' },
      rows: [{ field: 'a' }, { value: 'b' }],
      tags: ['ab', 'c']
    });
    const fields = Schema.fields(data, errors);

    expect({
      name: fields.name.error,
      note: fields.note.error,
      street: fields.address.props.street.error,
      city: fields.address.props.city.error,
      rows: fields.rows.items.map(item => item.props.field.error),
      tags: fields.tags.items.map(item => item.error)
    }).toEqual({
      name: 'is required',
      note: undefined,
      street: 'is required',
      city: undefined,
      rows: [undefined, 'is required'],
      tags: [undefined, 'should be length of at least 2']
    });
  });

  test('leaves fields without an error key when there are no errors', () => {
    const { data, errors } = Schema.safeParse({
      name: 'a',
      address: { street: 'b' },
      rows: [{ field: 'c' }],
      tags: ['de']
    });
    const fields = Schema.fields(data, errors);

    expect(errors).toEqual(null);
    expect([
      fields.name,
      fields.note,
      fields.address,
      fields.address.props.street,
      fields.rows,
      fields.rows.items[0].props.field,
      fields.tags.items[0]
    ].some(field => 'error' in field)).toEqual(false);
  });

  test('puts an array rule error on the array field', () => {
    const Rows = object({
      rows: array(object({ field: string().required() })).maxLength(1)
    });
    const { data, errors } = Rows.safeParse({ rows: [{}, {}] });
    const fields = Rows.fields(data, errors);

    expect({
      rows: fields.rows.error,
      items: fields.rows.items.map(item => item.props.field.error)
    }).toEqual({
      rows: 'should be length no more than 1',
      items: [undefined, undefined]
    });
  });

  test('puts an object error on the fieldset', () => {
    const Place = object({
      address: object({ street: string() })
    });
    const { data, errors } = Place.safeParse({ address: null });
    const fields = Place.fields(data, errors);

    expect({
      address: fields.address.error,
      street: fields.address.props.street.error
    }).toEqual({
      address: 'cannot be null',
      street: undefined
    });
  });

  test('reaches arrays nested in array rows', () => {
    const Rules = object({
      rules: array(object({
        name: string().required(),
        conditions: array(object({ field: string().required() }))
      }))
    });
    const { data, errors } = Rules.safeParse({
      rules: [
        { name: 'a', conditions: [{ field: 'b' }] },
        { name: 'c', conditions: [{ field: 'd' }, {}] }
      ]
    });
    const fields = Rules.fields(data, errors);

    expect(fields.rules.items.map(rule => ({
      name: rule.props.name.error,
      conditions: rule.props.conditions.items.map(item => item.props.field.error)
    }))).toEqual([
      { name: undefined, conditions: [undefined] },
      { name: undefined, conditions: [undefined, 'is required'] }
    ]);
  });

  test('attaches errors to resolved conditional fields', () => {
    const Account = object({
      role: string(),
      code: when(({ parent }) => parent.role === 'admin')
        .then(string().required())
        .otherwise(gone())
    });
    const admin = Account.safeParse({ role: 'admin' });
    const guest = Account.safeParse({ role: 'guest' });

    expect({
      admin: Account.fields(admin.data, admin.errors).code.error,
      guest: 'code' in Account.fields(guest.data, guest.errors)
    }).toEqual({
      admin: 'is required',
      guest: false
    });
  });

  test('lines up with parsed data when blank items are dropped', () => {
    const { data, errors } = Schema.safeParse({ name: 'a', tags: ['', 'x', 'yy'] });
    const fields = Schema.fields(data, errors);

    expect({
      value: fields.tags.value,
      errors: fields.tags.items.map(item => item.error)
    }).toEqual({
      value: ['x', 'yy'],
      errors: ['should be length of at least 2', undefined]
    });
  });
});
