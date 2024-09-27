export default {
  // Global options:
  verbose: true,
  // Command options:
  build: {
    overwriteDest: true,
  },
  ignoreFiles: [
    'package-lock.json',
    'package.json',
    'debug',
    'src',
    'dist/reactor-ux.umd.js',
    'tsconfig.json',
    'viteconfig.json',
    'web-ext-config.mjs',
  ],
};