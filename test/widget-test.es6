import expect from 'expect.js'
import jsdom from 'mocha-jsdom'
import widgets from 'widjet'
import sinon from 'sinon'

import {loadTemplates, getTemplate, compactHTML} from './helpers'
import '../src/index'

describe('json-form', () => {
  jsdom()
  loadTemplates()

  let target, spy

  describe('without values', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'>
        </div>
      `

      spy = sinon.spy()
      target = document.querySelector('[data-schema]')

      document.addEventListener('json-form:ready', spy)

      widgets('json-form', '[data-schema]', {on: 'init'})
    })

    it('fills the specified target with a form generated using the data provided', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `))
    })

    it('emits a json-form:ready event', () => {
      expect(spy.called).to.be.ok()
    })
  })

  describe('with a data-values attribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-values='{"title": "foo", "content": "bar"}'>
        </div>
      `

      window.JST['templates/form/string'] = getTemplate('{{name}}={{value}}')
      window.JST['templates/form/markdown'] = getTemplate('{{name}}={{value}}')

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {on: 'init'})
    })

    it('parses the value and passes them to the widget form', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title=foo</div>
          <div class="field markdown">content=bar</div>
        </form>
      `))
    })
  })

  describe('with a data-id attribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-id="foo">
        </div>
      `

      window.JST['templates/form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `))
      window.JST['templates/form/field'] = getTemplate(compactHTML(`
        <div class="field {{ type }}" id="{{ id }}">{{ content }}</div>
      `))

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {on: 'init'})
    })

    it('passes the id so that the renderer uses it for fields id', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div class="field string" id="foo-title">title:string</div>
          <div class="field markdown" id="foo-content">content:markdown</div>
        </form>
      `))
    })
  })

  describe('with custom renderers in the options', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
        </div>
      `

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {on: 'init', renderers: [
        [a => true, a => b => 'foo']
      ]})
    })

    it('uses the provided renderers in priority', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>foofoo</form>
      `))
    })
  })

  describe('with custom templates in the options', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
        </div>
      `

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {
        on: 'init',
        formTemplate: getTemplate('<div>{{ content }}</div>'),
        fieldTemplate: getTemplate('<div>{{ content }}</div>')
      })
    })

    it('uses the provided templates in priority', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <div>
          <div>title:string</div>
          <div>content:markdown</div>
        </div>
      `))
    })
  })

  describe('with a custom schema attribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-form='{"title": "string", "content": {"type": "markdown"}}'>
        </div>
      `

      spy = sinon.spy()
      target = document.querySelector('[data-form]')

      document.addEventListener('json-form:ready', spy)

      widgets('json-form', '[data-form]', {on: 'init', schemaAttribute: 'data-form'})
    })

    it('uses the data from the custom schema attribute', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `))
    })
  })

  describe('with a custom values attribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-content='{"title": "foo", "content": "bar"}'>
        </div>
      `

      window.JST['templates/form/string'] = getTemplate('{{name}}={{value}}')
      window.JST['templates/form/markdown'] = getTemplate('{{name}}={{value}}')

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {on: 'init', valueAttribute: 'data-content'})
    })

    it('parses the value and passes them to the widget form', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title=foo</div>
          <div class="field markdown">content=bar</div>
        </form>
      `))
    })
  })

  describe('with a template retrieving function', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'>
        </div>
      `

      target = document.querySelector('[data-schema]')

      for (let k in window.JST) {
        window.JST[k.replace('templates/form', 'tpl')] = window.JST[k]
        delete window.JST[k]
      }

      widgets('json-form', '[data-schema]', {
        on: 'init',
        findTemplate: s => window.JST[`tpl/${s}`]
      })
    })

    it('uses the provided function to render', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `))
    })
  })

  describe('with a custom field name generation method', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"object": {"type": "object", "properties": {"title": "string", "content": {"type": "markdown"}}}}'>
        </div>
      `
      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {
        on: 'init',
        fieldName: (parts) => parts.join('-')
      })
    })

    it('uses the provided function to render', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form>
          <fieldset>
            <legend>object</legend>
            <div class="field string">object-title:string</div>
            <div class="field markdown">object-content:markdown</div>
          </fieldset>
        </form>
      `))
    })
  })

  describe('with a custom id attribute', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-form-id="foo">
        </div>
      `

      window.JST['templates/form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `))
      window.JST['templates/form/field'] = getTemplate(compactHTML(`
        <div class="field {{ type }}" id="{{ id }}">{{ content }}</div>
      `))

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {on: 'init', idAttribute: 'data-form-id'})
    })

    it('passes the id so that the renderer uses it for fields id', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div class="field string" id="foo-title">title:string</div>
          <div class="field markdown" id="foo-content">content:markdown</div>
        </form>
      `))
    })
  })

  describe('with a custom field id generation method', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-schema='{"title": "string", "content": {"type": "markdown"}}'
             data-id="foo">
        </div>
      `

      window.JST['templates/form/form'] = getTemplate(compactHTML(`
        <form id="{{ id }}">{{ content }}</div>
      `))
      window.JST['templates/form/field'] = getTemplate(compactHTML(`
        <div class="field {{ type }}" id="{{ id }}">{{ content }}</div>
      `))

      target = document.querySelector('[data-schema]')

      widgets('json-form', '[data-schema]', {
        on: 'init',
        fieldId: (id, path) => [id].concat(path).concat('field').join('_')
      })
    })

    it('passes the id so that the renderer uses it for fields id', () => {
      expect(compactHTML(target.innerHTML)).to.eql(compactHTML(`
        <form id="foo">
          <div class="field string" id="foo_title_field">title:string</div>
          <div class="field markdown" id="foo_content_field">content:markdown</div>
        </form>
      `))
    })
  })
})
