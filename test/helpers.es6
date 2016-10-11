import {evaluateKey} from '../src/utils'

const trim = s => s.replace(/^\s+|\s+$/g, '')

export const compactHTML = str =>
  trim(str).replace(/>\s+</g, '><').toLowerCase()

export const getTemplate = str => data =>
  str.replace(/\{\{([^}]+)\}\}/g, (m, k) => evaluateKey(trim(k), data))

export function loadTemplates () {
  beforeEach(() => {
    window.requestAnimationFrame = (fn) => fn()
    window.JST = {
      'json-form/form': getTemplate('<form>{{ content }}</form>'),
      'json-form/field': getTemplate('<div class="field {{ type }}">{{ content }}</div>'),
      'json-form/object': getTemplate('<fieldset><legend>{{ name }}</legend>{{ content }}</fieldset>'),
      'json-form/array': getTemplate('<ul>{{ content }}</ul>'),
      'json-form/arrayItem': getTemplate('<li>{{ content }}</li>'),
      'json-form/string': getTemplate('{{ name }}:string'),
      'json-form/markdown': getTemplate('{{ name }}:markdown')
    }
  })
}
