const fs = require('fs')
const execa = require('execa') // 开启子进程，最终还是使用rollup进行打包

const targets = fs.readdirSync('packages').filter(f => {
  // 过滤packages下的文件夹
  return fs.statSync(`packages/${f}`).isDirectory()
})

// 对每个包进行并行打包
async function build(target) {
  await execa(
    'rollup',
    ['-c', '--environment', `TARGET:${target}`],
    { stdio: 'inherit' }
  )
}

function runParallel(targets, iteratorFn) {
  const res = []
  for (const item of targets) {
    const p = iteratorFn(item)
    res.push(p)
  }
  return Promise.all(res)
}

runParallel(targets, build)
