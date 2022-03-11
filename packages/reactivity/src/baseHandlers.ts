// 实现new Proxy(target, handler)

import { extend, hasChanged, hasOwnProperty, isArray, isIntegerKey, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"
import { readonly, reactive } from "./reactive"

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)
const readonlySetHandler = {
  set(target, key) {
    console.warn(`Set operation on key "${key}" failed: target is readonly.`, target)
  }
}

/**
 * 创建代理的get Handle 拦截GET功能
 * @param isReadonly 是否只读
 * @param isShallow 是不是浅的
 */
function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const value = Reflect.get(target, key, receiver)

    // 不是只读的，收集依赖
    if (!isReadonly) {
      // 执行effect时会取值，收集依赖
      track(target, key, TrackOpTypes.GET)
    }

    // 浅的直接返回
    if (isShallow) {
      return value
    }

    if (isObject(value)) {
      return isReadonly ? readonly(value) : reactive(value)
    }

    return value
  }
}

// 拦截设置SET功能
function createSetter(isShallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key] // 获取老的值

    const hasKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwnProperty(target, key)

    const res = Reflect.set(target, key, value, receiver) // target[key] = value
    // 区分是新增的还是修改的  vue2无法监控更改索引，无法监控数组的长度 -> hack方法特殊处理

    // 当数据更新时，通知对应属性的effect重新执行

    if (!hasKey) {
      // 新增
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }

    return res
  }
}

export const mutableHandlers = { get, set }

export const shallowReactiveHandlers = { get: shallowGet, set: shallowSet }

export const readonlyHandlers = extend({ get: readonlyGet }, readonlySetHandler)

export const shallowReadonlyHandlers = extend({ get: shallowReadonlyGet }, readonlySetHandler)
