import type { Linter } from 'eslint'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

import { GLOB_VUE } from '../globs'

/** Vue 层：官方 flat recommended，仅作用于 `.vue`；`<script>` 块统一用 TypeScript parser。 */
export function vue(): Linter.Config[] {
  return [
    ...pluginVue.configs['flat/recommended'].map((config) => ({
      ...config,
      files: [...GLOB_VUE],
      name: config.name ? config.name.replace('vue/', 'yangxu/vue/') : 'yangxu/vue/config',
    })),
    {
      name: 'yangxu/vue',
      files: [...GLOB_VUE],
      languageOptions: {
        parserOptions: {
          parser: tseslint.parser,
          extraFileExtensions: ['.vue'],
          sourceType: 'module',
        },
      },
    },
  ]
}
