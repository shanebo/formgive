import { describe, test, expect } from 'bun:test';
import '../lib/utils.js';
import { integer, object, string } from '../lib/index.js';

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
    expect(schema.props.status.component).toEqual('Select');
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
    expect(schema.props.state.component).toEqual('Select');
  });


  test('option enrich keeps extra props (passthrough)', () => {
    const Schema = object({
      assignee: string().options([
        { label: 'Ada', value: 'ada', color: 'violet', face: 'solid' },
        { label: 'Grace', value: 'grace', color: 'teal' }
      ])
    });
    const schema = Schema.schema({ assignee: 'ada' });

    expect(schema.props.assignee.options[0]).toMatchObject({
      label: 'Ada',
      value: 'ada',
      color: 'violet',
      face: 'solid',
      selected: true,
      checked: true
    });
    expect(schema.props.assignee.options[1]).toMatchObject({
      label: 'Grace',
      value: 'grace',
      color: 'teal'
    });
    expect(schema.props.assignee.itemOptions).toMatchObject({
      component: 'Choice',
      type: 'chip'
    });
    expect(schema.props.assignee.options[1].selected).toBeUndefined();
    expect(schema.props.assignee.options[1].checked).toBeUndefined();
  });


  test('field with itemOptions for select type', () => {
    const Schema = object({
      state: string()
        .options(['TX', 'CA', 'NY'])
        .field({ itemOptions: { type: 'option' }})
    });

    const schema = Schema.schema({ state: 'TX' });
    // itemOptions might be stored in config, check if it affects the schema output
    expect(schema.props.state.component).toEqual('Select');
    expect(schema.props.state.value).toEqual('TX');
  });
});
