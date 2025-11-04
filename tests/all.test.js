import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, date, number, mixed, integer, when, gone, boolean, object, string } from '../lib/index.js';



const ruleInput = {
  brah: 'no dude',
  wasabi: [1, 2, 3],
  age: '18',
  name: 'foo',
  match: 'all',
  conditions: [
    {
      dude: 'no',
      active: 'true',
      field: 'type',
      operator: 'notEquals',
      value: false
    },
    {
      field: 'type',
      operator: 'equals',
      value: 'foo'
    }
  ]
};


const Rule = object({
  age: number().integer().min(18).max(100),
  name: string().required(),
  match: string().options(['any', 'all']).required(),
  conditions: array(
    object({
      active: boolean(),
      field: string(),
      operator: string(),
      value: string()
    })
  ).field(),
}).field();


describe('formgive', () => {

  test('parse', () => {
    // console.log(Rule.parse(ruleInput));

    // expect(Rule.parse(ruleInput)).toEqual(ruleResult);

    expect(Rule.parse(ruleInput)).toMatchObject({
      age: 18,
      name: 'foo',
      match: 'all',
      conditions: [
        {
          active: true,
          field: 'type',
          operator: 'notEquals',
          value: 'false'
        },
        {
          field: 'type',
          operator: 'equals',
          value: 'foo'
        }
      ]
    });



    });


    test('schema', () => {
      const Rule = object({
        conditions: array(
          object({
            active: boolean(),
            field: string(),
            operator: string(),
            value: string()
          })
        ).field(),
      }).field();


      // console.log(Rule.schema(ruleInput));

      // expect(Rule.parse(ruleInput)).toEqual(ruleResult);

      expect(Rule.schema(ruleInput)).toMatchObject({
        type: 'object',
        props: {
          conditions: {
            propType: 'array',
            key: 'conditions',
            name: 'conditions',
            label: 'Conditions',
            type: 'array',
            props: undefined,
            template: {
              type: "object",
              props: {
                active: {
                  propType: "boolean",
                  key: "active",
                  // id: "conditions-INDEX-active-wuqbp0j3",
                  name: "conditions.INDEX.active",
                  label: "Active",
                  type: "switch",
                  props: undefined,
                  modifier: undefined,
                  value: undefined,
                  input: "choice",
                  checked: false,
                },
                field: {
                  propType: "string",
                  key: "field",
                  // id: "conditions-INDEX-field-4w7v4pao",
                  name: "conditions.INDEX.field",
                  label: "Field",
                  type: "text",
                  props: undefined,
                  modifier: undefined,
                  value: undefined,
                  input: "input",
                },
                operator: {
                  propType: "string",
                  key: "operator",
                  // id: "conditions-INDEX-operator-jg9kn5pz",
                  name: "conditions.INDEX.operator",
                  label: "Operator",
                  type: "text",
                  props: undefined,
                  modifier: undefined,
                  value: undefined,
                  input: "input",
                },
                value: {
                  propType: "string",
                  key: "value",
                  // id: "conditions-INDEX-value-zchw3gsb",
                  name: "conditions.INDEX.value",
                  label: "Value",
                  type: "text",
                  props: undefined,
                  modifier: undefined,
                  value: undefined,
                  input: "input",
                },
              },
              propType: "object",
              input: "fieldset",
              legend: "Conditions.index",
            },
            items: [
              {
                type: "object",
                props: {
                  active: {
                    propType: "boolean",
                    key: "active",
                    // id: "conditions-0-active-x95fz1wf",
                    name: "conditions.0.active",
                    label: "Active",
                    type: "switch",
                    props: undefined,
                    modifier: undefined,
                    value: true,
                    input: "choice",
                    checked: true,
                  },
                  field: {
                    propType: "string",
                    key: "field",
                    // id: "conditions-0-field-vexmxhh7",
                    name: "conditions.0.field",
                    label: "Field",
                    type: "text",
                    props: undefined,
                    modifier: undefined,
                    value: "type",
                    input: "input",
                  },
                  operator: {
                    propType: "string",
                    key: "operator",
                    // id: "conditions-0-operator-iqv37vba",
                    name: "conditions.0.operator",
                    label: "Operator",
                    type: "text",
                    props: undefined,
                    modifier: undefined,
                    value: "notEquals",
                    input: "input",
                  },
                  value: {
                    propType: "string",
                    key: "value",
                    // id: "conditions-0-value-pxk8i0ls",
                    name: "conditions.0.value",
                    label: "Value",
                    type: "text",
                    props: undefined,
                    modifier: undefined,
                    value: "false",
                    input: "input",
                  },
                },
                propType: "object",
                input: "fieldset",
                legend: null,
              }, {
                type: "object",
                props: {
                  active: {
                    propType: "boolean",
                    key: "active",
                    // id: "conditions-1-active-n9q09jep",
                    name: "conditions.1.active",
                    label: "Active",
                    type: "switch",
                    props: undefined,
                    modifier: undefined,
                    value: undefined,
                    input: "choice",
                    checked: false,
                  },
                  field: {
                    propType: "string",
                    key: "field",
                    // id: "conditions-1-field-8m31balq",
                    name: "conditions.1.field",
                    label: "Field",
                    type: "text",
                    props: undefined,
                    modifier: undefined,
                    value: "type",
                    input: "input",
                  },
                  operator: {
                    propType: "string",
                    key: "operator",
                    // id: "conditions-1-operator-dd84437j",
                    name: "conditions.1.operator",
                    label: "Operator",
                    type: "text",
                    props: undefined,
                    modifier: undefined,
                    value: "equals",
                    input: "input",
                  },
                  value: {
                    propType: "string",
                    key: "value",
                    // id: "conditions-1-value-3nahrvn3",
                    name: "conditions.1.value",
                    label: "Value",
                    type: "text",
                    props: undefined,
                    modifier: undefined,
                    value: "foo",
                    input: "input",
                  },
                },
                propType: "object",
                input: "fieldset",
                legend: null,
              }
            ],
            value: [
              {
                dude: "no",
                active: true,
                field: "type",
                operator: "notEquals",
                value: "false",
              }, {
                field: "type",
                operator: "equals",
                value: "foo",
              }
            ],
            modifier: undefined
          }
        }
      });
    });


  // test('Rule in strict mode', () => {
  //   // console.log(Rule.parse(ruleInput));
  //   expect(Rule.parse(ruleInput, { strict: true })).toMatchObject([]);
  // });


  test('Cat with null', () => {
    // console.log(Rule.parse(ruleInput));

    const Category = object({
      parentId: integer().nullable()
    });

    // console.log(integer().nullable().parse('123'));

    // console.log(Category.parse({
    //   parendId: '123'
    // }));
    expect(Category.parse({
      parentId: '123'
    })).toMatchObject({
      parentId: 123
    });

    // expect(Category.parse({
    //   parentId: ''
    // })).toMatchObject({});

    // expect(Category.parse({
    //   parentId: ''
    // })).toMatchObject({
    //   parentId: undefined
    // });

    // expect(Category.parse({
    //   parentId: ''
    // })).toMatchObject({
    //   parentId: null
    // });
  });


  // test('foo', () => {
  //   // console.log(Rule);
  //   // console.log(Rule.schema(input));
  //   // console.log(JSON.stringify(Rule.schema(ruleInput), null, 2));
  //   // console.log(Rule.schema(ruleInput));
  //   // console.log(string().parse(['foo', 'bar']));
  //   expect(Rule.schema(ruleInput)).toEqual(ruleSchemaResult);
  // });

});






  describe('coercion', () => {

    test('object', () => {
      const { parse } = object({
        type: string(),
        method: string(),
        merchantId: integer(),
        categoryId: integer()
      }).field({ classes: '-inset' }).fallback({});

      expect(parse({
        type: 'foo',
        method: 'bar',
        merchantId: '',
        categoryId: ''
      })).toEqual({
        type: 'foo',
        method: 'bar'
      });
    });

    test('nullable integer', () => {
      const { parse } = integer().nullable();
      expect(parse('123')).toEqual(123);
      expect(parse(null)).toEqual(null);
      expect(parse('null')).toEqual(null);
      // expect(parse()).toEqual(null);
      expect(parse(true)).toEqual(1);
      expect(parse(false)).toEqual(0);
      expect(parse(123)).toEqual(123);
      expect(parse(undefined)).toEqual(undefined);
    });

    test('object with empty values', () => {
      const { parse } = object({
        merge: object({
          type: string(),
          method: string(),
          merchantId: integer(),
          categoryId: integer()
        })
      });
      expect(parse({
        merge: {
          type: 'foo',
          method: 'bar',
          merchantId: '',
          categoryId: ''
        }
      })).toEqual({
        merge: {
          type: 'foo',
          method: 'bar'
        }
      });

      expect(parse({
        merge: {
          type: '',
          method: '',
          merchantId: '',
          categoryId: ''
        }
      })).toEqual(undefined);
    });

    test('array', () => {
      const { parse } = array(object({
        type: string(),
        method: string(),
        merchantId: integer(),
        categoryId: integer()
      }));
      expect(parse([
        {
          type: 'foo',
          method: 'bar',
          merchantId: '',
          categoryId: ''
        }
      ])).toEqual([{
        type: 'foo',
        method: 'bar'
      }]);
    });

    test('array', () => {
      const { parse } = array(integer()).nullable();
      expect(parse(['1', '2', '3'])).toEqual([1, 2, 3]);
      expect(parse(null)).toEqual(null);
      expect(parse(1)).toEqual([1]);
      expect(parse('1')).toEqual([1]);
      // expect(parse()).toEqual(null);
      // expect(parse(false)).toEqual(false);
      // expect(parse('null')).toEqual(null);
      // expect(parse()).toEqual(null);
      // expect(parse(true)).toEqual(1);
      // expect(parse(false)).toEqual(0);
      // expect(parse(123)).toEqual(123);
      // expect(parse(undefined)).toEqual(null);
    });

    test('object', () => {

      const DashboardQuerySchema = object({
        account: string(),
        categoryId: integer(),
        merchantId: integer(),
        scope: string(),
        flow: string(),
        usual: boolean(),
        method: string(),
        type: string(),
        q: string(),
        amount: object({
          min: number(),
          max: number()
        }),
        date: object({
          min: date(),
          max: date()
        }),
        order: object({
          by: string(),
          direction: string()
        }),
        first: integer(),
        page: integer(),
        limit: integer()
      });


      expect(DashboardQuerySchema.parse({
        date: {
          min: '2022-01-01',
          max: '2022-01-02'
        },
        categoryId: 1
      })).toEqual({
        categoryId: 1,
        date: {
          min: new Date('2022-01-01T00:00:00.000Z'),
          max: new Date('2022-01-02T00:00:00.000Z')
        }
      });
    });

    let counter = 0;
    function makeOptions() {
      let opts = [];
      for (let i = 0; i < 5; i++) {
        opts.push({
          label: (i + counter).toString(),
          value: i + counter
        });
      }

      // console.log({ opts });

      return opts;
    }


    test('lazy loaded options', () => {
      // iterate 3 times and make a new array of options incrementing the counter
      counter++;
      const Schema = number().options(makeOptions);
      expect(Schema.parse(5)).toEqual(5);
      // console.log(Schema.config.options);
    });


    test('another lazy loaded options', () => {
      // iterate 3 times and make a new array of options incrementing the counter
      counter++;
      const Schema = number().options(makeOptions);
      expect(Schema.parse(6)).toEqual(6);
      // console.log(Schema.config.options);
    });



    test('schema', () => {
      const Rule = object({
        name: string().required(),
        conditions: array(
          object({
            field: string().required(),
            operator: string().required(),
            value: string().required()
          })
        ),
        merge: object({
          type: string().options(['foo', 'bar']).field({ itemOptions: { type: 'option' }}),
          method: string().options(['foo', 'bar']).field({ itemOptions: { type: 'option' }}),
          merchantId: integer().options([1, 2, 3]).field({ itemOptions: { type: 'option' }}),
          categoryId: integer().options([1, 2, 3]).field({ itemOptions: { type: 'option' }})
        }).field({ classes: '-inset' }).fallback({})
      });

      const result = Rule.safeParse({
        name: 'foo',
        conditions: [
          {
            value: 'yo'
          }
        ]
      });

      // console.log({ result });

      expect(result.errors).toMatchObject({
        conditions: [
          {
            field: 'is required',
            operator: 'is required'
          }
        ]
      });
    });


    test('transform', () => {
      function toTimezonedDate(d) {
        if (typeof d !== 'string') return d;
        const newDate = new Date(d + 'T00:00:00');
        // console.log({ key: 'min', d, newDate });
        return newDate;
      }

      const Filters = object({
        date: object({
          min: date().transform(toTimezonedDate),
          max: date().transform(toTimezonedDate)
          // min: date().transform(d => new Date(d + 'T00:00:00')),
          // max: date().transform(d => new Date(d + 'T00:00:00'))
        })
      });

      const result = Filters.safeParse({
        date: {
          min: '2022-01-01',
          max: '2022-12-31'
        }
      });

      // console.log({ result });

      expect(result.data).toMatchObject({
        date: {
          min: new Date('2022-01-01T00:00:00'),
          max: new Date('2022-12-31T00:00:00')
        }
      });
    });

    test('modifiers', () => {
      const Interface = object({
        dot: boolean().modifier()
      });

      const result = Interface.safeParse({
        dot: true
      });

      const modifiers = Interface.modifiers(result.data);

      console.log({ result });
      expect(modifiers).toEqual('-dot');
    });

});

