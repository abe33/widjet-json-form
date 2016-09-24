let nextID = 0

const isJSON = s => s.match(/^\{|^\[/)
const getNextID = () => nextID++

export default class JSONForm {
  static TEMPLATE_PATH_PREFIX = 'templates/form/'
  static FORM_WRAPPER_TEMPLATE_PATH = 'templates/form/form-wrapper'
  static FIELD_WRAPPER_TEMPLATE_PATH = 'templates/form/field-wrapper'

  static getTemplate (key) { return window.JST[key] }

  static render (schema, values) {
    let form = new JSONForm({schema, values})
    return form.render()
  }

  constructor (options = {}) {
    this.schema = options.schema || {}
    this.values = options.values || {}
    this.id = options.id || getNextID()
  }

  render () {
    let content = ''

    for (let setting in this.schema) {
      let type = this.schema[setting]

      const id = `${setting}-${this.id}`
      let parameters = {}

      if (typeof type === 'string' && isJSON(type)) {
        type = JSON.parse(type)
      }

      if (type && typeof type === 'object') {
        parameters = type
        type = type.type
      }

      content += this.getField(type, {
        id,
        type,
        setting,
        parameters,
        value: this.values[setting]
      })
    }

    return this.jst(JSONForm.FORM_WRAPPER_TEMPLATE_PATH, {
      id: this.id,
      content
    })
  }

  getField (type, options) {
    return this.jst(JSONForm.FIELD_WRAPPER_TEMPLATE_PATH, {
      content: this.jst(`${JSONForm.TEMPLATE_PATH_PREFIX}${type}`, options),
      options
    })
  }

  jst (key, data) { return JSONForm.getTemplate(key)(data) }
}
