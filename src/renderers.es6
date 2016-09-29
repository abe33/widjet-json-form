import {curry2, curry3, curry4, merge, inputName} from 'widjet-utils'
import {asTuple, getTypeAndParameters, parameterize} from './utils'

export const typeIs = curry2((type, opts) => opts.type === type)

export const objectRenderer = ({id: fid, renderField, fieldName}) => {
  fieldName = fieldName || inputName()

  return (schema = {}, values = {}, objectName = []) =>
    asTuple(schema).map(([key, value]) => {
      const attributePath = objectName.concat(key)
      const name = fieldName(...attributePath)
      const [type, parameters] = getTypeAndParameters(value)
      const id = `${parameterize(name)}-${fid}`

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
