import widgets from 'widjet'
import {getNode, curry2, when, always} from 'widjet-utils'
import {typeIs, objectRenderer, renderObjectField, renderArrayField, renderDefaultField} from './renderers'
import {getNextID} from './utils'

export const formRenderer = curry2((options, data) => {
  const {schema, values} = data
  const id = data.id || getNextID()

  const renderers = options.renderers.map(([p, r]) => [
    p, r((a, b, c) => renderObject(a, b, c))
  ])

  const renderObject = objectRenderer(id, when(renderers))

  return options.formTemplate({ id, content: renderObject(schema, values) })
})

widgets.define('json-form', (container, options) => {
  const tpl = options.findTemplate || (s =>
    options[`${s}Template`] || window.JST[`templates/form/${s}`]
  )
  const schemaAttribute = options.schemaAttribute || 'data-schema'
  const valueAttribute = options.valueAttribute || 'data-values'

  const DEFAULT_RENDERERS = [
    [typeIs('object'), renderObjectField(tpl('object'))],
    [typeIs('array'), renderArrayField(tpl('array'), tpl('arrayItem'))],
    [always, renderDefaultField(tpl('field'), t => tpl(t))]
  ]
  const schema = JSON.parse(container.getAttribute(schemaAttribute))
  const values = container.hasAttribute(valueAttribute)
    ? JSON.parse(container.getAttribute(valueAttribute))
    : {}

  const render = formRenderer({
    formTemplate: tpl('form'),
    renderers: (options.renderers || []).concat(DEFAULT_RENDERERS)
  })

  const id = container.getAttribute('data-id')
  container.appendChild(getNode(render({schema, values, id})))

  window.requestAnimationFrame(() =>
    widgets.dispatch(container, 'json-form:ready')
  )
})
