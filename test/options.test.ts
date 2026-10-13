import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import type { CreateConfigOptions } from '../src/index.ts'
import { createConfig } from '../src/index.ts'

function layerNames(options: CreateConfigOptions): string[] {
  return createConfig({ gitignore: false, ...options }).flatMap((config) => (config.name ? [config.name] : []))
}

function ignoresOf(options: CreateConfigOptions): string[] {
  const config = createConfig({ gitignore: false, ...options }).find((entry) => entry.name === 'yangxu/ignores')
  return config?.ignores ?? []
}

function eslintWith(options: CreateConfigOptions): ESLint {
  return new ESLint({ overrideConfigFile: true, overrideConfig: createConfig({ gitignore: false, ...options }) })
}

describe('createConfig layer switches', () => {
  it('enables the TypeScript and Vue layers by default', () => {
    const names = layerNames({})
    expect(names.some((name) => name.startsWith('yangxu/typescript'))).toBe(true)
    expect(names.some((name) => name.startsWith('yangxu/vue'))).toBe(true)
    expect(ignoresOf({}).some((pattern) => pattern.endsWith('.ts'))).toBe(false)
    expect(ignoresOf({})).not.toContain('**/*.vue')
  })

  it('turns off the TypeScript layer and ignores TS extensions', () => {
    const names = layerNames({ typescript: false })
    expect(names.some((name) => name.startsWith('yangxu/typescript'))).toBe(false)
    expect(names.some((name) => name.startsWith('yangxu/vue'))).toBe(true)
    expect(ignoresOf({ typescript: false })).toEqual(expect.arrayContaining(['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx']))
  })

  it('turns off the Vue layer and ignores .vue', () => {
    const names = layerNames({ vue: false })
    expect(names.some((name) => name.startsWith('yangxu/vue'))).toBe(false)
    expect(names.some((name) => name.startsWith('yangxu/typescript'))).toBe(true)
    expect(ignoresOf({ vue: false })).toContain('**/*.vue')
  })

  it('can disable both layers, leaving JavaScript only', () => {
    const names = layerNames({ typescript: false, vue: false })
    expect(names.some((name) => name.startsWith('yangxu/typescript'))).toBe(false)
    expect(names.some((name) => name.startsWith('yangxu/vue'))).toBe(false)
    expect(names).toContain('yangxu/javascript')
  })

  it('ignores disabled extensions through the real ESLint API', async () => {
    const eslint = eslintWith({ typescript: false, vue: false })
    expect(await eslint.isPathIgnored(resolve('src/x.ts'))).toBe(true)
    expect(await eslint.isPathIgnored(resolve('src/App.vue'))).toBe(true)
    expect(await eslint.isPathIgnored(resolve('src/x.js'))).toBe(false)
  })

  it('keeps Vue independent from the TypeScript layer', async () => {
    const eslint = eslintWith({ typescript: false })
    const results = await eslint.lintText('<script lang="ts">\ndebugger\nconst unused: number = 1\n</script>\n<template><div /></template>\n', {
      filePath: 'a.vue',
    })
    const ruleIds = results[0]?.messages.map((message) => message.ruleId) ?? []
    expect(ruleIds).toContain('no-debugger')
    expect(ruleIds).toContain('@typescript-eslint/no-unused-vars')

    expect(await eslint.isPathIgnored(resolve('src/x.ts'))).toBe(true)
  })
})
