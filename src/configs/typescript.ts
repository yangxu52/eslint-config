import type { Linter } from 'eslint'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

import { GLOB_TS, GLOB_TSX } from '../globs'

/** TypeScript 层：官方 recommended（非类型感知），解析器与规则仅作用于 TS/TSX。 */
export function typescript(): Linter.Config[] {
  const files = [...GLOB_TS, ...GLOB_TSX]

  return [
    {
      name: 'yangxu/typescript',
      files,
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { sourceType: 'module' },
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.builtin,
        },
      },
      rules: {
        ...js.configs.recommended.rules,
      },
    },
    ...tseslint.configs.recommended.map((config) => ({
      ...config,
      files,
      name: config.name ? config.name.replace('typescript-eslint/', 'yangxu/typescript/') : 'yangxu/typescript/rules',
    })),
  ]
}
