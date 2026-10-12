import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import { createConfig } from '../src/index.ts'

describe('createConfig', () => {
  it('返回 Linter.Config[]', () => {
    const result = createConfig()
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual([])
  })

  it('单对象与数组输入均可用，且保持用户配置顺序', () => {
    const a: Linter.Config = { rules: { 'no-alert': 'error' } }
    const b: Linter.Config = { rules: { 'no-console': 'warn' } }
    const c: Linter.Config = { rules: { 'no-debugger': 'error' } }

    expect(createConfig({}, a)).toEqual([a])
    expect(createConfig({}, [a, b])).toEqual([a, b])
    expect(createConfig({}, a, [b, c])).toEqual([a, b, c])
  })

  it('不修改用户传入的对象与数组，且返回新数组', () => {
    const single: Linter.Config = { rules: { 'no-alert': 'error' } }
    const list: Linter.Config[] = [{ rules: { 'no-console': 'warn' } }]
    const listRef = list

    const result = createConfig({}, single, list)

    expect(single).toEqual({ rules: { 'no-alert': 'error' } })
    expect(list).toHaveLength(1)
    expect(list[0]).toEqual({ rules: { 'no-console': 'warn' } })

    // 返回新数组，用户数组引用未被复用
    expect(result).not.toBe(listRef)
    // 用户配置对象按引用保留，但未被复制或改动
    expect(result[0]).toBe(single)
    expect(result[1]).toBe(list[0])
  })

  it('同步返回，不含 Promise 或 Composer', () => {
    const result = createConfig({ gitignore: false }, { rules: {} })
    expect(Array.isArray(result)).toBe(true)
    expect(result).not.toBeInstanceOf(Promise)
  })
})
