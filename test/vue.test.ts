import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { vue } from '../src/configs/vue.ts'
import { createConfig } from '../src/index.ts'

function eslintWith(): ESLint {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: createConfig({ gitignore: false }),
  })
}

describe('vue layer', () => {
  it.each([
    ['plain.vue', '<template>\n  <div>hi</div>\n</template>\n'],
    ['js.vue', '<template>\n  <div>hi</div>\n</template>\n<script>\nexport default {}\n</script>\n'],
    ['ts.vue', '<template>\n  <div>hi</div>\n</template>\n<script lang="ts">\nconst n: number = 1\nexport default { n }\n</script>\n'],
  ])('parses %s', async (filePath, code) => {
    const results = await eslintWith().lintText(code, { filePath })
    expect(results[0]?.fatalErrorCount).toBe(0)
  })

  it('applies vue template rules', async () => {
    const results = await eslintWith().lintText('<template>\n  <li v-for="i in 3"></li>\n</template>\n', { filePath: 'a.vue' })
    expect(results[0]?.messages.some((message) => message.ruleId === 'vue/require-v-for-key')).toBe(true)
  })

  it('applies TypeScript rules to a TypeScript script block', async () => {
    const results = await eslintWith().lintText('<script lang="ts">\ndebugger\nconst unused: number = 1\n</script>\n<template><div /></template>\n', {
      filePath: 'a.vue',
    })
    expect(results[0]?.messages.some((message) => message.ruleId === 'no-debugger')).toBe(true)
    expect(results[0]?.messages.some((message) => message.ruleId === '@typescript-eslint/no-unused-vars')).toBe(true)
  })

  it('reports undefined variables in a plain JS script block', async () => {
    const results = await eslintWith().lintText('<script>\nwindow.alert(foo)\n</script>\n<template><div /></template>\n', { filePath: 'a.vue' })
    expect(results[0]?.messages.some((message) => message.ruleId === 'no-undef' && message.message.includes('foo'))).toBe(true)
    expect(results[0]?.messages.some((message) => message.ruleId === 'no-undef' && message.message.includes('window'))).toBe(false)
  })

  it('provides browser and Node globals to .vue', async () => {
    const results = await eslintWith().lintText('<script>\nwindow.alert(process.env.NODE_ENV)\n</script>\n<template><div /></template>\n', {
      filePath: 'a.vue',
    })
    expect(results[0]?.messages.some((message) => message.ruleId === 'no-undef')).toBe(false)
  })

  it('does not report TypeScript type references as undefined', async () => {
    const results = await eslintWith().lintText(
      '<script lang="ts">\ntype Foo = { a: number }\nconst x: Foo = { a: 1 }\nexport default { x }\n</script>\n<template><div /></template>\n',
      { filePath: 'a.vue' }
    )
    expect(results[0]?.messages.some((message) => message.ruleId === 'no-undef')).toBe(false)
  })

  it('keeps no-undef disabled for .ts files (TypeScript layer)', async () => {
    const results = await eslintWith().lintText('window.alert(foo)\n', { filePath: 'a.ts' })
    expect(results[0]?.messages.some((message) => message.ruleId === 'no-undef')).toBe(false)
  })

  it('targets only .vue files', () => {
    const files = vue().flatMap((config) => (config.files as string[] | undefined) ?? [])
    expect(files.length).toBeGreaterThan(0)
    expect(files.every((glob) => glob.endsWith('.vue'))).toBe(true)
  })
})
