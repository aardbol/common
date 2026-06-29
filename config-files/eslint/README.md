# Redhat Actions ESLint Config

[![eslint-config](https://img.shields.io/npm/v/@aardbol-actions/eslint-config?label=@aardbol-actions/eslint&logo=eslint&logoColor=red)](https://npmjs.com/@aardbol-actions/eslint-config)

## Install
```sh
npm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin && \
    npm i -D @aardbol-actions/eslint-config
```

Then create `.eslintrc.js` with the following contents:
```js
module.exports = {
    extends: [
        "@aardbol-actions/eslint-config",
    ],
};
```

This config file includes rules that require the TypeScript types. See [our tsconfig](https://npmjs.com/@aardbol-actions/tsconfig).
