module.exports = {
  productionSourceMap: false,
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          quietDeps: true
        }
      }
    }
  },
  configureWebpack: {
    performance: {
      hints: false
    }
  }
};
