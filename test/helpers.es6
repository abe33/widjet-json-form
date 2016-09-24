export const evaluateKey = (key, obj) => {
  const keyPath = key.split('.')
  let localValue = obj

  do { localValue = localValue[keyPath.shift()] } while (keyPath.length)

  return localValue
}

export const getTemplate = str => data =>
  str.replace(/\{\{([^}]+)\}\}/g, (m, k) => evaluateKey(k.trim(), data))

export function loadTemplates () {
  beforeEach(() => {
    window.requestAnimationFrame = (fn) => fn()
    window.JST = {
      'templates/form/form-wrapper': getTemplate('<form>{{ content }}</form>'),
      'templates/form/field-wrapper': getTemplate('<div class="field {{ options.type }}">{{ content }}</div>'),
      'templates/form/string': getTemplate('{{ setting }}:string'),
      'templates/form/markdown': getTemplate('{{ setting }}:markdown')
    }
  })
}
