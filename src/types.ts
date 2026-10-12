import type { Linter } from 'eslint'

/** 用户可传入的配置输入：单个配置对象或配置数组（只需支持一层扁平化）。 */
export type FlatConfigInput = Linter.Config | readonly Linter.Config[]

/** `createConfig` 的选项。 */
export interface CreateConfigOptions {
  /**
   * 是否读取项目 `.gitignore`。
   *
   * @default true
   */
  gitignore?: boolean
}
