module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: ['html'],
  env: {
    browser: true
  },
  settings: {
    ecmascript: 6,
    'import/resolver': {
      webpack: {
        config: 'build/webpack.base.conf.js'
      }
    }
  },
  rules: {
    'comma-dangle': ['error', 'never'],
    'no-param-reassign': [
      2,
      {
        props: false
      }
    ],

    // eslint doesn't currently understand webpack aliases
    'import/no-extraneous-dependencies': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,

    'no-underscore-dangle': 0,

    // allow debugger and console during development
    'no-console': process.env.NODE_ENV === 'production' ? 2 : 1,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1
  }
};
