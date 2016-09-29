let nextID = 0

export function getNextID () { return nextID++ }

export function isJSON (s) { return s.match(/^\{|^\[/) }

export function asTuple (object) {
  return Object.keys(object).map(key => [key, object[key]])
}

export function getTypeAndParameters (type) {
  let parameters = {}

  if (typeof type === 'string' && isJSON(type)) {
    type = JSON.parse(type)
  }

  if (type && type.type) {
    parameters = type
    type = type.type
  }

  return [type, parameters]
}

export function evaluateKey (key, obj) {
  const keyPath = key.split('.')
  let localValue = obj

  do { localValue = localValue[keyPath.shift()] } while (keyPath.length)

  return localValue
}
