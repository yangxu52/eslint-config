import type { Linter } from 'eslint'
import ignore from 'eslint-config-flat-gitignore'

export interface GitignoreOptions {
  /** 解析 `.gitignore` 的工作目录，默认 `process.cwd()`。 */
  cwd?: string
}

/** 读取项目 `.gitignore`；使用非严格模式，文件缺失时不报错。 */
export function gitignore(options: GitignoreOptions = {}): Linter.Config {
  return ignore({
    name: 'yangxu/gitignore',
    strict: false,
    cwd: options.cwd,
  })
}
