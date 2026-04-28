import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/**", "node_modules/**", ".npm-cache/**", "package/**", "pnpm.cjs", "npm.tgz"]
  }
];

export default eslintConfig;
