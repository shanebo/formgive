import { describe, expect, test } from 'bun:test';
import { array, boolean, gone, number, object, string, when } from '../lib/index.js';


describe('conditional() method', () => {
  describe('basic presence', () => {
    test('field exists when predicate returns true', () => {
      const Schema = object({
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip')
      });

      const result = Schema.data({ type: 'chip', color: 'red' });
      expect(result.color).toBe('red');
    });

    test('field is absent when predicate returns false', () => {
      const Schema = object({
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip')
      });

      const result = Schema.data({ type: 'checkbox', color: 'red' });
      expect(result.color).toBeUndefined();
    });

    test('conditional field not rendered in schema when false', () => {
      const Schema = object({
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip')
      });

      const fields = Schema.fields({ type: 'checkbox' });
      expect(fields.color).toBeUndefined();
    });

    test('conditional field rendered in schema when true', () => {
      const Schema = object({
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip')
      });

      const fields = Schema.fields({ type: 'chip' });
      expect(fields.color).toBeDefined();
      expect(fields.color.propType).toBe('string');
    });
  });


  describe('prop order is preserved', () => {
    test('conditional fields stay in their declared position', () => {
      const Schema = object({
        label: string(),
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip'),
        face: string().conditional(({ parent }) => parent.type === 'chip'),
        help: string()
      });

      const fields = Schema.fields({ type: 'chip' });
      expect(Object.keys(fields)).toEqual(['label', 'type', 'color', 'face', 'help']);
    });

    test('inactive conditional fields are omitted from prop order', () => {
      const Schema = object({
        label: string(),
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip'),
        face: string().conditional(({ parent }) => parent.type === 'chip'),
        help: string()
      });

      const fields = Schema.fields({ type: 'checkbox' });
      expect(Object.keys(fields)).toEqual(['label', 'type', 'help']);
    });
  });


  describe('validation', () => {
    test('inactive conditional fields skip validation', () => {
      const Schema = object({
        type: string(),
        color: string().required().conditional(({ parent }) => parent.type === 'chip')
      });

      const { errors } = Schema.safeParse({ type: 'checkbox' });
      expect(errors).toBeNull();
    });

    test('active conditional fields validate normally', () => {
      const Schema = object({
        type: string(),
        color: string().required().conditional(({ parent }) => parent.type === 'chip')
      });

      const { errors } = Schema.safeParse({ type: 'chip' });
      expect(errors?.color).toBe('is required');
    });

    test('active conditional fields pass when valid', () => {
      const Schema = object({
        type: string(),
        color: string().required().conditional(({ parent }) => parent.type === 'chip')
      });

      const { errors } = Schema.safeParse({ type: 'chip', color: 'red' });
      expect(errors).toBeNull();
    });

    test('inactive conditional fields are stripped from parsed output', () => {
      const Schema = object({
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip')
      });

      const result = Schema.parse({ type: 'checkbox', color: 'red' });
      expect(result).toEqual({ type: 'checkbox' });
    });
  });


  describe('context: parent', () => {
    test('parent is the immediate container object', () => {
      const captured = {};

      const Schema = object({
        a: string(),
        b: string(),
        c: string().conditional((ctx) => {
          captured.parent = ctx.parent;
          return true;
        })
      });

      Schema.data({ a: '1', b: '2', c: '3' });
      expect(captured.parent).toMatchObject({ a: '1', b: '2', c: '3' });
    });

    test('parent is null for standalone schema (no container)', () => {
      const captured = {};

      const Schema = when((ctx) => {
        captured.parent = ctx.parent;
        return true;
      }).then(string()).otherwise(gone());

      Schema.data('hello');
      expect(captured.parent).toBeNull();
    });

    test('parent for nested object is the nested container, not root', () => {
      const captured = {};

      const Schema = object({
        type: string(),
        settings: object({
          color: string().conditional((ctx) => {
            captured.parent = ctx.parent;
            return true;
          })
        })
      });

      Schema.data({ type: 'chip', settings: { color: 'red' } });
      expect(captured.parent).toMatchObject({ color: 'red' });
      expect(captured.parent.type).toBeUndefined();
    });
  });


  describe('context: input (raw root)', () => {
    test('input is the raw root object', () => {
      const captured = {};

      const Schema = object({
        type: string(),
        color: string().conditional((ctx) => {
          captured.input = ctx.input;
          return true;
        })
      });

      Schema.data({ type: 'chip', color: 'red' });
      expect(captured.input).toMatchObject({ type: 'chip', color: 'red' });
    });

    test('input in nested object is still the root, not the nested container', () => {
      const captured = {};

      const Schema = object({
        type: string(),
        settings: object({
          color: string().conditional((ctx) => {
            captured.input = ctx.input;
            return true;
          })
        })
      });

      Schema.data({ type: 'chip', settings: { color: 'red' } });
      expect(captured.input).toMatchObject({ type: 'chip', settings: { color: 'red' } });
    });
  });


  describe('context: value', () => {
    test('value is the coerced current field value', () => {
      const captured = {};

      const Schema = object({
        count: number().conditional((ctx) => {
          captured.value = ctx.value;
          return true;
        })
      });

      Schema.data({ count: '5' });
      expect(captured.value).toBe(5);
    });

    test('value can be used in the predicate', () => {
      const Schema = object({
        count: number(),
        label: string().conditional(({ value }) => value !== undefined && value.length > 0)
      });

      expect(Schema.data({ count: 1, label: 'hi' }).label).toBe('hi');
      expect(Schema.data({ count: 1, label: '' }).label).toBeUndefined();
    });
  });


  describe('multiple conditionals with same predicate', () => {
    test('multiple fields respond independently to same sibling', () => {
      const Schema = object({
        type: string(),
        color: string().conditional(({ parent }) => parent.type === 'chip'),
        face: string().conditional(({ parent }) => parent.type === 'chip'),
        size: string().conditional(({ parent }) => parent.type === 'chip')
      });

      const active = Schema.data({ type: 'chip', color: 'red', face: 'soft', size: 'sm' });
      expect(active).toMatchObject({ type: 'chip', color: 'red', face: 'soft', size: 'sm' });

      const inactive = Schema.data({ type: 'checkbox', color: 'red', face: 'soft', size: 'sm' });
      expect(inactive).toEqual({ type: 'checkbox' });
    });
  });


  describe('nested objects', () => {
    test('conditional in nested object uses nested container as parent', () => {
      const Schema = object({
        type: string(),
        settings: object({
          chipType: string(),
          color: string().conditional(({ parent }) => parent.chipType === 'outlined')
        })
      });

      expect(Schema.data({
        type: 'chip',
        settings: { chipType: 'outlined', color: 'red' }
      })).toMatchObject({ settings: { chipType: 'outlined', color: 'red' } });

      expect(Schema.data({
        type: 'chip',
        settings: { chipType: 'filled', color: 'red' }
      }).settings.color).toBeUndefined();
    });

    test('can use root input via input key for cross-tree checks', () => {
      const Schema = object({
        type: string(),
        settings: object({
          color: string().conditional(({ input }) => input.type === 'chip')
        })
      });

      expect(Schema.data({
        type: 'chip',
        settings: { color: 'red' }
      }).settings.color).toBe('red');

      expect(Schema.data({
        type: 'checkbox',
        settings: { color: 'red' }
      })?.settings?.color).toBeUndefined();
    });
  });


  describe('arrays of objects', () => {
    test('conditional in array item uses item as parent', () => {
      const Schema = object({
        items: array(object({
          type: string(),
          color: string().conditional(({ parent }) => parent.type === 'chip')
        }))
      });

      const result = Schema.data({
        items: [
          { type: 'chip', color: 'red' },
          { type: 'checkbox', color: 'blue' }
        ]
      });

      expect(result.items[0].color).toBe('red');
      expect(result.items[1].color).toBeUndefined();
    });

    test('conditional in array item schema renders correctly', () => {
      const Schema = object({
        items: array(object({
          type: string(),
          color: string().conditional(({ parent }) => parent.type === 'chip')
        }))
      });

      const result = Schema.schema({
        items: [
          { type: 'chip', color: 'red' },
          { type: 'checkbox', color: 'blue' }
        ]
      });

      const { items } = result.props.items;
      expect(items[0].props.color).toBeDefined();
      expect(items[1].props.color).toBeUndefined();
    });

    test('validation in array respects conditional presence', () => {
      const Schema = object({
        items: array(object({
          type: string(),
          color: string().required().conditional(({ parent }) => parent.type === 'chip')
        }))
      });

      const { errors } = Schema.safeParse({
        items: [
          { type: 'chip', color: 'red' },   // valid: color present and type=chip
          { type: 'checkbox' }               // valid: color not required for non-chip
        ]
      });

      expect(errors).toBeNull();
    });
  });


  describe('interop with when()', () => {
    test('conditional() and when() coexist on same schema', () => {
      const Schema = object({
        mode: string(),
        type: string(),
        detail: when(({ parent }) => parent.mode === 'advanced')
          .then(string().required())
          .otherwise(gone()),
        color: string().conditional(({ parent }) => parent.type === 'chip')
      });

      expect(Schema.data({ mode: 'simple', type: 'chip', color: 'red', detail: 'x' }))
        .toEqual({ mode: 'simple', type: 'chip', color: 'red' });

      expect(Schema.data({ mode: 'advanced', type: 'checkbox', color: 'red', detail: 'x' }))
        .toEqual({ mode: 'advanced', type: 'checkbox', detail: 'x' });
    });

    test('when() now receives parent in context', () => {
      const Schema = object({
        type: string(),
        detail: when(({ parent }) => parent.type === 'chip')
          .then(string().required())
          .otherwise(gone())
      });

      expect(Schema.safeParse({ type: 'chip' }).errors).toEqual({ detail: 'is required' });
      expect(Schema.safeParse({ type: 'checkbox' }).errors).toBeNull();
    });
  });


  describe('boolean conditionals', () => {
    test('conditional field based on boolean sibling', () => {
      const Schema = object({
        advanced: boolean(),
        detail: string().conditional(({ parent }) => parent.advanced === true)
      });

      expect(Schema.data({ advanced: true, detail: 'x' }).detail).toBe('x');
      expect(Schema.data({ advanced: false, detail: 'x' }).detail).toBeUndefined();
    });
  });
});
