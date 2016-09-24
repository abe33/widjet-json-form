import expect from 'expect.js'
import jsdom from 'mocha-jsdom'
import widgets from 'widjet'
import sinon from 'sinon'

import {loadTemplates} from './helpers'
import '../src/index'

describe('json-form', () => {
  jsdom()
  loadTemplates()

  let target, spy

  describe('without values', () => {
    beforeEach(() => {
      document.body.innerHTML = `
      <div data-form='{"title": "string", "content": {"type": "markdown"}}'></div>
      `

      spy = sinon.spy()
      target = document.querySelector('[data-form]')

      document.addEventListener('json-form:ready', spy)

      widgets('json-form', '[data-form]', {on: 'init'})
    })

    it('fills the specified target with a form generated using the data provided', () => {
      expect(target.innerHTML).to.eql('<form><div class="field string">title:string</div><div class="field markdown">content:markdown</div></form>')
    })

    it('emits a json-form:ready event', () => {
      expect(spy.called).to.be.ok()
    })
  })

  describe('with values', () => {
    beforeEach(() => {
      document.body.innerHTML = `
      <div data-form='{"title": "string", "content": {"type": "markdown"}}' data-values='{"title": "foo", "content": "bar"}'></div>
      `

      target = document.querySelector('[data-form]')

      widgets('json-form', '[data-form]', {on: 'init'})
    })

    it('parses the value and passes them to the widget form', () => {
      expect(target.formWidget.values).to.eql({
        title: 'foo',
        content: 'bar'
      })
    })
  })
})
