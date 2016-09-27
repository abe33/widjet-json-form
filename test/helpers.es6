import {evaluateKey} from '../src/utils'

export const compactHTML = str => str.trim().replace(/>\s+</g, '><')

export const getTemplate = str => data =>
  str.replace(/\{\{([^}]+)\}\}/g, (m, k) => evaluateKey(k.trim(), data))

export function loadTemplates () {
  beforeEach(() => {
    window.requestAnimationFrame = (fn) => fn()
    window.JST = {
      'templates/form/form': getTemplate('<form>{{ content }}</form>'),
      'templates/form/field': getTemplate('<div class="field {{ type }}">{{ content }}</div>'),
      'templates/form/object': getTemplate('<fieldset><legend>{{ name }}</legend>{{ content }}</fieldset>'),
      'templates/form/array': getTemplate('<ul>{{ content }}</ul>'),
      'templates/form/arrayItem': getTemplate('<li>{{ content }}</li>'),
      'templates/form/string': getTemplate('{{ name }}:string'),
      'templates/form/markdown': getTemplate('{{ name }}:markdown')
    }
  })
}