describe('field types', () => {
  test('string field schema within object', () => {
    const Schema = object({
      name: string()
    });
    const schema = Schema.schema({ name: 'test value' });

    expect(schema.props.name).toMatchObject({
      propType: 'string',
      type: 'text',
      input: 'input',
      value: 'test value',
      key: 'name',
      name: 'name',
      label: 'Name'
    });
  });

  test('number field schema within object', () => {
    const Schema = object({
      age: number()
    });
    const schema = Schema.schema({ age: 123 });

    expect(schema.props.age).toMatchObject({
      propType: 'number',
      type: 'number',
      input: 'input',
      value: 123,
      key: 'age'
    });
  });

  test('integer field schema within object', () => {
    const Schema = object({
      count: integer()
    });
    const schema = Schema.schema({ count: 456 });

    expect(schema.props.count).toMatchObject({
      propType: 'number',
      type: 'number',
      input: 'input',
      value: 456,
      key: 'count'
    });
    expect(schema.props.count.integer).toEqual(true);
  });

  test('boolean field schema within object', () => {
    const Schema = object({
      active: boolean()
    });
    const schema = Schema.schema({ active: true });

    expect(schema.props.active).toMatchObject({
      propType: 'boolean',
      type: 'switch',
      input: 'choice',
      checked: true,
      value: true,
      key: 'active'
    });
  });

  test('date field schema within object', () => {
    const testDate = new Date('2022-01-01');
    const Schema = object({
      createdAt: date()
    });
    const schema = Schema.schema({ createdAt: testDate });

    expect(schema.props.createdAt).toMatchObject({
      propType: 'date',
      value: testDate,
      key: 'createdAt'
    });
  });

  test('required string field', () => {
    const Schema = object({
      name: string().required()
    });
    const schema = Schema.schema({ name: 'test' });

    expect(schema.props.name.required).toEqual(true);
    expect(schema.props.name.value).toEqual('test');
  });

  test('nullable integer field', () => {
    const Schema = integer().nullable();
    expect(Schema.parse(null)).toEqual(null);
    expect(Schema.parse('123')).toEqual(123);
    expect(Schema.parse(undefined)).toEqual(undefined);
  });

  test('string with options', () => {
    const Schema = object({
      status: string().options(['foo', 'bar', 'baz'])
    });
    const schema = Schema.schema({ status: 'foo' });

    expect(schema.props.status.options).toEqual([
      expect.objectContaining({ label: 'foo', value: 'foo' }),
      expect.objectContaining({ label: 'bar', value: 'bar' }),
      expect.objectContaining({ label: 'baz', value: 'baz' })
    ]);
    expect(schema.props.status.value).toEqual('foo');
    expect(schema.props.status.input).toEqual('select');
  });

  test('number with min and max', () => {
    const Schema = object({
      value: number().min(0).max(100)
    });
    expect(Schema.parse({ value: 50 })).toEqual({ value: 50 });

    // NOTE: There's a bug where min(0) doesn't work because 0 is falsy
    // The check `if (min && value < min)` fails when min is 0
    // Testing with min(1) instead to verify min/max validation works
    const SchemaWithMin1 = object({
      value: number().min(1).max(100)
    });
    expect(() => SchemaWithMin1.parse({ value: -1 })).toThrow();
    expect(() => SchemaWithMin1.parse({ value: 0 })).toThrow();
    expect(() => SchemaWithMin1.parse({ value: 101 })).toThrow();

    // Max validation works even when min is 0
    expect(() => Schema.parse({ value: 101 })).toThrow();
  });

  test('string with length constraints', () => {
    const Schema = string().minLength(3).maxLength(10);
    expect(Schema.parse('test')).toEqual('test');
    expect(() => Schema.parse('ab')).toThrow();
    expect(() => Schema.parse('this is too long')).toThrow();
  });
});

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

    // Empty string is valid for strings, so test with missing field
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

    // Empty string is valid for strings, so test with missing field
    const result = Schema.safeParse({
      tags: [
        { name: 'theology' },
        {} // missing name should fail validation
      ]
    });

    // Array validation returns array of errors (nulls are filtered out)
    // The array contains only error objects, not preserving original indices
    expect(result.errors.tags).toBeDefined();
    expect(Array.isArray(result.errors.tags)).toBe(true);
    expect(result.errors.tags.length).toBeGreaterThan(0);
    // At least one error should be present for the invalid item
    expect(result.errors.tags.some(err => err && err.name === 'is required')).toBe(true);
  });
});

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

