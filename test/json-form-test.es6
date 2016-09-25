import expect from 'expect.js'
import jsdom from 'mocha-jsdom'

import {loadTemplates} from './helpers'
import JSONForm from '../src/json-form'

describe('JSONForm', () => {
  jsdom()
  loadTemplates()

  describe('#render()', () => {
    describe('when created with a schema object', () => {
      it('returns the html of the form content', () => {
        const form = new JSONForm({
          schema: {
            title: 'string',
            description: '{"type": "string"}',
            content: {
              type: 'markdown'
            }
          }
        })

        expect(form.render()).to.eql('<form><div class="field string">title:string</div><div class="field string">description:string</div><div class="field markdown">content:markdown</div></form>')
      })
    })

    describe('when created without a schema object', () => {
      it('returns the html for an empty form', () => {
        const form = new JSONForm()

        expect(form.render()).to.eql('<form></form>')
      })
    })

    describe('when created with an id', () => {
      it('does not generate an id for the form', () => {
        const form = new JSONForm({id: 'foo'})

        expect(form.id).to.eql('foo')
      })
    })

    describe('when the schema has a field of type object', () => {
      it('wraps the nested fields in a fieldset wrapper', () => {
        const form = new JSONForm({
          schema: {
            object: {
              type: 'object',
              properties: {
                title: 'string',
                description: '{"type": "string"}',
                content: {
                  type: 'markdown'
                }
              }
            }
          }
        })

        expect(form.render()).to.eql('<form><fieldset><legend>object</legend><div class="field string">title:string</div><div class="field string">description:string</div><div class="field markdown">content:markdown</div></fieldset></form>')
      })
    })

    describe('when the schema has a field of type array', () => {
      it('generates an array item for each item in the value', () => {
        const form = new JSONForm({
          schema: {
            array: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: 'string',
                  description: '{"type": "string"}',
                  content: {
                    type: 'markdown'
                  }
                }
              }
            }
          },
          values: {
            array: [
              {title: 'foo', description: 'baz', content: 'bar'}
            ]
          }
        })

        expect(form.render()).to.eql('<form><ul><li><fieldset><legend>0</legend><div class="field string">title:string</div><div class="field string">description:string</div><div class="field markdown">content:markdown</div></fieldset></li></ul></form>')
      })
    })
  })

  describe('.render()', () => {
    it('returns the html of the form content', () => {
      const html = JSONForm.render({
        title: 'string',
        description: '{"type": "string"}',
        content: {
          type: 'markdown'
        }
      })

      expect(html).to.eql('<form><div class="field string">title:string</div><div class="field string">description:string</div><div class="field markdown">content:markdown</div></form>')
    })
  })
})
