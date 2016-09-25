import {merge} from 'widjet-utils'
import {asTuple, fieldName, getNextID, getTypeAndParameters} from './utils'

export default class JSONForm {
  static TEMPLATE_PATH_PREFIX = 'templates/form/'
  static FORM_WRAPPER_TEMPLATE_PATH = 'templates/form/form-wrapper'
  static FIELD_WRAPPER_TEMPLATE_PATH = 'templates/form/field-wrapper'
  static FIELDSET_TEMPLATE_PATH = 'templates/form/fieldset-wrapper'
  static ARRAY_WRAPPER_TEMPLATE_PATH = 'templates/form/array-wrapper'
  static ARRAY_ITEM_WRAPPER_TEMPLATE_PATH = 'templates/form/array-item-wrapper'

  static getTemplate (key) { return window.JST[key] }

  static render (schema, values) {
    let form = new JSONForm({schema, values})
    return form.render()
  }

  constructor (options = {}) {
    this.schema = options.schema
    this.values = options.values
    this.id = options.id || getNextID()
  }

  render () {
    const content = this.renderObject(this.schema, this.values)

    return this.jst(JSONForm.FORM_WRAPPER_TEMPLATE_PATH, {
      id: this.id,
      content
    })
  }

  renderObject (object = {}, values = {}, objectName) {
    return asTuple(object).map(([key, value]) => {
      const id = `${key}-${this.id}`
      const [type, parameters] = getTypeAndParameters(value)

      return {id, type, parameters, setting: key}
    }).reduce((memo, {id, type, setting, parameters}) => {
      const name = fieldName(setting, objectName)
      const base = {id, name, type, setting, parameters}

      switch (type) {
        case 'object':
          return memo + this.jst(JSONForm.FIELDSET_TEMPLATE_PATH, merge(base, {
            content: this.renderObject(parameters.properties, values[setting], name)
          }))
        case 'array':
          const itemsType = parameters.items
          return memo + this.jst(JSONForm.ARRAY_WRAPPER_TEMPLATE_PATH, merge(base, {
            content: (values[setting] || []).map((value, i) => {
              return this.jst(JSONForm.ARRAY_ITEM_WRAPPER_TEMPLATE_PATH, {
                content: this.renderObject({
                  [`${i}`]: itemsType
                }, value, `${objectName}[${i}]`)
              })
            })
          }))
        default:
          return memo + this.getField(type, merge(base, {
            value: values[setting]
          }))
      }
    }, '')
  }

  getField (type, options) {
    return this.jst(JSONForm.FIELD_WRAPPER_TEMPLATE_PATH, {
      content: this.jst(`${JSONForm.TEMPLATE_PATH_PREFIX}${type}`, options),
      options
    })
  }

  jst (key, data) { return JSONForm.getTemplate(key)(data) }
}
