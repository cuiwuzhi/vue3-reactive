import { isArray, isIntegerKey } from "@vue/shared"
import { TriggerOpTypes } from "./operators"

let uid = 0 // 标识用来区分effect
let activeEffect // 存储当前的effect
const effectStack = [] // effect栈，保证当前的effect是正确的顺序
const targetMap = new WeakMap()

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    // 保证effect没有加入栈中才添加，避免死循环无限添加导致内存溢出
    if (!effectStack.includes(effect)) {
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn() // 函数执行会取值，会执行get方法
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }

  effect.id = uid++
  effect._isEffect = true // 用来标识这个是响应式的effect
  effect.raw = fn // 保留effect对应的原函数
  effect.options = options // 在effect上保存用户的配置信息

  return effect
}

/**
 * 让effect变成响应式，数据修改后重新执行响应函数
 * @param fn 响应函数
 * @param options 配置项
 */
export function effect(fn, options: any = {}) {
  const effect = createReactiveEffect(fn, options)

  if (!options.lazy) {
    // 响应式的effect默认先执行一次
    effect()
  }

  return effect
}

/**
 * 收集依赖，让某个对象的中的属性收集当前它对应的effect函数
 * @param target 目标对象
 * @param key 健
 * @param type 操作类型
 */
export function track(target, key, type) {
  if (!activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set))
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }

  // console.log('targetMap', targetMap)

}

/**
 * 找到属性对应的effect，触发之前收集的effect (数组/对象)
 * @param target 目标对象
 * @param key 健
 * @param value 值
 * @param type 操作类型-新增属性/修改属性
 * @param oldVal 旧的数据类型
 */
export function trigger(target, type, key?, value?, oldVal?) {
  console.log(target, type, key, value, oldVal)

  // 如果当前属性没有收集过effect，那就不需要处理
  const depsMap = targetMap.get(target)
  // console.log(depsMap)
  if (!depsMap) return

  // 将所有要执行的effect全部存储到一个集合中，最终一起执行
  const effects = new Set()

  const collectEffects = effectsArray => {
    if (effectsArray) {
      effectsArray.forEach(effect => effects.add(effect))
    }
  }

  // 数组的情况，检查是否修改的数组长度
  if (isArray(target) && key === 'length') {
    depsMap.forEach((dep, k) => {
      // 如果更改的长度小于收集的索引，那么这个索引也需要触发effect重新执行
      if (k === 'length' || k > value) {
        collectEffects(dep)
      }
    })
  } else {
    // 可能是对象
    if (key) {
      collectEffects(depsMap.get(key))
    }

    // 如果修改的是数组中某一项索引
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          // 如果添加了一个索引就触发长度的更新
          collectEffects(depsMap.get('length'))
        }
    }
  }

  effects.forEach((effect: Function) => {
    // 执行effect更新
    effect()
  })

}
