import type { Linter } from 'eslint'

/** 通用生成目录忽略，保持最小范围，避免误忽略源码目录。 */
export const GLOBAL_IGNORES = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/out/**', '**/.cache/**']

export function ignores(): Linter.Config {
  return {
    name: 'yangxu/ignores',
    ignores: GLOBAL_IGNORES,
  }
}
