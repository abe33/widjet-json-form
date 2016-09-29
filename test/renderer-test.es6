import expect from 'expect.js'
import jsdom from 'mocha-jsdom'
import {always} from 'widjet-utils'

import {formRenderer} from '../src/index'
import {loadTemplates, getTemplate, compactHTML} from './helpers'
import {typeIs, renderObjectField, renderArrayField, renderDefaultField} from '../src/renderers'

describe('formRenderer() generated function', () => {
  let render
  jsdom()
  loadTemplates()

  beforeEach(() => {
    render = formRenderer({
      formTemplate: window.JST['templates/form/form'],
      renderers: [
        [
          typeIs('object'),
          renderObjectField(window.JST['templates/form/object'])
        ], [
          typeIs('array'),
          renderArrayField(
            window.JST['templates/form/array'],
            window.JST['templates/form/arrayItem']
          )
        ], [
          always, renderDefaultField(
            window.JST['templates/form/field'],
            type => window.JST[`templates/form/${type}`],
          )
        ]
      ]
    })
  })

  describe('when called with a schema object', () => {
    it('returns the html of the form content', () => {
      const html = render({
        schema: {
          title: 'string',
          description: '{"type": "string"}',
          content: {
            type: 'markdown'
          }
        }
      })

      expect(html).to.eql(compactHTML(`
        <form>
          <div class="field string">title:string</div>
          <div class="field string">description:string</div>
          <div class="field markdown">content:markdown</div>
        </form>
      `))
    })
  })

  describe('when called without a schema object', () => {
    it('returns the html for an empty form', () => {
      const html = render({})

      expect(html).to.eql('<form></form>')
    })
  })

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
                type: 'markdown'
              }
            }
          }
        }
      })

      expect(html).to.eql(compactHTML(`
        <form>
          <fieldset>
            <legend>object</legend>
            <div class="field string">object[title]:string</div>
            <div class="field string">object[description]:string</div>
            <div class="field markdown">object[content]:markdown</div>
          </fieldset>
        </form>
      `))
    })
  })

  describe('when the schema has a field of type array', () => {
    describe('with no values', () => {
      it('generates a form for an empty array', () => {
        const html = render({
          schema: {
            array: {
              type: 'array',
              items: 'string'
            }
          }
        })

        expect(html).to.eql('<form><ul></ul></form>')
      })
    })

    describe('for primitive items', () => {
      it('generates an array item for each item in the value', () => {
        window.JST['templates/form/string'] = getTemplate('{{name}}={{value}}')

        const html = render({
          schema: {
            array: {
              type: 'array',
              items: 'string'
            }
          },
          values: { array: ['foo'] }
        })

        expect(html).to.eql(compactHTML(`
          <form>
            <ul>
              <li><div class="field string">array[0]=foo</div></li>
            </ul>
          </form>
        `))
      })
    })

    describe('for object items', () => {
      it('generates an array item for each item in the value', () => {
        window.JST['templates/form/string'] = getTemplate('{{name}}={{value}}')
        window.JST['templates/form/markdown'] = getTemplate('{{name}}={{value}}')

        const html = render({
          schema: {
            array: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: 'string',
                  description: '{"type": "string"}',
                  content: { type: 'markdown' }
                }
              }
            }
          },
          values: {
            array: [ {title: 'foo', description: 'baz', content: 'bar'} ]
          }
        })

        expect(html).to.eql(compactHTML(`
          <form>
            <ul>
              <li>
                <fieldset>
                  <legend>array[0]</legend>
                  <div class="field string">array[0][title]=foo</div>
                  <div class="field string">array[0][description]=baz</div>
                  <div class="field markdown">array[0][content]=bar</div>
                </fieldset>
              </li>
            </ul>
          </form>
        `))
      })
    })
  })
})