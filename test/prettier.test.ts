import type { Linter } from 'eslint'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { prettier } from '../src/configs/prettier.ts'
import { createConfig } from '../src/index.ts'

function eslintWith(...userConfigs: Linter.Config[]): ESLint {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: createConfig({ gitignore: false }, ...userConfigs),
  })
}

describe('prettier conflicts layer', () => {
  it('is the last internal layer', () => {
    expect(createConfig({ gitignore: false }).at(-1)?.name).toBe('yangxu/prettier-conflicts')
  })

  it('disables core, TypeScript and Vue formatting rules', () => {
    const rules = prettier().rules ?? {}
    const conflictRules = [
      'semi',
      'quotes',
      'indent',
      '@typescript-eslint/semi',
      '@typescript-eslint/comma-dangle',
      'vue/html-indent',
      'vue/max-attributes-per-line',
    ]

    for (const rule of conflictRules) {
      const value = rules[rule] as unknown
      expect(value === 'off' || value === 0, `${rule} should be off`).toBe(true)
    }
  })

  it('lets the user re-enable a formatting rule after the layer', async () => {
    const code = 'const a = 1\n'

    const off = await eslintWith().lintText(code, { filePath: 'a.js' })
    expect(off[0]?.messages.some((message) => message.ruleId === 'semi')).toBe(false)

    const on = await eslintWith({ rules: { semi: ['error', 'always'] } }).lintText(code, { filePath: 'a.js' })
    expect(on[0]?.messages.some((message) => message.ruleId === 'semi')).toBe(true)
  })

  it('does not emit prettier/prettier diagnostics', async () => {
    const results = await eslintWith().lintText('<template>\n  <div>hi</div>\n</template>\n', { filePath: 'a.vue' })
    expect(results[0]?.messages.some((message) => message.ruleId === 'prettier/prettier')).toBe(false)
  })
})
