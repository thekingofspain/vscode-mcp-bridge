const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: './out/tests/tests/e2e/**/*.test.js',
  version: 'stable',
  mocha: {
    ui: 'bdd',
    timeout: 60000,
    color: true,
    reporter: 'spec'
  },
  launchArgs: [
    '--disable-gpu',
    '--disable-workspace-trust',
    '--new-window'
    // Removed --disable-extensions to avoid the notification
  ]
});
