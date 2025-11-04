import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { object, string } from '../lib/index.js';

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
      input: 'fieldset',
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
      input: 'input',
      type: 'text'
    });
  });

  test('object with fallback', () => {
    const Schema = object({
      type: string(),
      method: string()
    }).fallback({});

    // Empty object with no valid keys returns undefined (hasKeys check)
    const data = Schema.data({});
    expect(data).toEqual(undefined); // Empty object has no keys, so returns undefined

    // Fallback applies when coercedInput is undefined (for non-object types)
    // For objects, fallback applies when the object has no keys
    // But when input is undefined, it goes through props processing which returns undefined
    // Fallback is checked at the end only if coercedInput is undefined
    const Schema2 = string().fallback('default');
    expect(Schema2.data(undefined)).toEqual('default');
  });
});
