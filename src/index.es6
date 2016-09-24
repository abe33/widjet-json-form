import widgets from 'widjet'
import {getNode} from 'widjet-utils'
import JSONForm from './json-form'

widgets.define('json-form', (container) => {
  let valuesString

  const schema = JSON.parse(container.getAttribute('data-form'))
  const values = (valuesString = container.getAttribute('data-values')) != null
    ? JSON.parse(valuesString)
    : {}

  const id = container.getAttribute('data-id')
  const form = new JSONForm({schema, values, id})
  container.formWidget = form

  container.appendChild(getNode(form.render()))

  window.requestAnimationFrame(() => widgets.dispatch('json-form:ready', {form}))
})
