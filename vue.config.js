const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.module
      .rule('worker')
      .test(/\.worker\.js$/)  // ou .worker.ts si tu utilises TypeScript
      .use('worker-loader')
      .loader('worker-loader')
      .options({
        inline: true, // permet d'inclure le worker dans le bundle final
      })
      .end();
  },
})
