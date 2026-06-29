# Redhat Actions TS Config

[![tsconfig](https://img.shields.io/npm/v/@aardbol-actions/tsconfig?label=@aardbol-actions/tsconfig&logo=typescript&logoColor=red)](https://npmjs.com/@aardbol-actions/tsconfig)

## Install

```sh
npm i -D @aardbol-actions/tsconfig
```

Then create `tsconfig.json`:
```json
{
  "extends": "@aardbol-actions/tsconfig",
  "compilerOptions": {
    "rootDir": "src/",
    "outDir": "out/"
  },
  "include": [
    "src/"
  ],
}
```

Also see [our ESLint config](https://npmjs.com/@aardbol-actions/eslint-config).
