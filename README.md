# eslint-config-yangxu

Personal ESLint Flat Config for JavaScript, TypeScript, JSX/TSX and Vue.

## Requirements

- ESLint `^10.0.0` (Flat Config only; ESLint 9 is not supported)
- Node `^22.19.0 || ^24.11.0 || >=26.0.0`
- ESM

## Install

```bash
pnpm add -D eslint eslint-config-yangxu
```

## Usage

```js
import { createConfig } from 'eslint-config-yangxu'

export default createConfig()
```

### Options

```ts
interface CreateConfigOptions {
  /** Read the project `.gitignore`. @default true */
  gitignore?: boolean
}
```

### Append your own Flat Config

Additional configs are appended after all built-in layers, so they can override anything:

```js
import { createConfig } from 'eslint-config-yangxu'

export default createConfig(
  {},
  {
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/no-v-html': 'off',
    },
  }
)
```

## What is included

- `@eslint/js` recommended
- `typescript-eslint` recommended (non type-aware)
- `eslint-plugin-vue` flat recommended
- `eslint-config-prettier/flat` (disables ESLint rules that conflict with Prettier)
- `.gitignore` (non-strict), plus a minimal set of build dirs: `node_modules`, `dist`, `coverage`, `out`, `.cache`

## Config order

```text
yangxu/ignores
yangxu/gitignore
yangxu/javascript
yangxu/typescript
yangxu/vue
yangxu/prettier-conflicts
user configs
```

## Notes

- Prettier runs separately. This package never runs Prettier; it only disables conflicting ESLint rules.
- Type-aware linting is not enabled.
- Only ESLint 10 is supported.

## License

MIT
