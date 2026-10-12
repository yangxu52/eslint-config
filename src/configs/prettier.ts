import type { Linter } from 'eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

/** Prettier 兼容层：关闭与 Prettier 冲突的 ESLint 规则，位于内置规则之后、用户配置之前。 */
export function prettier(): Linter.Config {
  return {
    ...eslintConfigPrettier,
    name: 'yangxu/prettier-conflicts',
  }
}
