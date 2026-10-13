import type { Linter } from 'eslint'

import { GLOB_TS, GLOB_TSX, GLOB_VUE } from '../globs'

/** 通用生成目录忽略，保持最小范围，避免误忽略源码目录。 */
export const GLOBAL_IGNORES = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/out/**', '**/.cache/**']

/** 层级开关对忽略范围的输入。 */
export interface IgnoreOptions {
  /** 关闭时忽略 `.ts`、`.mts`、`.cts`、`.tsx`。 */
  typescript?: boolean
  /** 关闭时忽略 `.vue`。 */
  vue?: boolean
}

/**
 * 生成全局忽略层：通用目录始终忽略，关闭的层级对应扩展一并忽略。
 *
 * 关闭即忽略，避免关闭后出现「无匹配配置」的不确定行为。
 */
export function ignores(options: IgnoreOptions = {}): Linter.Config {
  const { typescript = true, vue = true } = options

  return {
    name: 'yangxu/ignores',
    ignores: [...GLOBAL_IGNORES, ...(typescript ? [] : [...GLOB_TS, ...GLOB_TSX]), ...(vue ? [] : GLOB_VUE)],
  }
}