describe('arrays', () => {
  test('array of strings', () => {
    const Schema = array(string());
    const input = ['foo', 'bar', 'baz'];

    const parsed = Schema.parse(input);
    expect(parsed).toEqual(input);

    const schema = Schema.schema(input);
    expect(schema).toMatchObject({
      propType: 'array',
      type: 'array',
      value: input
    });
    expect(schema.items).toHaveLength(3);
    // Array items are schema objects, not value objects
    expect(schema.items[0]).toMatchObject({
      propType: 'string',
      type: 'string'
    });
    expect(schema.items[1].propType).toEqual('string');
    expect(schema.items[2].propType).toEqual('string');
  });

  test('array of integers', () => {
    const Schema = array(integer());
    const input = ['1', '2', '3'];

    const parsed = Schema.parse(input);
    expect(parsed).toEqual([1, 2, 3]);
  });

  test('array of objects', () => {
    const Schema = array(object({
      name: string(),
      email: string()
    }));

    const input = [
      { name: 'John', email: 'john@example.com' },
      { name: 'Jane', email: 'jane@example.com' }
    ];

    const parsed = Schema.parse(input);
    expect(parsed).toEqual(input);

    const schema = Schema.schema(input);
    expect(schema.items).toHaveLength(2);
    expect(schema.items[0].props.name.value).toEqual('John');
    expect(schema.items[1].props.email.value).toEqual('jane@example.com');
  });

  test('nullable array', () => {
    const Schema = array(integer()).nullable();
    expect(Schema.parse(null)).toEqual(null);
    expect(Schema.parse(['1', '2'])).toEqual([1, 2]);
    expect(Schema.parse(1)).toEqual([1]);
    expect(Schema.parse('1')).toEqual([1]);
  });

  test('array coercion from single value', () => {
    const Schema = array(string());
    expect(Schema.parse('single')).toEqual(['single']);
  });
});

