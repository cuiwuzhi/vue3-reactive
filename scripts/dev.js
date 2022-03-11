// 只针对具体某个包打包
const fs = require('fs')
const execa = require('execa') // 开启子进程，最终还是使用rollup进行打包

const target = 'reactivity'

// 对每个包进行并行打包
async function build(target) {
  await execa(
    'rollup',
    ['-cw', '--environment', `TARGET:${target}`],
    { stdio: 'inherit' } // 子进程的打包信息共享给父进程
  )
}

build(target)
