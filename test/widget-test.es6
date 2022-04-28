import expect from 'expect.js';
import jsdom from 'mocha-jsdom';
import widgets from 'widjet';
import sinon from 'sinon';
import {setPageContent, getTestRoot} from 'widjet-test-utils/dom';

import {loadTemplates, getTemplate, compactHTML} from './helpers';
import '../src/index';

describe('json-form', () => {
  jsdom({url: 'http://localhost'});
  loadTemplates();

  let target, spy;

  describe('with a data-schema attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'>
        </div>
      `);

      spy = sinon.spy();
      target = getTestRoot().querySelector('[data-schema]');

      document.addEventListener('json-form:ready', spy);

      widgets('json-form', '[data-schema]', {on: 'init'});
    });

    it('fills the specified target with a form generated using the data provided', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `));
    });

    it('emits a json-form:ready event', () => {
      expect(spy.called).to.be.ok();
    });
  });

  describe('with a schema in a script tag and a data-schema-source attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <script id='source' type='application/json'>
          {
            "title": "string",
            "content": {
              "type": "markdown"
            }
          }
        </script>
        <div data-schema-source='source'></div>
      `);

      target = getTestRoot().querySelector('[data-schema-source]');

      widgets('json-form', '[data-schema-source]', {on: 'init'});
    });

    it('fills the specified target with a form generated using the data provided', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `));
    });

    it('emits a json-form:ready event', () => {
      expect(spy.called).to.be.ok();
    });
  });

  describe('with a data-values attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-values='{"title": "foo", "content": "bar"}'>
        </div>
      `);

      window.JST['json-form/string'] = getTemplate('{{name}}={{value}}');
      window.JST['json-form/markdown'] = getTemplate('{{name}}={{value}}');

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {on: 'init'});
    });

    it('parses the value and passes them to the widget form', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title=foo</div>
          <div class="field markdown">content=bar</div>
        </form>
      `));
    });
  });

  describe('with values in a script tag and a data-values-source attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <script id='schema' type='application/json'>
          {
            "title": "string",
            "content": {
              "type": "markdown"
            }
          }
        </script>
        <script id='values' type='application/json'>
          {
            "title": "foo",
            "content": "bar"
          }
        </script>
        <div data-schema-source='schema' data-values-source='values'></div>
      `);

      window.JST['json-form/string'] = getTemplate('{{name}}={{value}}');
      window.JST['json-form/markdown'] = getTemplate('{{name}}={{value}}');

      target = getTestRoot().querySelector('[data-schema-source]');

      widgets('json-form', '[data-schema-source]', {on: 'init'});
    });

    it('fills the specified target with a form generated using the data provided', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title=foo</div>
          <div class="field markdown">content=bar</div>
        </form>
      `));
    });

    it('emits a json-form:ready event', () => {
      expect(spy.called).to.be.ok();
    });
  });


  describe('with a data-id attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-id="foo">
        </div>
      `);

      window.JST['json-form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `));
      window.JST['json-form/field'] = getTemplate(compactHTML(`
        <div id="{{ id }}" class="field {{ type }}">{{ content }}</div>
      `));

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {on: 'init'});
    });

    it('passes the id so that the renderer uses it for fields id', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div id="foo-title" class="field string">title:string</div>
          <div id="foo-content" class="field markdown">content:markdown</div>
        </form>
      `));
    });
  });

  describe('with custom renderers in the options', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
        </div>
      `);

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {on: 'init', renderers: [
        [a => true, a => b => 'foo'],
      ]});
    });

    it('uses the provided renderers in priority', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>foofoo</form>
      `));
    });
  });

  describe('with custom templates in the options', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
        </div>
      `);

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {
        on: 'init',
        formTemplate: getTemplate('<div>{{ content }}</div>'),
        fieldTemplate: getTemplate('<div>{{ content }}</div>'),
      });
    });

    it('uses the provided templates in priority', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <div>
          <div>title:string</div>
          <div>content:markdown</div>
        </div>
      `));
    });
  });

  describe('with a custom schema attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-form='{"title": "string", "content": {"type": "markdown"}}'>
        </div>
      `);

      spy = sinon.spy();
      target = getTestRoot().querySelector('[data-form]');

      document.addEventListener('json-form:ready', spy);

      widgets('json-form', '[data-form]', {on: 'init', schemaAttribute: 'data-form'});
    });

    it('uses the data from the custom schema attribute', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `));
    });
  });

  describe('with a custom values attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-content='{"title": "foo", "content": "bar"}'>
        </div>
      `);

      window.JST['json-form/string'] = getTemplate('{{name}}={{value}}');
      window.JST['json-form/markdown'] = getTemplate('{{name}}={{value}}');

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {on: 'init', valueAttribute: 'data-content'});
    });

    it('parses the value and passes them to the widget form', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title=foo</div>
          <div class="field markdown">content=bar</div>
        </form>
      `));
    });
  });

  describe('with a template retrieving function', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'>
        </div>
      `);

      target = getTestRoot().querySelector('[data-schema]');

      for (let k in window.JST) {
        window.JST[k.replace('json-form', 'tpl')] = window.JST[k];
        delete window.JST[k];
      }

      widgets('json-form', '[data-schema]', {
        on: 'init',
        findTemplate: s => window.JST[`tpl/${s}`],
      });
    });

    it('uses the provided function to render', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `));
    });
  });

  describe('with a custom field name generation method', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{
          "object": {
            "type": "object",
            "properties": {
              "title": "string",
              "content": {
                "type": "markdown"
              }
            }
          }
          }'>
        </div>
      `);

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {
        on: 'init',
        fieldName: (parts) => parts.join('-'),
      });
    });

    it('uses the provided function to render', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <fieldset>
            <legend>object</legend>
            <div class="field string">object-title:string</div>
            <div class="field markdown">object-content:markdown</div>
          </fieldset>
        </form>
      `));
    });
  });

  describe('with a custom id attribute', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-form-id="foo">
        </div>
      `);

      window.JST['json-form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `));
      window.JST['json-form/field'] = getTemplate(compactHTML(`
        <div id="{{ id }}" class="field {{ type }}">{{ content }}</div>
      `));

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {on: 'init', idAttribute: 'data-form-id'});
    });

    it('passes the id so that the renderer uses it for fields id', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div id="foo-title" class="field string">title:string</div>
          <div id="foo-content" class="field markdown">content:markdown</div>
        </form>
      `));
    });
  });

  describe('with a custom field id generation method', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-id="foo">
        </div>
      `);

      window.JST['json-form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `));
      window.JST['json-form/field'] = getTemplate(compactHTML(`
        <div id="{{ id }}" class="field {{ type }}">{{ content }}</div>
      `));

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {
        on: 'init',
        fieldId: (id, path) => [id].concat(path).concat('field').join('_'),
      });
    });

    it('passes the id so that the renderer uses it for fields id', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div id="foo_title_field" class="field string">title:string</div>
          <div id="foo_content_field" class="field markdown">content:markdown</div>
        </form>
      `));
    });
  });

  describe('with a custom root attribute path', () => {
    beforeEach(() => {
      setPageContent(`
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-id="foo"
             data-root-attribute-path="root">
        </div>
      `);

      window.JST['json-form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `));
      window.JST['json-form/field'] = getTemplate(compactHTML(`
        <div id="{{ id }}" class="field {{ type }}">{{ content }}</div>
      `));

      target = getTestRoot().querySelector('[data-schema]');

      widgets('json-form', '[data-schema]', {on: 'init'});
    });

    it('prepends the custom root attribute path to id and name', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div id="foo-root-title" class="field string">root[title]:string</div>
          <div id="foo-root-content" class="field markdown">root[content]:markdown</div>
        </form>
      `));
    });
  });
});
