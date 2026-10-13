import type { Linter } from 'eslint'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

import { GLOB_VUE } from '../globs'

/** Vue 层：官方 Vue、JavaScript 和 TypeScript recommended，仅作用于 `.vue`。 */
export function vue(): Linter.Config[] {
  const vueFiles = [...GLOB_VUE]

  return [
    ...pluginVue.configs['flat/recommended'].map((config) => ({
      ...config,
      files: vueFiles,
      name: config.name ? config.name.replace('vue/', 'yangxu/vue/') : 'yangxu/vue/config',
    })),
    {
      name: 'yangxu/vue',
      files: vueFiles,
      languageOptions: {
        parserOptions: {
          parser: tseslint.parser,
          extraFileExtensions: ['.vue'],
          sourceType: 'module',
        },
      },
    },
    {
      name: 'yangxu/vue/javascript',
      files: vueFiles,
      rules: {
        ...js.configs.recommended.rules,
      },
    },
    ...tseslint.configs.recommended.map((config) => {
      // Vue parser remains the outer parser; only reuse TS rules and plugin.
      const { languageOptions: _languageOptions, ...rulesConfig } = config as Linter.Config
      return {
        ...rulesConfig,
        files: vueFiles,
        name: config.name ? config.name.replace('typescript-eslint/', 'yangxu/vue/typescript/') : 'yangxu/vue/typescript/rules',
      }
    }),
  ]
}