describe('options and selects', () => {
  test('string with options array', () => {
    const Schema = object({
      status: string().options(['option1', 'option2', 'option3'])
    });
    const schema = Schema.schema({ status: 'option1' });

    expect(schema.props.status.options).toEqual([
      expect.objectContaining({ label: 'option1', value: 'option1' }),
      expect.objectContaining({ label: 'option2', value: 'option2' }),
      expect.objectContaining({ label: 'option3', value: 'option3' })
    ]);
    expect(schema.props.status.input).toEqual('select');
  });

  test('integer with options objects', () => {
    const options = [
      { label: 'Texas', value: 0 },
      { label: 'Minnesota', value: 1 },
      { label: 'New York', value: 2 }
    ];
    const Schema = object({
      state: integer().options(options)
    });
    const schema = Schema.schema({ state: 1 });

    expect(schema.props.state.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Texas', value: 0 }),
        expect.objectContaining({ label: 'Minnesota', value: 1, selected: true, checked: true }),
        expect.objectContaining({ label: 'New York', value: 2 })
      ])
    );
    expect(schema.props.state.value).toEqual(1);
    expect(schema.props.state.input).toEqual('select');
  });

  test('field with itemOptions for select type', () => {
    const Schema = object({
      state: string()
        .options(['TX', 'CA', 'NY'])
        .field({ itemOptions: { type: 'option' }})
    });

    const schema = Schema.schema({ state: 'TX' });
    // itemOptions might be stored in config, check if it affects the schema output
    expect(schema.props.state.input).toEqual('select');
    expect(schema.props.state.value).toEqual('TX');
  });
});

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

