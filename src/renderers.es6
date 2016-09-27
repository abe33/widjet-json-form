import {curry2, curry3, curry4, merge} from 'widjet-utils'
import {asTuple, fieldName, getTypeAndParameters, parameterize} from './utils'

export const typeIs = curry2((type, opts) => opts.type === type)

export const objectRenderer = (fid, renderField) => (schema = {}, values = {}, objectName) =>
  asTuple(schema).map(([key, value]) => {
    const id = objectName
      ? `${parameterize(objectName)}-${key}-${fid}`
      : `${key}-${fid}`

    const name = fieldName(key, objectName)
    const [type, parameters] = getTypeAndParameters(value)

    return { id, type, parameters, name, attribute: key, value: values[key] }
  })
  .map(params => renderField(params))
  .reduce((memo, str) => memo + str, '')

export const renderObjectField = curry3((tpl, renderObject, opts) =>
  tpl(merge(opts, {
    content: renderObject(opts.parameters.properties, opts.value, opts.name)
  }))
)

export const renderArrayField = curry4((tplUl, tplLi, renderObject, opts) => {
  const itemsType = opts.parameters.items

  const render = i => renderObject({ [i]: itemsType }, opts.value, opts.name)

  const renderItems = (value, i) => tplLi({ content: render(i) })

  return tplUl(merge(opts, { content: (opts.value || []).map(renderItems) }))
})

export const renderDefaultField = curry4((tplWrapper, tplField, rO, opts) =>
  tplWrapper(merge(opts, { content: tplField(opts.type)(opts) }))
)
