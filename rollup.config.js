import path from 'path'
import json from '@rollup/plugin-json'
import resolvePlugin from '@rollup/plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'

// 找到packages目录
const packagesDir = path.resolve(__dirname, 'packages')

// 找到要打的包 从环境变量中的target属性获
const packageDir = path.resolve(packagesDir, process.env.TARGET)

// 针对某个模块去找文件
const resolve = (p) => path.resolve(packageDir, p)

const pkg = require(resolve('package.json'))
const pkgName = path.basename(packageDir)

const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${pkgName}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${pkgName}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${pkgName}.global.js`),
    format: 'iife' // 立即执行函数
  }
}

const options = pkg.buildOptions // 自定义打包配置

// 创建rollup配置
function createConfig(format, output) {
  output.name = options.name
  output.sourcemap = true // 生成sourceMap
  // 生成rollup配置
  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [
      json(),
      ts({ // ts插件
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin() // 解析第三方node模块插件
    ]
  }
}

const config = options.formats.map(format => createConfig(format, outputConfig[format]))

export default config
