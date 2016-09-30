import {curry2, curry3, curry4, merge, inputName, apply} from 'widjet-utils'
import {asTuple, getTypeAndParameters} from './utils'

const defaultFieldId = (id, path) => [id].concat(path).join('-')

export const typeIs = curry2((type, opts) => opts.type === type)

export const objectRenderer = ({id: fid, renderField, fieldName, fieldId}) => {
  fieldName = fieldName || apply(inputName())
  fieldId = fieldId || defaultFieldId

  return (schema = {}, values = {}, objectName = []) =>
    asTuple(schema).map(([key, value]) => {
      const attributePath = objectName.concat(key)
      const name = fieldName(attributePath)
      const id = fieldId(fid, attributePath)
      const [type, parameters] = getTypeAndParameters(value)

      if (!type) { throw new Error(`Field '${key}' is missing a 'type' key`) }

      return {
        id, type, parameters, name, attributePath,
        attribute: key,
        value: values[key]
      }
    })
    .map(params => renderField(params))
    .reduce((memo, str) => memo + str, '')
}
export const renderObjectField = curry3((tpl, renderObject, opts) =>
  tpl(merge(opts, {
    content: renderObject(opts.parameters.properties, opts.value, opts.attributePath)
  }))
)

export const renderArrayField = curry4((tplUl, tplLi, renderObject, opts) => {
  const itemsType = opts.parameters.items

  const render = i => renderObject({ [i]: itemsType }, opts.value, opts.attributePath)

  const renderItems = (value, i) => tplLi({ content: render(i), index: i })

  return tplUl(merge(opts, { content: (opts.value || []).map(renderItems) }))
})

export const renderDefaultField = curry4((tplWrapper, tplField, rO, opts) =>
  tplWrapper(merge(opts, { content: tplField(opts.type)(opts) }))
)
