import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { gitignore } from '../src/configs/gitignore.ts'
import { createConfig } from '../src/index.ts'

describe('gitignore layer', () => {
  it('is enabled by default and can be disabled', () => {
    expect(createConfig().some((config) => config.name === 'yangxu/gitignore')).toBe(true)
    expect(createConfig({ gitignore: false }).some((config) => config.name === 'yangxu/gitignore')).toBe(false)
  })

  it('reads .gitignore from the working directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'yangxu-gitignore-'))
    writeFileSync(join(dir, '.gitignore'), 'ignored-thing.js\n')

    const config = gitignore({ cwd: dir })

    expect(config.name).toBe('yangxu/gitignore')
    expect(config.ignores?.some((pattern) => pattern.includes('ignored-thing.js'))).toBe(true)

    rmSync(dir, { recursive: true, force: true })
  })

  it('does not throw when .gitignore is missing (non-strict)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'yangxu-nogitignore-'))
    const previous = process.cwd()
    process.chdir(dir)
    try {
      expect(() => createConfig()).not.toThrow()
    } finally {
      process.chdir(previous)
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
