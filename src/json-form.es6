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
      const name = fieldName(key, objectName)
      const [type, parameters] = getTypeAndParameters(value)

      return {id, type, parameters, name, attribute: key, value: values[key]}
    })
    .map(params => this.renderField(params))
    .reduce((memo, str) => memo + str, '')
  }

  renderField (opts = {}) {
    switch (opts.type) {
      case 'object':
        return this.jst(JSONForm.FIELDSET_TEMPLATE_PATH, merge(opts, {
          content: this.renderObject(opts.parameters.properties, opts.value, opts.name)
        }))
      case 'array':
        const itemsType = opts.parameters.items

        const renderContent = i =>
          this.renderObject({[i]: itemsType}, opts.value, opts.name)

        const renderItems = (value, i) =>
          this.jst(JSONForm.ARRAY_ITEM_WRAPPER_TEMPLATE_PATH, {
            content: renderContent(i)
          })

        return this.jst(JSONForm.ARRAY_WRAPPER_TEMPLATE_PATH, merge(opts, {
          content: (opts.value || []).map(renderItems)
        }))
      default:
        return this.getField(opts)
    }
  }

  getField (options) {
    return this.jst(JSONForm.FIELD_WRAPPER_TEMPLATE_PATH, {
      content: this.jst(`${JSONForm.TEMPLATE_PATH_PREFIX}${options.type}`, options),
      options
    })
  }

  jst (key, data) { return JSONForm.getTemplate(key)(data) }
}
