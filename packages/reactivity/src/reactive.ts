import { isObject } from "@vue/shared"
import { mutableHandlers, shallowReactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

// 是不是仅读，是不是深度，柯里化
// new Proxy() 拦截数据的获取和设置 GET SET

const reactiveMap = new WeakMap() // 会自动垃圾回收，不会造成内存泄露，存储的key只能是对象
const readonlyMap = new WeakMap()
export function createReactiveObject(target, isReadonly, baseHandlers) {
  // 如果目标不是对象直接返回, reactive这个api只能拦截对象类型
  if (!isObject(target)) {
    return target
  }

  // 如果某个对象已经被代理过了，就不需要再次代理了，可能一个对象被代理是深度，又被代理仅读代理了
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existProxy = proxyMap.get(target)
  if (existProxy) {
    return existProxy // 如果已经被代理，直接返回即可
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy) // 将要代理的对象和对应的代理结果缓存

  return proxy
}

export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}
