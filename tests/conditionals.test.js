import { describe, expect, test } from 'bun:test';
import { gone, number, object, string, when } from '../lib/index.js';

describe('conditionals', () => {
  test('fields() returns resolved object props', () => {
    const Interface = object({
      role: string().fallback('member'),
      parentId: when(({ value }) => value === 'list')
        .then(string().field({ input: 'hidden' }).fallback('list'))
        .else(string().options(['list', 'abc']).fallback('list'))
    });

    const hiddenFields = Interface.fields({ parentId: 'list' });
    const selectFields = Interface.fields({ parentId: 'abc' });

    expect(hiddenFields.parentId.input).toBe('hidden');
    expect(selectFields.parentId.input).toBe('select');
  });

  test('gone() omits the prop from schema data and validation', () => {
    const Interface = object({
      role: string().required(),
      adminCode: when(({ input }) => input.role === 'admin')
        .then(string().required())
        .else(gone())
    });

    expect(Interface.fields({ role: 'member' }).adminCode).toBeUndefined();
    expect(Interface.parse({ role: 'member', adminCode: 'ignore-me' })).toEqual({
      role: 'member'
    });
    expect(Interface.safeParse({ role: 'member' })).toEqual({
      data: { role: 'member' },
      errors: null
    });
    expect(Interface.safeParse({ role: 'admin' }).errors).toEqual({
      adminCode: 'is required'
    });
  });

  test('conditional branch factories can build runtime schemas', () => {
    const Interface = object({
      country: string().required(),
      state: when(({ input }) => input.country === 'us')
        .then(({ input }) => string().options(input.country === 'us' ? ['tx', 'mn'] : ['on']).required())
        .else(gone())
    });

    const fields = Interface.fields({
      country: 'us'
    });

    expect(fields.state.options.map(({ value }) => value)).toEqual(['tx', 'mn']);
    expect(Interface.safeParse({ country: 'us', state: 'tx' }).errors).toBeNull();
  });

  test('nested conditionals resolve the active branch through schema parse and validate', () => {
    const Interface = object({
      type: string().required(),
      mode: string().required(),
      detail: when(({ input }) => input.type === 'chip')
        .then(
          when(({ input }) => input.mode === 'compact')
            .then(string().field({ input: 'hidden' }).fallback('tiny'))
            .else(string().minLength(3).required())
        )
        .else(
          when(({ input }) => input.mode === 'advanced')
            .then(number().min(10).required())
            .else(gone())
        )
    });

    expect(Interface.fields({ type: 'chip', mode: 'compact' }).detail.input).toBe('hidden');
    expect(Interface.parse({ type: 'chip', mode: 'compact' })).toEqual({
      type: 'chip',
      mode: 'compact',
      detail: 'tiny'
    });
    expect(Interface.safeParse({ type: 'chip', mode: 'full', detail: 'ok' }).errors).toEqual({
      detail: 'should be length of at least undefined'
    });
    expect(Interface.safeParse({ type: 'card', mode: 'advanced', detail: '9' }).errors).toEqual({
      detail: 'should be 10 or more'
    });
    expect(Interface.parse({ type: 'card', mode: 'simple', detail: 'discard me' })).toEqual({
      type: 'card',
      mode: 'simple'
    });
  });

  test('nested conditionals receive the root input', () => {
    const Interface = object({
      type: string().required(),
      settings: object({
        detail: when(({ input }) => input.type === 'chip')
          .then(string().required())
          .else(gone())
      })
    });

    expect(Interface.fields({
      type: 'chip',
      settings: { detail: 'visible' }
    }).settings.props.detail).toBeDefined();

    expect(Interface.parse({
      type: 'card',
      settings: { detail: 'discard me' }
    })).toEqual({
      type: 'card'
    });
  });
});
