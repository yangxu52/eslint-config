import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { createConfig } from '../src/index.ts'

function eslintWith(): ESLint {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: createConfig({ gitignore: false }),
  })
}

describe('typescript layer', () => {
  it.each([
    ['a.ts', 'const x: number = 1\nexport {}\n'],
    ['a.mts', 'const x: number = 1\nexport {}\n'],
    ['a.cts', 'const x: number = 1\nexport {}\n'],
    ['a.tsx', 'export const x = <div />\n'],
  ])('parses %s', async (filePath, code) => {
    const results = await eslintWith().lintText(code, { filePath })
    expect(results[0]?.fatalErrorCount).toBe(0)
  })

  it('parses type syntax with the TS parser, not Espree', async () => {
    const results = await eslintWith().lintText('export const x: Record<string, number> = {}\n', { filePath: 'a.ts' })
    expect(results[0]?.fatalErrorCount).toBe(0)
  })

  it('reports unused via @typescript-eslint, not core no-unused-vars', async () => {
    const results = await eslintWith().lintText('const unused = 1\n', { filePath: 'a.ts' })
    const ruleIds = results[0]?.messages.map((message) => message.ruleId) ?? []
    expect(ruleIds).toContain('@typescript-eslint/no-unused-vars')
    expect(ruleIds).not.toContain('no-unused-vars')
  })

  it('runs without a tsconfig.json (non type-aware)', async () => {
    const results = await eslintWith().lintText('export const n: number = 1\n', { filePath: 'a.ts' })
    expect(results[0]?.fatalErrorCount).toBe(0)
    expect(results[0]?.messages.some((message) => message.ruleId?.includes('no-unsafe'))).toBe(false)
  })
})
