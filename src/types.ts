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
  /**
   * 是否启用 TypeScript 层（`.ts`、`.mts`、`.cts`、`.tsx`）。
   *
   * 关闭后这些扩展会被忽略，且与 `vue` 相互独立。
   *
   * @default true
   */
  typescript?: boolean
  /**
   * 是否启用 Vue 层（`.vue`）。
   *
   * 关闭后 `.vue` 会被忽略；与 `typescript` 相互独立，
   * 开启 Vue 不会启用 TypeScript 层。
   *
   * @default true
   */
  vue?: boolean
}
