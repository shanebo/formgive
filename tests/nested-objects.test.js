import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { boolean, object, string } from '../lib/index.js';

describe('nested objects', () => {
  test('nested object schema', () => {
    const Schema = object({
      address: object({
        street: string(),
        city: string(),
        zip: string()
      })
    });

    const input = {
      address: {
        street: '123 Main St',
        city: 'Dallas',
        zip: '75201'
      }
    };

    const parsed = Schema.parse(input);
    expect(parsed).toEqual(input);

    const schema = Schema.schema(input);
    expect(schema.props.address).toMatchObject({
      propType: 'object',
      component: 'Fieldset',
      props: {
        street: expect.objectContaining({
          propType: 'string',
          key: 'street',
          value: '123 Main St'
        }),
        city: expect.objectContaining({
          propType: 'string',
          key: 'city',
          value: 'Dallas'
        }),
        zip: expect.objectContaining({
          propType: 'string',
          key: 'zip',
          value: '75201'
        })
      }
    });
  });

  test('deeply nested objects', () => {
    const Schema = object({
      uno: object({
        dos: object({
          tres: string()
        })
      })
    });

    const input = {
      uno: {
        dos: {
          tres: 'nachooooooooooo'
        }
      }
    };

    const parsed = Schema.parse(input);
    expect(parsed).toEqual(input);

    const schema = Schema.schema(input);
    expect(schema.props.uno.props.dos.props.tres).toMatchObject({
      propType: 'string',
      key: 'tres',
      name: 'dos.tres', // nested props use relative path
      value: 'nachooooooooooo',
      component: 'Input',
      type: 'text'
    });
  });

  test('empty object without fallback returns undefined', () => {
    const Schema = object({
      type: string(),
      method: string()
    });

    expect(Schema.data({})).toEqual(undefined);
    expect(Schema.data({ type: '' })).toEqual(undefined);
    expect(Schema.data(undefined)).toEqual(undefined);
  });

  test('empty object returns its fallback', () => {
    const Schema = object({
      type: string(),
      method: string()
    }).fallback({});

    expect(Schema.data({})).toEqual({});
    expect(Schema.data({ type: '' })).toEqual({});
    expect(Schema.data(undefined)).toEqual({});
    expect(Schema.parse({})).toEqual({});
  });

  test('object fallback is ignored once any prop has a value', () => {
    const Schema = object({
      type: string(),
      method: string()
    }).fallback({ type: 'card' });

    expect(Schema.data({ method: 'tap' })).toEqual({ method: 'tap' });
    expect(Schema.data({})).toEqual({ type: 'card' });
  });

  test('strict object with only unknown keys returns its fallback', () => {
    const Schema = object({
      type: string()
    }).fallback({});

    expect(Schema.data({ other: 'x' }, { strict: true })).toEqual({});
  });

  test('nested object fallback fills an empty child', () => {
    const Schema = object({
      name: string(),
      merge: object({
        type: string(),
        method: string()
      }).fallback({})
    });

    expect(Schema.data({ name: 'Rule', merge: { type: '' } })).toEqual({
      name: 'Rule',
      merge: {}
    });
  });

  test('null object stays null over its fallback', () => {
    const Schema = object({
      type: string()
    }).fallback({});

    expect(Schema.data(null)).toEqual(null);
  });

  test('nested partial parse skips omitted nested props', () => {
    const Schema = object({
      settings: object({
        surfaced: boolean().fallback(false),
        dueAt: string().fallback('')
      })
    });

    const parsed = Schema.parse({
      settings: {
        surfaced: 'true'
      }
    }, { partial: true });

    expect(parsed).toEqual({
      settings: {
        surfaced: true
      }
    });
  });
});
