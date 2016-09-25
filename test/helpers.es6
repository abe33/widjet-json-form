import {evaluateKey} from '../src/utils'

export const compactHTML = str => str.trim().replace(/>\s+</g, '><')

export const getTemplate = str => data =>
  str.replace(/\{\{([^}]+)\}\}/g, (m, k) => evaluateKey(k.trim(), data))

export function loadTemplates () {
  beforeEach(() => {
    window.requestAnimationFrame = (fn) => fn()
    window.JST = {
      'templates/form/form-wrapper': getTemplate('<form>{{ content }}</form>'),
      'templates/form/field-wrapper': getTemplate('<div class="field {{ options.type }}">{{ content }}</div>'),
      'templates/form/fieldset-wrapper': getTemplate('<fieldset><legend>{{ setting }}</legend>{{ content }}</fieldset>'),
      'templates/form/array-wrapper': getTemplate('<ul>{{ content }}</ul>'),
      'templates/form/array-item-wrapper': getTemplate('<li>{{ content }}</li>'),
      'templates/form/string': getTemplate('{{ setting }}:string'),
      'templates/form/markdown': getTemplate('{{ setting }}:markdown')
    }
  })
}
