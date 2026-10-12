import type { Linter } from 'eslint'
import globals from 'globals'
import js from '@eslint/js'

import { GLOB_JS, GLOB_JSX } from '../globs'

/** JavaScript 基础层：官方 recommended、最新 ECMAScript、Module、JSX 与常用全局变量。 */
export function javascript(): Linter.Config[] {
  return [
    {
      name: 'yangxu/javascript',
      files: [...GLOB_JS, ...GLOB_JSX],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
          ...globals.browser,
          ...globals.node,
          ...globals.builtin,
        },
        parserOptions: {
          ecmaFeatures: { jsx: true },
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      rules: {
        ...js.configs.recommended.rules,
      },
    },
  ]
}
