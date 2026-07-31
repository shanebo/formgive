import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { array, date, number, integer, boolean, object, string } from '../lib/index.js';

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

    expect(Rule.schema(ruleInput)).toMatchObject({
      schemaType: 'object',
      props: {
        conditions: {
          propType: 'array',
          key: 'conditions',
          name: 'conditions',
          label: 'Conditions',
          schemaType: 'array',
          props: undefined,
          template: {
            schemaType: "object",
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
            legend: "Conditions index",
          },
          items: [
            {
              schemaType: "object",
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
              schemaType: "object",
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

  test('Cat with null', () => {
    const Category = object({
      parentId: integer().nullable()
    });

    expect(Category.parse({
      parentId: '123'
    })).toMatchObject({
      parentId: 123
    });
  });
});
