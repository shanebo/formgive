import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { boolean, string, number, object } from '../lib/index.js';

describe('computed properties', () => {
  test('should call function and return result for boolean', () => {
    const Schema = object({
      isActive: boolean().computed()
    });

    const result = Schema.parse({
      isActive: () => true
    });

    expect(result.isActive).toBe(true);
  });

  test('should work with direct values (non-function)', () => {
    const Schema = object({
      isActive: boolean().computed()
    });

    const result = Schema.parse({
      isActive: true
    });

    expect(result.isActive).toBe(true);
  });

  test('should call function and return result for string', () => {
    const Schema = object({
      name: string().computed()
    });

    const result = Schema.parse({
      name: () => 'John Doe'
    });

    expect(result.name).toBe('John Doe');
  });

  test('should call function and return result for number', () => {
    const Schema = object({
      count: number().computed()
    });

    const result = Schema.parse({
      count: () => 42
    });

    expect(result.count).toBe(42);
  });

  test('should work with complex computed logic', () => {
    // Simulating URL matching logic
    const mockPathname = '/dashboard';
    const checkUrlMatches = (href) => {
      return mockPathname === href;
    };

    const Schema = object({
      isActive: boolean().computed()
    });

    const result = Schema.parse({
      isActive: () => checkUrlMatches('/dashboard')
    });

    expect(result.isActive).toBe(true);
  });

  test('should work with computed and transform together', () => {
    const Schema = object({
      status: string().computed().transform(val => val.toUpperCase())
    });

    const result = Schema.parse({
      status: () => 'active'
    });

    expect(result.status).toBe('ACTIVE');
  });

  test('should work with computed and validation', () => {
    const Schema = object({
      age: number().computed().min(18)
    });

    // Valid - function returns 25
    expect(() => {
      Schema.parse({
        age: () => 25
      });
    }).not.toThrow();

    // Invalid - function returns 15
    expect(() => {
      Schema.parse({
        age: () => 15
      });
    }).toThrow();
  });

  test('should work with computed and required', () => {
    const Schema = object({
      name: string().computed().required()
    });

    // Valid - function returns value
    expect(() => {
      Schema.parse({
        name: () => 'John'
      });
    }).not.toThrow();

    // Invalid - function returns undefined
    expect(() => {
      Schema.parse({
        name: () => undefined
      });
    }).toThrow();
  });

  test('should work with nested objects', () => {
    const Schema = object({
      user: object({
        isActive: boolean().computed()
      })
    });

    const result = Schema.parse({
      user: {
        isActive: () => true
      }
    });

    expect(result.user.isActive).toBe(true);
  });

  test('should handle function that throws error', () => {
    const Schema = object({
      value: string().computed()
    });

    expect(() => {
      Schema.parse({
        value: () => {
          throw new Error('Function error');
        }
      });
    }).toThrow('Function error');
  });

  test('should work with computed in array validation', () => {
    const Schema = object({
      tags: object({
        items: object({
          isSelected: boolean().computed()
        })
      })
    });

    const result = Schema.parse({
      tags: {
        items: {
          isSelected: () => true
        }
      }
    });

    expect(result.tags.items.isSelected).toBe(true);
  });

  test('should work with transform, computed, and modifier together', () => {
    const Schema = object({
      isActive: boolean().transform(val => val === 'on' ? true : val).computed().modifier()
    });

    // Test with function input
    const schema1 = Schema.schema({
      isActive: () => 'on'
    });
    expect(schema1.props.isActive.value).toBe(true);
    expect(schema1.props.isActive.modifier).toBe('is-active');

    // Test with direct 'on' input
    const schema2 = Schema.schema({
      isActive: 'on'
    });
    expect(schema2.props.isActive.value).toBe(true);
    expect(schema2.props.isActive.modifier).toBe('is-active');

    // Test with direct true input
    const schema3 = Schema.schema({
      isActive: true
    });
    expect(schema3.props.isActive.value).toBe(true);
    expect(schema3.props.isActive.modifier).toBe('is-active');
  });

  test('should call computed function without arguments', () => {
    const Schema = object({
      href: string(),
      isActive: boolean().computed()
    });

    const result = Schema.parse({
      href: '/dashboard',
      isActive: () => {
        // Computed function called without arguments
        return true;
      }
    });

    expect(result.href).toBe('/dashboard');
    expect(result.isActive).toBe(true);
  });

  test('should call computed function without arguments in nested objects', () => {
    const Schema = object({
      user: object({
        name: string(),
        isAdmin: boolean().computed()
      })
    });

    const result = Schema.parse({
      user: {
        name: 'admin',
        isAdmin: () => {
          // Computed function called without arguments
          return true;
        }
      }
    });

    expect(result.user.name).toBe('admin');
    expect(result.user.isAdmin).toBe(true);
  });
});
