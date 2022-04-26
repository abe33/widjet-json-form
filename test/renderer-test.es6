import expect from 'expect.js';
import jsdom from 'mocha-jsdom';
import {always} from 'widjet-utils';

import {formRenderer} from '../src/index';
import {loadTemplates, getTemplate, compactHTML} from './helpers';
import {
  typeIs,
  typeIsComposite,
  renderObjectField,
  renderArrayField,
  renderCompositeField,
  renderDefaultField,
} from '../src/renderers';

describe('formRenderer() generated function', () => {
  let render;
  jsdom({url: 'http://localhost'});
  loadTemplates();

  beforeEach(() => {
    const renderDefault = renderDefaultField(
      window.JST['json-form/field'],
      type => window.JST[`json-form/${type}`]
    );

    render = formRenderer({
      formTemplate: window.JST['json-form/form'],
      renderers: [
        [
          typeIs('object'),
          renderObjectField(window.JST['json-form/object']),
        ], [
          typeIs('array'),
          renderArrayField(
            window.JST['json-form/array'],
            window.JST['json-form/arrayItem']),
        ], [
          typeIsComposite,
          renderCompositeField(
            window.JST['json-form/composite'],
            window.JST['json-form/compositeItem'],
            renderDefault),
        ], [
          always, renderDefault,
        ],
      ],
    });
  });

  describe('when called with a schema object', () => {
    it('returns the html of the form content', () => {
      const html = render({
        schema: {
          title: 'string',
          description: '{"type": "string"}',
          content: {
            type: 'markdown',
          },
        },
      });

      expect(html).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field string">description:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `));
    });

    describe('that does not have a type key in one of its fields', () => {
      it('raises an exception', () => {
        expect(() => render({ schema: { field: {} } })).to.throwError(/Field 'field' is missing a 'type' key/);
      });
    });
  });

  describe('when called without a schema object', () => {
    it('returns the html for an empty form', () => {
      const html = render({});

      expect(html).to.eql('<form></form>');
    });
  });

  describe('when the schema has a field of type object', () => {
    it('wraps the nested fields in a fieldset wrapper', () => {
      const html = render({
        schema: {
          object: {
            type: 'object',
            properties: {
              title: 'string',
              description: '{"type": "string"}',
              content: {
                type: 'markdown',
              },
            },
          },
        },
      });

      expect(html).to.eql(compactHTML(`
        <form>
          <fieldset>
            <legend>object</legend>
            <div class="field string">object[title]:string</div>
            <div class="field string">object[description]:string</div>
            <div class="field markdown">object[content]:markdown</div>
          </fieldset>
        </form>
      `));
    });
  });

  describe('when the schema has a field of type array', () => {
    describe('with no values', () => {
      it('generates a form for an empty array', () => {
        const html = render({
          schema: {
            array: {
              type: 'array',
              items: 'string',
            },
          },
        });

        expect(html).to.eql('<form><ul></ul></form>');
      });
    });

    describe('for primitive items', () => {
      it('generates an array item for each item in the value', () => {
        window.JST['json-form/string'] = getTemplate('{{name}}={{value}}');

        const html = render({
          schema: {
            array: {
              type: 'array',
              items: 'string',
            },
          },
          values: { array: ['foo'] },
        });

        expect(html).to.eql(compactHTML(`
          <form>
            <ul>
              <li><div class="field string">array[0]=foo</div></li>
            </ul>
          </form>
        `));
      });
    });

    describe('for object items', () => {
      it('generates an array item for each item in the value', () => {
        window.JST['json-form/string'] = getTemplate('{{name}}={{value}}');
        window.JST['json-form/markdown'] = getTemplate('{{name}}={{value}}');

        const html = render({
          schema: {
            array: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: 'string',
                  description: '{"type": "string"}',
                  content: { type: 'markdown' },
                  tags: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
          values: {
            array: [
              {
                title: 'foo',
                description: 'baz',
                content: 'bar',
                tags: [{label: 'tag-label'}, {label: 'other-tag-label'}],
              },
            ],
          },
        });

        expect(html).to.eql(compactHTML(`
          <form>
            <ul>
              <li>
                <fieldset>
                  <legend>array[0]</legend>
                  <div class="field string">array[0][title]=foo</div>
                  <div class="field string">array[0][description]=baz</div>
                  <div class="field markdown">array[0][content]=bar</div>
                  <ul>
                    <li>
                      <fieldset>
                        <legend>array[0][tags][0]</legend>
                        <div class="field string">array[0][tags][0][label]=tag-label</div>
                      </fieldset>
                    </li>
                    <li>
                      <fieldset>
                        <legend>array[0][tags][1]</legend>
                        <div class="field string">array[0][tags][1][label]=other-tag-label</div>
                      </fieldset>
                    </li>
                  </ul>
                </fieldset>
              </li>
            </ul>
          </form>
        `));
      });
    });
  });

  describe('when the schema has a field of type composite', () => {
    describe('with no values', () => {
      it('generates a list of all allowed types', () => {
        const html = render({
          schema: {
            composite: {
              type: ['string', 'integer', 'null'],
            },
          },
          values: {
            composite: 10,
          },
        });

        expect(html).to.eql(compactHTML(`
          <form>
            <dl>
              <dd><div class="field string">composite:string</div></dd>
              <dd><div class="field integer">composite:integer</div></dd>
              <dd><div class="field null">composite:null</div></dd>
            </dl>
          </form>
        `));
      });
    });
  });
});
