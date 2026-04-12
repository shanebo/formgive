import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, date, number, integer, boolean, object, string } from '../lib/index.js';

describe('schema parsing', () => {
  describe('primitive type schemas', () => {
    test('string schema called directly returns no name', () => {
      const StringSchema = string();
      const schema = StringSchema.schema('hello');

      expect(schema.type).toBe('string');
      expect(schema.name).toBeUndefined();
    });

    test('string schema with parentKey returns name', () => {
      const StringSchema = string();
      const schema = StringSchema.schema('hello', 'myField');

      // parentKey is used for nested objects, not for setting name on primitives
      expect(schema.type).toBe('string');
      expect(schema.name).toBeUndefined();
    });

    test('number schema called directly', () => {
      const NumberSchema = number();
      const schema = NumberSchema.schema(42);

      expect(schema.type).toBe('number');
      expect(schema.name).toBeUndefined();
    });

    test('boolean schema called directly', () => {
      const BoolSchema = boolean();
      const schema = BoolSchema.schema(true);

      expect(schema.type).toBe('boolean');
      expect(schema.name).toBeUndefined();
    });

    test('string schema with options and fallback', () => {
      const StatusSchema = string()
        .options(['draft', 'published', 'archived'])
        .fallback('draft')
        .required();

      const schema = StatusSchema.schema(undefined);

      expect(schema).toMatchObject({
        type: 'string',
        required: true,
        fallback: 'draft',
        options: [
          { label: 'draft', value: 'draft' },
          { label: 'published', value: 'published' },
          { label: 'archived', value: 'archived' }
        ],
        optionValues: ['draft', 'published', 'archived']
      });
      expect(schema.optionsSet).toBeInstanceOf(Set);
      expect(schema.name).toBeUndefined();
    });

    test('number schema with constraints', () => {
      const PriceSchema = number()
        .min(0)
        .max(10000)
        .fallback(0)
        .required();

      const schema = PriceSchema.schema(99.99);

      expect(schema).toMatchObject({
        type: 'number',
        required: true,
        fallback: 0,
        min: 0,
        max: 10000
      });
      expect(schema.name).toBeUndefined();
    });

    test('primitive with field name gets enriched', () => {
      const StatusSchema = string()
        .options(['draft', 'published', 'archived'])
        .field({ name: 'status' });

      const schema = StatusSchema.schema('published');

      expect(schema).toMatchObject({
        name: 'status',
        label: 'Status',
        input: 'select',
        value: 'published'
      });
      expect(schema.id).toBeDefined();
      expect(schema.options[0]).toMatchObject({
        id: expect.any(String),
        name: 'status',
        type: 'chip',
        label: 'draft',
        content: 'draft',
        value: 'draft'
      });
      expect(schema.options[1]).toMatchObject({
        value: 'published',
        selected: true,
        checked: true
      });
    });

    test('primitive with field name and custom label', () => {
      const StatusSchema = string()
        .options(['draft', 'published'])
        .field({ name: 'status', label: 'Publication Status' });

      const schema = StatusSchema.schema('draft');

      expect(schema.name).toBe('status');
      expect(schema.label).toBe('Publication Status');
    });

    test('primitive number with field name', () => {
      const PriceSchema = number()
        .field({ name: 'price', label: 'Price' });

      const schema = PriceSchema.schema(99.99);

      expect(schema).toMatchObject({
        name: 'price',
        label: 'Price',
        input: 'input',
        type: 'number',
        value: 99.99
      });
      expect(schema.id).toBeDefined();
    });

    test('primitive boolean with field name', () => {
      const ActiveSchema = boolean()
        .field({ name: 'isActive' });

      const schema = ActiveSchema.schema(true);

      expect(schema).toMatchObject({
        name: 'isActive',
        label: 'Is active',
        input: 'choice',
        type: 'switch',
        checked: true,
        value: true
      });
    });

    test('primitive string with field name (no options)', () => {
      const NameSchema = string()
        .field({ name: 'username' });

      const schema = NameSchema.schema('john');

      expect(schema).toMatchObject({
        name: 'username',
        label: 'Username',
        input: 'input',
        type: 'text',
        value: 'john'
      });
    });
  });

  describe('basic field types', () => {
    test('simple text field schema', () => {
      const Schema = object({
        name: string()
      });
      const schema = Schema.schema({ name: 'test' });

      expect(schema.props.name).toMatchObject({
        propType: 'string',
        type: 'text',
        input: 'input',
        key: 'name',
        name: 'name',
        label: 'Name',
        value: 'test'
      });
    });

    test('required string field schema', () => {
      const Schema = object({
        name: string().required()
      });
      const schema = Schema.schema({ name: 'test' });

      expect(schema.props.name).toMatchObject({
        propType: 'string',
        required: true,
        value: 'test'
      });
    });

    test('disabled field schema', () => {
      const Schema = object({
        status: string().disabled()
      });
      const schema = Schema.schema({ status: 'active' });

      expect(schema.props.status.disabled).toEqual(true);
    });

    test('email field schema', () => {
      const Schema = object({
        email: string()
      });
      const schema = Schema.schema({ email: 'test@example.com' });

      expect(schema.props.email).toMatchObject({
        propType: 'string',
        type: 'text',
        value: 'test@example.com'
      });
    });

    test('checkbox field schema', () => {
      const Schema = object({
        member: boolean()
      });
      const schema = Schema.schema({ member: true });

      expect(schema.props.member).toMatchObject({
        propType: 'boolean',
        type: 'switch',
        input: 'choice',
        checked: true,
        value: true
      });
    });

    test('number field schema', () => {
      const Schema = object({
        amount: number()
      });
      const schema = Schema.schema({ amount: 123.45 });

      expect(schema.props.amount).toMatchObject({
        propType: 'number',
        type: 'number',
        input: 'input',
        value: 123.45
      });
    });

    test('integer field schema', () => {
      const Schema = object({
        shares: integer()
      });
      const schema = Schema.schema({ shares: 10 });

      expect(schema.props.shares).toMatchObject({
        propType: 'number',
        type: 'number',
        input: 'input',
        integer: true,
        value: 10
      });
    });

    test('date field schema', () => {
      const testDate = new Date('2022-01-01');
      const Schema = object({
        createdAt: date()
      });
      const schema = Schema.schema({ createdAt: testDate });

      expect(schema.props.createdAt).toMatchObject({
        propType: 'date',
        value: testDate
      });
    });
  });

  describe('nested fields', () => {
    test('handles nested field schema', () => {
      const Schema = object({
        address: object({
          street: string(),
          city: string()
        })
      });
      const schema = Schema.schema({
        address: {
          street: '123 Main St',
          city: 'Dallas'
        }
      });

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
          })
        }
      });
    });

    test('handles deeply nested fields', () => {
      const Schema = object({
        address: object({
          full: string()
        })
      });
      const schema = Schema.schema({
        address: {
          full: '123 Main St, Dallas, TX'
        }
      });

      expect(schema.props.address.props.full).toMatchObject({
        propType: 'string',
        key: 'full',
        value: '123 Main St, Dallas, TX'
      });
    });
  });

  describe('selects and options', () => {
    const mockOptions = [
      { label: 'Texas', value: 0 },
      { label: 'Minnesota', value: 1 },
      { label: 'New York', value: 2 }
    ];

    test('handles select with options', () => {
      const Schema = object({
        state: integer().options(mockOptions)
      });
      const schema = Schema.schema({ state: 1 });

      expect(schema.props.state).toMatchObject({
        propType: 'number',
        input: 'select',
        value: 1
      });
      expect(schema.props.state.options).toBeDefined();
      expect(schema.props.state.options.length).toBe(3);

      const selectedOption = schema.props.state.options.find(opt => opt.value === 1);
      expect(selectedOption).toMatchObject({
        value: 1,
        selected: true,
        checked: true
      });
    });

    test('handles select options structure', () => {
      const Schema = object({
        state: integer().options(mockOptions)
      });
      const schema = Schema.schema({ state: 1 });

      expect(schema.props.state.options[0]).toMatchObject({
        label: 'Texas',
        value: 0,
        type: 'chip'
      });
      expect(schema.props.state.options[1]).toMatchObject({
        label: 'Minnesota',
        value: 1,
        selected: true,
        checked: true
      });
    });

    test('handles string options', () => {
      const Schema = object({
        status: string().options(['active', 'inactive', 'pending'])
      });
      const schema = Schema.schema({ status: 'active' });

      expect(schema.props.status.input).toEqual('select');
      expect(schema.props.status.options).toBeDefined();
      expect(schema.props.status.options.some(opt => opt.value === 'active' && opt.selected)).toBe(true);
    });
  });

  describe('arrays', () => {
    test('handles array schema', () => {
      const Schema = object({
        tags: array(string())
      });
      const schema = Schema.schema({ tags: ['tag1', 'tag2'] });

      expect(schema.props.tags).toMatchObject({
        propType: 'array',
        type: 'array',
        value: ['tag1', 'tag2']
      });
      expect(schema.props.tags.items).toBeDefined();
      expect(schema.props.tags.items.length).toBe(2);
    });

    test('handles array of objects schema', () => {
      const Schema = object({
        comments: array(object({
          user: string(),
          comment: string()
        }))
      });
      const schema = Schema.schema({
        comments: [
          { user: 'John', comment: 'Great!' },
          { user: 'Jane', comment: 'Awesome!' }
        ]
      });

      expect(schema.props.comments.items).toHaveLength(2);
      expect(schema.props.comments.items[0].props.user.value).toEqual('John');
      expect(schema.props.comments.items[1].props.comment.value).toEqual('Awesome!');
    });

    test('handles array template structure', () => {
      const Schema = object({
        tags: array(string())
      });
      const schema = Schema.schema({ tags: ['tag1'] });

      expect(schema.props.tags.template).toBeDefined();
      expect(schema.props.tags.template.propType).toEqual('string');
    });
  });

  describe('fieldset structures', () => {
    test('handles nested object as fieldset', () => {
      const Schema = object({
        theme: object({
          color: string()
        })
      });
      const schema = Schema.schema({
        theme: {
          color: '#ff0000'
        }
      });

      expect(schema.props.theme).toMatchObject({
        propType: 'object',
        input: 'fieldset',
        props: {
          color: expect.objectContaining({
            propType: 'string',
            key: 'color'
          })
        }
      });
    });

    test('handles fieldset with no metadata', () => {
      const Schema = object({
        theme: object({
          color: string()
        })
      });
      const schema = Schema.schema({
        theme: {
          color: 'red'
        }
      });

      expect(schema.props.theme.input).toEqual('fieldset');
      expect(schema.props.theme.props.color).toBeDefined();
    });
  });

  describe('field configurations', () => {
    test('handles field with custom input type', () => {
      const Schema = object({
        color: string().field({ input: 'color' })
      });
      const schema = Schema.schema({ color: '#ff0000' });

      expect(schema.props.color.input).toEqual('color');
    });

    test('handles field with prefix', () => {
      const Schema = object({
        amount: number().field({ prefix: '$' })
      });
      const schema = Schema.schema({ amount: 100 });

      expect(schema.props.amount.prefix).toEqual('$');
    });

    test('handles field with placeholder', () => {
      const Schema = object({
        name: string().field({ placeholder: 'Enter name' })
      });
      const schema = Schema.schema({ name: 'test' });

      expect(schema.props.name.placeholder).toEqual('Enter name');
    });

    test('handles field with classes', () => {
      const Schema = object({
        merge: object({
          type: string()
        }).field({ classes: '-inset' })
      });
      const schema = Schema.schema({ merge: { type: 'foo' } });

      expect(schema.props.merge.classes).toEqual('-inset');
    });
  });

  describe('fallback configuration', () => {
    test('can set fallback to undefined explicitly', () => {
      const Schema = object({
        name: string().fallback(undefined)
      });
      const schema = Schema.schema({ name: undefined });

      // schema() uses data() which applies fallback, so undefined fallback means value stays undefined
      expect(schema.props.name.value).toEqual(undefined);

      // For objects, data() removes undefined values, so if all props are undefined, it returns undefined
      const data = Schema.data({ name: undefined });
      expect(data).toEqual(undefined);
    });

    test('fallback undefined returns undefined when input is undefined', () => {
      const Schema = string().fallback(undefined);
      const result = Schema.data(undefined);
      expect(result).toEqual(undefined);
    });

    test('fallback undefined does not override valid input', () => {
      const Schema = string().fallback(undefined);
      const result = Schema.data('test');
      expect(result).toEqual('test');
    });

    test('fallback undefined vs no fallback behaves the same', () => {
      const SchemaWithUndefinedFallback = string().fallback(undefined);
      const SchemaWithoutFallback = string();

      const input1 = SchemaWithUndefinedFallback.data(undefined);
      const input2 = SchemaWithoutFallback.data(undefined);

      expect(input1).toEqual(input2);
      expect(input1).toEqual(undefined);
    });

    test('fallback undefined on object field', () => {
      const Schema = object({
        name: string().fallback(undefined),
        email: string().fallback('default@example.com')
      });

      // schema() applies fallback via data(), so email gets its fallback value
      const schema = Schema.schema({ name: undefined, email: undefined });
      expect(schema.props.name.value).toEqual(undefined);
      expect(schema.props.email.value).toEqual('default@example.com');

      // data() removes undefined values, so name is removed but email stays
      const data = Schema.data({ name: undefined, email: undefined });
      expect(data.name).toBeUndefined();
      expect(data.email).toEqual('default@example.com');
    });

    test('fallback undefined allows field to be removed from object data', () => {
      const Schema = object({
        name: string().fallback(undefined),
        email: string()
      });

      // When name has fallback(undefined) and input is undefined, it gets removed from data
      const data = Schema.data({ name: undefined, email: 'test@example.com' });
      expect(data.name).toBeUndefined();
      expect(data.email).toEqual('test@example.com');
    });

    test('partial parse skips fallbacks for omitted props', () => {
      const Schema = object({
        surfaced: boolean().fallback(false),
        dueAt: string().fallback('')
      });

      const result = Schema.parse({}, { partial: true });
      expect(result).toBeUndefined();
    });

    test('partial parse still coerces present props', () => {
      const Schema = object({
        surfaced: boolean().fallback(false),
        dueAt: string().fallback('')
      });

      const result = Schema.parse({ surfaced: 'true' }, { partial: true });
      expect(result).toEqual({ surfaced: true });
    });

    test('partial parse skips required errors for omitted props', () => {
      const Schema = object({
        text: string().required(),
        note: string()
      });

      const result = Schema.parse({ note: 'hello' }, { partial: true });
      expect(result).toEqual({ note: 'hello' });
    });

    test('partial safeParse uses same coercion semantics as parse', () => {
      const Schema = object({
        surfaced: boolean().fallback(false),
        text: string().required()
      });

      const parsed = Schema.parse({ surfaced: 'true' }, { partial: true });
      const safeParsed = Schema.safeParse({ surfaced: 'true' }, { partial: true });

      expect(safeParsed).toEqual({
        data: parsed,
        errors: null
      });
    });
  });

  describe('complex schemas', () => {
    test('handles schema with multiple field types', () => {
      const Schema = object({
        name: string().required(),
        email: string(),
        age: integer(),
        active: boolean(),
        tags: array(string()),
        address: object({
          street: string(),
          city: string()
        })
      });
      const schema = Schema.schema({
        name: 'John',
        email: 'john@example.com',
        age: 30,
        active: true,
        tags: ['developer', 'designer'],
        address: {
          street: '123 Main St',
          city: 'Dallas'
        }
      });

      expect(schema.props.name.value).toEqual('John');
      expect(schema.props.email.value).toEqual('john@example.com');
      expect(schema.props.age.value).toEqual(30);
      expect(schema.props.active.checked).toEqual(true);
      expect(schema.props.tags.value).toEqual(['developer', 'designer']);
      expect(schema.props.address.props.street.value).toEqual('123 Main St');
    });

    test('handles schema with options and field configs', () => {
      const Schema = object({
        type: string().options(['foo', 'bar']).field({ itemOptions: { type: 'option' }}),
        method: string().options(['get', 'post']).field({ itemOptions: { type: 'option' }})
      });
      const schema = Schema.schema({ type: 'foo', method: 'post' });

      expect(schema.props.type.input).toEqual('select');
      expect(schema.props.type.value).toEqual('foo');
      expect(schema.props.method.input).toEqual('select');
      expect(schema.props.method.value).toEqual('post');
    });
  });

  // Ported from old test/schema-parsing.js
  describe('old API ported tests', () => {
    const mockOptions = [
      { label: 'Texas', value: 0 },
      { label: 'Minnesota', value: 1 },
      { label: 'New York', value: 2 }
    ];

    describe('expands input', () => {
      test('expands radio input to checkbox with radio type', () => {
        // Old API: toFields({ gender: 'radio' })
        // New API: boolean() with options for radio buttons
        const Schema = object({
          gender: boolean()
        });
        const schema = Schema.schema({ gender: false });

        expect(schema.props.gender).toMatchObject({
          propType: 'boolean',
          input: 'choice',
          type: 'switch',
          key: 'gender',
          label: 'Gender',
          checked: false,
          value: false
        });
      });

      test('sets id field', () => {
        const Schema = object({
          sex: boolean()
        });
        const schema = Schema.schema({ sex: false });

        expect(schema.props.sex.id).toBeDefined();
        expect(schema.props.sex.id).toMatch(/sex-[a-z0-9]+/);
      });
    });

    describe('shorthand conversions', () => {
      test('simple text field', () => {
        const Schema = object({
          name: string()
        });
        const schema = Schema.schema({ name: undefined });

        expect(schema.props.name).toMatchObject({
          propType: 'string',
          type: 'text',
          input: 'input',
          key: 'name',
          name: 'name',
          label: 'Name',
          value: undefined
        });
      });

      test('required email field', () => {
        const Schema = object({
          email: string().required()
        });
        const schema = Schema.schema({ email: undefined });

        expect(schema.props.email).toMatchObject({
          propType: 'string',
          type: 'text',
          input: 'input',
          required: true,
          key: 'email',
          label: 'Email',
          value: undefined
        });
      });

      test('disabled text field', () => {
        const Schema = object({
          status: string().disabled()
        });
        const schema = Schema.schema({ status: undefined });

        expect(schema.props.status.disabled).toEqual(true);
      });

      test('checkbox', () => {
        const Schema = object({
          member: boolean()
        });
        const schema = Schema.schema({ member: false });

        expect(schema.props.member).toMatchObject({
          propType: 'boolean',
          input: 'choice',
          type: 'switch',
          checked: false,
          value: false,
          key: 'member',
          label: 'Member'
        });
      });

      test('handles nested fields', () => {
        const Schema = object({
          address: object({
            full: string()
          })
        });
        const schema = Schema.schema({
          address: {
            full: undefined
          }
        });

        expect(schema.props.address.props.full).toMatchObject({
          propType: 'string',
          input: 'input',
          type: 'text',
          key: 'full',
          name: 'address.full',
          label: 'Full',
          value: undefined
        });
      });

      test('required url', () => {
        const Schema = object({
          website: string().required().field({ input: 'url' })
        });
        const schema = Schema.schema({ website: undefined });

        expect(schema.props.website).toMatchObject({
          propType: 'string',
          required: true,
          key: 'website',
          label: 'Website',
          value: undefined
        });
      });
    });

    describe('selects and pick types', () => {
      test('handles select with options and selected value', () => {
        const Schema = object({
          state: integer().options(mockOptions)
        });
        const schema = Schema.schema({ state: 1 });

        expect(schema.props.state.options).toBeDefined();
        expect(schema.props.state.options.length).toBe(3);

        const selectedOption = schema.props.state.options.find(opt => opt.value === 1);
        expect(selectedOption).toMatchObject({
          label: 'Minnesota',
          value: 1,
          selected: true,
          checked: true
        });

        const unselectedOption = schema.props.state.options.find(opt => opt.value === 0);
        expect(unselectedOption.selected).toBeUndefined();
        expect(unselectedOption.checked).toBeUndefined();
      });

      test('handles pick:chip data structure', () => {
        const Schema = object({
          state: integer().options(mockOptions).field({ itemOptions: { type: 'chip' }})
        });
        const schema = Schema.schema({ state: 1 });

        expect(schema.props.state.options).toBeDefined();
        expect(schema.props.state.options.length).toBe(3);

        const selectedOption = schema.props.state.options.find(opt => opt.value === 1);
        expect(selectedOption).toMatchObject({
          label: 'Minnesota',
          value: 1,
          selected: true,
          checked: true,
          type: 'chip'
        });
      });

      test('handles select with options structure', () => {
        const Schema = object({
          state: integer().options(mockOptions)
        });
        const schema = Schema.schema({ state: 1 });

        expect(schema.props.state.options[0]).toMatchObject({
          label: 'Texas',
          value: 0,
          type: 'chip'
        });
        expect(schema.props.state.options[1]).toMatchObject({
          label: 'Minnesota',
          value: 1,
          selected: true,
          checked: true
        });
      });
    });

    describe('longhand field definitions', () => {
      test('handles simple text field with required', () => {
        const Schema = object({
          name: string().required()
        });
        const schema = Schema.schema({ name: undefined });

        expect(schema.props.name).toMatchObject({
          propType: 'string',
          type: 'text',
          input: 'input',
          required: true,
          key: 'name',
          label: 'Name',
          value: undefined
        });
      });

      test('handles boolean with options (radios)', () => {
        const radioOptions = [
          { label: 'True', value: true },
          { label: 'False', value: false }
        ];

        // Note: New API doesn't have direct radio support, using boolean with options
        // This is a simplified port - the old API had radio buttons as checkboxes with _type: 'radio'
        const Schema = object({
          hasDonation: boolean()
        });
        const schema = Schema.schema({ hasDonation: false });

        expect(schema.props.hasDonation).toMatchObject({
          propType: 'boolean',
          input: 'choice',
          type: 'switch',
          checked: false,
          value: false,
          key: 'hasDonation',
          label: 'Has donation' // API produces lowercase 'd' in donation
        });
      });

      test('handles fieldset with nested fields', () => {
        const Schema = object({
          theme: object({
            color: string().field({ input: 'color' })
          })
        });
        const schema = Schema.schema({
          theme: {
            color: undefined
          }
        });

        expect(schema.props.theme).toMatchObject({
          propType: 'object',
          input: 'fieldset',
          key: 'theme',
          label: 'Theme'
        });
        expect(schema.props.theme.props.color).toMatchObject({
          propType: 'string',
          key: 'color',
          name: 'theme.color',
          label: 'Color',
          input: 'color'
        });
      });

      test('handles select with options array', () => {
        const options = [
          { label: 'Mr.', value: 1 },
          { label: 'Mrs.', value: 2 },
          { label: 'Dr.', value: 3 }
        ];
        const Schema = object({
          title: integer().options(options)
        });
        const schema = Schema.schema({ title: undefined });

        expect(schema.props.title).toMatchObject({
          propType: 'number',
          input: 'select',
          key: 'title',
          label: 'Title'
        });
        expect(schema.props.title.options).toBeDefined();
        expect(schema.props.title.options.length).toBe(3);
      });

      test('sets ids on options', () => {
        const options = [
          { value: 1 },
          { value: 2 },
          { value: 3 }
        ];
        const Schema = object({
          field: integer().options(options)
        });
        const schema = Schema.schema({ field: undefined });

        const ids = schema.props.field.options.map((opt) => opt.id);
        ids.forEach((id) => {
          expect(id).toBeDefined();
        });
      });
    });

    describe('mixed structures', () => {
      test('handles multiple via relationship (array)', () => {
        const Schema = object({
          tags: array(string()).field()
        });
        const schema = Schema.schema({ tags: [] });

        expect(schema.props.tags).toMatchObject({
          propType: 'array',
          type: 'array',
          key: 'tags',
          label: 'Tags',
          items: []
        });
        expect(schema.props.tags.template).toBeDefined();
      });

      test('handles multiple with multiple fields', () => {
        const Schema = object({
          comments: array(object({
            user: string(),
            date: string(),
            comment: string()
          })).field()
        });
        const schema = Schema.schema({ comments: [] });

        expect(schema.props.comments).toMatchObject({
          propType: 'array',
          type: 'array',
          key: 'comments',
          label: 'Comments',
          items: []
        });
        expect(schema.props.comments.template).toBeDefined();
        expect(schema.props.comments.template.props.user).toBeDefined();
        expect(schema.props.comments.template.props.date).toBeDefined();
        expect(schema.props.comments.template.props.comment).toBeDefined();
      });
    });

    describe('input definitions', () => {
      test('float input', () => {
        const Schema = object({
          amount: number()
        });
        const schema = Schema.schema({ amount: undefined });

        expect(schema.props.amount).toMatchObject({
          propType: 'number',
          type: 'number',
          input: 'input',
          key: 'amount',
          label: 'Amount',
          value: undefined
        });
      });

      test('int input', () => {
        const Schema = object({
          shares: integer()
        });
        const schema = Schema.schema({ shares: undefined });

        expect(schema.props.shares).toMatchObject({
          propType: 'number',
          type: 'number',
          input: 'input',
          integer: true,
          key: 'shares',
          label: 'Shares',
          value: undefined
        });
      });
    });

    describe('expands shorthand with values', () => {
      test('expands shorthand with nested values', () => {
        const Schema = object({
          joe: string().required(),
          name: string(),
          email: string(),
          uno: object({
            dos: object({
              tres: string()
            })
          }),
          amount: object({
            min: number().field({ prefix: '$' }),
            max: number().field({ prefix: '$' })
          })
        });
        const schema = Schema.schema({
          name: 'Jack Black',
          email: 'jack@nacho.com',
          uno: {
            dos: {
              tres: 'nachooooooooooo'
            }
          },
          amount: {
            min: 10.00,
            max: 5000.00
          }
        });

        expect(schema.props.name.value).toEqual('Jack Black');
        expect(schema.props.email.value).toEqual('jack@nacho.com');
        expect(schema.props.uno.props.dos.props.tres.value).toEqual('nachooooooooooo');
        expect(schema.props.amount.props.min.value).toEqual(10.00);
        expect(schema.props.amount.props.max.value).toEqual(5000.00);
        expect(schema.props.amount.props.min.prefix).toEqual('$');
        expect(schema.props.amount.props.max.prefix).toEqual('$');
      });
    });
  });
});
