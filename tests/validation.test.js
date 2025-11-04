import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, object, string } from '../lib/index.js';

describe('validation', () => {
  test('required field validation', () => {
    const Schema = object({
      name: string().required(),
      email: string()
    });

    expect(() => Schema.parse({ email: 'test@example.com' })).toThrow();

    const result = Schema.safeParse({ email: 'test@example.com' });
    expect(result.errors).toMatchObject({
      name: 'is required'
    });
  });

  test('array validation with required fields', () => {
    const Schema = object({
      items: array(object({
        name: string().required(),
        value: string().required()
      }))
    });

    const result = Schema.safeParse({
      items: [
        { name: 'test' },
        { value: 'value' }
      ]
    });

    expect(result.errors).toMatchObject({
      items: [
        { value: 'is required' },
        { name: 'is required' }
      ]
    });
  });

  test('nested object validation', () => {
    const Schema = object({
      address: object({
        street: string().required(),
        city: string().required()
      })
    });

    const result = Schema.safeParse({
      address: {
        street: '123 Main St'
      }
    });

    expect(result.errors).toMatchObject({
      address: {
        city: 'is required'
      }
    });
  });
});
