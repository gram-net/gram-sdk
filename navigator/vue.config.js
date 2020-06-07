const Dotenv = require('dotenv-webpack')
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const os = require('os')
module.exports = {
  publicPath: '',
  pluginOptions: {
    cordovaPath: 'src-cordova'
  },  
  devServer: {
    watchOptions: {
      aggregateTimeout: 3000,
      poll: 1000,
      ignored: []
    },
    hot: true,
    disableHostCheck: true,
    overlay: {
      warnings: false,
      errors: false
    }
  },
  css: {
    loaderOptions: {
      sass: {
        implementation: require('sass')
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map',
    node: {
      __dirname: true
    },
    plugins: [new Dotenv(), 
      new StyleLintPlugin({
        context: './src/',
        files: ['**/*.{vue,htm,html,css,sss,less,scss,sass}'],
        // lintDirtyModulesOnly: true
      }),
      new ESLintPlugin({
        context: './src/',
        files: ['**/*.{vue,ts,tsx}'],
        configFile: '.eslintrc.json',
        // lintDirtyModulesOnly: true,
        outputReport: true,
        fix: true,
        extensions: ['ts', 'tsx', 'vue']
      })
    ]
  },
  chainWebpack: config => {
    config.module.rule('ts')
    config.module.rule('ts').use('ts-loader')
    // config.rule('ts').use('cache-loader')
    config.plugin('fork-ts-checker')//.tap(options => { return {...options, 'workers': 2, 'memoryLimit': 4096 }});
  }
}
