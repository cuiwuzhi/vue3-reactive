export const isObject = v => (v !== null && typeof v === 'object')

export const isArray = Array.isArray

export const isFunction = v => typeof v === 'function'

export const isNumber = v => typeof v === 'number'

export const isString = v => typeof v === 'string'

export const isIntegerKey = v => parseInt(v) + '' === v

export const hasOwnProperty = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

export const hasChanged = (oldVal, curVal) => oldVal !== curVal

export const extend = Object.assign