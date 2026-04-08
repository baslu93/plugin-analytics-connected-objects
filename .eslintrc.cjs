module.exports = {
  extends: ['eslint-config-salesforce-typescript', 'plugin:sf-plugin/recommended'],
  ignorePatterns: [
    '.eslintrc.cjs', 
    'dist', 
    'node_modules'
  ]
};
