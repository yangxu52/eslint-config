import { relative, resolve } from 'node:path'

import type { Rule } from 'eslint'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import type { FlatConfigInput } from '../src/index.ts'
import { createConfig } from '../src/index.ts'

type LintResult = Awaited<ReturnType<ESLint['lintText']>>[number]

const fixturesDir = resolve('test/fixtures')

function eslintWithoutGitignore(...userConfigs: FlatConfigInput[]): ESLint {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: createConfig({ gitignore: false }, ...userConfigs),
  })
}

async function lintFixtures(): Promise<Map<string, LintResult>> {
  const results = await eslintWithoutGitignore().lintFiles(['test/fixtures/**/*'])
  return new Map(results.map((result) => [relative(fixturesDir, result.filePath), result]))
}

function ruleIds(result: LintResult | undefined): (string | null)[] {
  return result?.messages.map((message) => message.ruleId) ?? []
}

const lintableFixtures = [
  'basic.js',
  'module.mjs',
  'common.cjs',
  'component.jsx',
  'types.ts',
  'types.mts',
  'types.cts',
  'component.tsx',
  'Widget.vue',
  'WidgetJs.vue',
  'WidgetTs.vue',
]

describe('fixture matrix', () => {
  it('parses every fixture without fatal errors', async () => {
    const results = await lintFixtures()
    for (const file of lintableFixtures) {
      expect(results.has(file), file).toBe(true)
      expect(results.get(file)?.fatalErrorCount, file).toBe(0)
    }
  })

  it('applies core recommended on JavaScript', async () => {
    const results = await lintFixtures()
    expect(ruleIds(results.get('basic.js'))).toContain('no-debugger')
  })

  it('applies TypeScript rules on TypeScript', async () => {
    const results = await lintFixtures()
    expect(ruleIds(results.get('types.ts'))).toContain('@typescript-eslint/no-unused-vars')
  })

  it('applies Vue template rules', async () => {
    const results = await lintFixtures()
    expect(ruleIds(results.get('WidgetTs.vue'))).toContain('vue/require-v-for-key')
  })

  it('ignores files under dist', async () => {
    const results = await lintFixtures()
    expect(results.has('dist/ignored.js')).toBe(false)
  })
})

describe('user configuration', () => {
  it('appends user config last and lets it override built-in rules', async () => {
    const results = await eslintWithoutGitignore({ rules: { 'no-debugger': 'off' } }).lintText('debugger\n', { filePath: 'a.js' })
    expect(ruleIds(results[0])).not.toContain('no-debugger')
  })

  it('lets user files scoping and languageOptions take effect', async () => {
    const eslint = eslintWithoutGitignore({
      files: ['**/*.special.js'],
      languageOptions: { globals: { myGlobal: 'readonly' } },
      rules: { 'no-undef': 'error' },
    })

    const matched = await eslint.lintText('myGlobal\n', { filePath: 'a.special.js' })
    expect(ruleIds(matched[0])).not.toContain('no-undef')

    const unmatched = await eslint.lintText('myGlobal\n', { filePath: 'a.js' })
    expect(ruleIds(unmatched[0])).toContain('no-undef')
  })

  it('lets user plugins and rules take effect', async () => {
    const plugin: { rules: Record<string, Rule.RuleModule> } = {
      rules: {
        flag: {
          create(context) {
            return {
              Program(node) {
                context.report({ node, message: 'flagged' })
              },
            }
          },
        },
      },
    }

    const eslint = eslintWithoutGitignore({ plugins: { custom: plugin }, rules: { 'custom/flag': 'error' } })
    const results = await eslint.lintText('const a = 1\n', { filePath: 'a.js' })
    expect(ruleIds(results[0])).toContain('custom/flag')
  })
})

describe('gitignore end-to-end', () => {
  it('ignores files listed in .gitignore from cwd', async () => {
    const previous = process.cwd()
    process.chdir(fixturesDir)
    try {
      const eslint = new ESLint({ cwd: fixturesDir, overrideConfigFile: true, overrideConfig: createConfig() })
      expect(await eslint.isPathIgnored(resolve('ignored-by-gitignore.js'))).toBe(true)
    } finally {
      process.chdir(previous)
    }
  })
})
