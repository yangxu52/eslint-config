import type { Linter } from 'eslint'

import { gitignore } from './configs/gitignore'
import { ignores } from './configs/ignores'
import { javascript } from './configs/javascript'
import { prettier } from './configs/prettier'
import { typescript } from './configs/typescript'
import { vue } from './configs/vue'
import type { CreateConfigOptions, FlatConfigInput } from './types'

function isConfigArray(input: FlatConfigInput): input is readonly Linter.Config[] {
  return Array.isArray(input)
}

function toConfigArray(input: FlatConfigInput): Linter.Config[] {
  return isConfigArray(input) ? [...input] : [input]
}

/**
 * 生成 yangxu 的 Flat Config 数组。
 *
 * 契约：同步执行；内置配置层先生成，用户配置最后追加；
 * 返回新数组，不修改用户传入的对象与数组。
 *
 * 内置配置层顺序：ignores → gitignore → javascript → typescript → vue → prettier-conflicts。
 * 其中 typescript 与 vue 层可按选项独立关闭（默认全开），关闭时对应扩展进入 ignores。
 */
export function createConfig(options: CreateConfigOptions = {}, ...userConfigs: FlatConfigInput[]): Linter.Config[] {
  const readGitignore = options.gitignore !== false
  const useTypeScript = options.typescript !== false
  const useVue = options.vue !== false

  const internalConfigs: Linter.Config[] = [
    ignores({ typescript: useTypeScript, vue: useVue }),
    ...(readGitignore ? [gitignore()] : []),
    ...javascript(),
    ...(useTypeScript ? typescript() : []),
    ...(useVue ? vue() : []),
    prettier(),
  ]

  return [...internalConfigs, ...userConfigs.flatMap(toConfigArray)]
}
