const pluginVue = require('eslint-plugin-vue')
const pluginImport = require('eslint-plugin-import')

module.exports = [
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module'
      }
    },
    rules: {
      // allow paren-less arrow functions
      'arrow-parens': 0,
      // allow async-await
      'generator-star-spacing': 0,
      // allow debugger during development
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
      'vue/require-prop-types': 0,
      'vue/no-unused-vars': 0,
      'no-tabs': 0,
      'vue/multi-word-component-names': 0,
      'vue/no-reserved-component-names': 0
    },
    ignores: [
      'build/*.js',
      'config/*.js'
    ]
  }
]
