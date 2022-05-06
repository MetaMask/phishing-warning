module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      globals: {
        window: 'readonly',
      },
    },

    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['rollup.config.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },

    {
      files: ['*.test.ts'],
      extends: ['@metamask/eslint-config-jest'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        // disabled to allow use of Jest tags to set inline test environment options
        'jsdoc/check-tag-names': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/', '*.d.ts'],
};