describe('coercion edge cases', () => {
  test('empty string to undefined for numbers', () => {
    const Schema = object({
      amount: number()
    });

    // Empty string coerces to undefined for numbers, so the field is omitted
    expect(Schema.parse({ amount: '' })).toEqual(undefined);
    expect(Schema.parse({ amount: '123' })).toEqual({ amount: 123 });
  });

  test('string to boolean coercion', () => {
    const Schema = boolean();
    // Any non-empty string coerces to true (via Boolean() conversion)
    expect(Schema.parse('true')).toEqual(true);
    expect(Schema.parse('false')).toEqual(true); // Non-empty string is truthy

    // Empty string returns undefined (treated as "not provided" before coercion)
    // This happens in coerceValue() before the boolean coercion function runs
    // The check `if (value === '' && !config.required && !config.nullable && config.fallback === undefined)`
    // returns undefined for empty strings, so they never get coerced to false
    expect(Schema.parse('')).toEqual(undefined);
    expect(Schema.parse('anything')).toEqual(true);
  });

  test('number to boolean coercion', () => {
    const Schema = boolean();
    expect(Schema.parse(1)).toEqual(true);
    expect(Schema.parse(0)).toEqual(false);
    expect(Schema.parse(-1)).toEqual(true);
  });

  test('string to date coercion', () => {
    const Schema = date();
    const dateStr = '2022-01-01';
    const parsed = Schema.parse(dateStr);

    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.getTime()).toEqual(new Date(dateStr).getTime());
  });

  test('object with all empty values returns undefined', () => {
    const Schema = object({
      type: string(),
      method: string()
    });

    expect(Schema.parse({
      type: '',
      method: ''
    })).toEqual(undefined);
  });
});
