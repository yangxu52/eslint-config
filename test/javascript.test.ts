import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { javascript } from '../src/configs/javascript.ts'
import { createConfig } from '../src/index.ts'

function eslintWithoutGitignore(): ESLint {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: createConfig({ gitignore: false }),
  })
}

describe('javascript layer', () => {
  it.each([
    ['a.js', 'export const a = 1\n'],
    ['a.mjs', 'export const a = 1\n'],
    ['a.cjs', 'const a = 1\nmodule.exports = a\n'],
    ['a.jsx', 'export const a = <div />\n'],
  ])('parses %s', async (filePath, code) => {
    const results = await eslintWithoutGitignore().lintText(code, { filePath })
    expect(results[0]?.fatalErrorCount).toBe(0)
  })

  it('ignores dist/coverage/node_modules but not src', async () => {
    const eslint = eslintWithoutGitignore()
    await expect(eslint.isPathIgnored('dist/a.js')).resolves.toBe(true)
    await expect(eslint.isPathIgnored('coverage/a.js')).resolves.toBe(true)
    await expect(eslint.isPathIgnored('node_modules/a.js')).resolves.toBe(true)
    await expect(eslint.isPathIgnored('src/a.js')).resolves.toBe(false)
  })

  it('enables @eslint/js recommended rules', async () => {
    const results = await eslintWithoutGitignore().lintText('debugger\n', { filePath: 'a.js' })
    expect(results[0]?.messages.map((message) => message.ruleId)).toContain('no-debugger')
  })

  it('does not target .vue files', () => {
    const files = javascript().flatMap((config) => (config.files as string[] | undefined) ?? [])
    expect(files.some((glob) => glob.endsWith('.vue'))).toBe(false)
  })
})
