const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  indexPath: 'index.html',

  pages: {
    index: {
      entry: 'src/main.ts',
      template: 'public/index3.html',
    },
  },

  publicPath: process.env.NODE_ENV === 'production'
    ? '/gencalc3-test/'
    : '/',
  outputDir: 'docs',
  assetsDir: './',
  publicPath: './',

  pluginOptions: {
    i18n: {
      locale: 'ja',
      fallbackLocale: 'ja',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  }
})
