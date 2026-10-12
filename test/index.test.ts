import { describe, expect, it } from 'vitest'

import * as entry from '../src/index.ts'

describe('package entry', () => {
  it('只公开 createConfig，不泄露内部模块', () => {
    expect(typeof entry.createConfig).toBe('function')
    expect(Object.keys(entry)).toHaveLength(1)
    expect(Object.keys(entry)).toContain('createConfig')
  })
})
