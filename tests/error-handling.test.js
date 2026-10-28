import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, object, string } from '../lib/index.js';

describe('error handling', () => {
  // Note: The new API handles errors via safeParse().errors, not hydration into schema
  // This is different from the old API which hydrated errors into _error fields

  test('validation errors are returned via safeParse', () => {
    const Schema = object({
      name: string().required(),
      email: string().required(),
      address: object({
        street: string().required()
      })
    });

    const result = Schema.safeParse({
      name: 'Joe Osburn'
      // email and address missing
    });

    expect(result.errors).toMatchObject({
      email: 'is required',
      address: {
        street: 'is required'
      }
    });
  });

  test('validation errors on nested fields', () => {
    const Schema = object({
      address: object({
        street: string().required()
      })
    });

    const result = Schema.safeParse({
      address: {}
      // street missing
    });

    expect(result.errors).toMatchObject({
      address: {
        street: 'is required'
      }
    });
  });

  test('validation errors on arrays', () => {
    const Schema = object({
      tags: array(object({
        name: string().required()
      }))
    });

    const result = Schema.safeParse({
      tags: [
        { name: 'theology' },
        {} // missing name should fail validation
      ]
    });

    expect(result.errors).toEqual({
      tags: [
        null,
        { name: 'is required' }
      ]
    });
  });

  test('safeParse can skip validation', () => {
    const Schema = object({
      name: string().required()
    });

    const result = Schema.safeParse({}, { validate: false });

    expect(result).toEqual({
      data: undefined,
      errors: null
    });
  });

  test('safeParse can preserve unknown props with strict false', () => {
    const Schema = object({
      name: string()
    });

    const result = Schema.safeParse({
      name: 'Joe',
      href: '/layers'
    }, { strict: false });

    expect(result).toEqual({
      data: {
        name: 'Joe',
        href: '/layers'
      },
      errors: null
    });
  });
});
