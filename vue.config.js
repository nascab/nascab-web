const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'
// const webpack = require('webpack')
// const CompressionWebpackPlugin = require('compression-webpack-plugin')
// const productionGzipExtensions = /\.(js|css|json|txt)(\?.*)?$/i; // 开启gzip压缩， 按需写入
module.exports = {
	lintOnSave: false,
	productionSourceMap: !isProduction,
	transpileDependencies: ['screenfull'],
	css: {
		loaderOptions: {
			sass: {
				prependData: `@import "@/global.scss";`
			}
		}
	},
	devServer: {
		open: true,
		host: '0.0.0.0',
		port: 8081,
		https: false,
		// proxy: {
		// 	'api': {
		// 		target: 'http://localhost/api',
		// 		changeOrigin: true,
		// 		pathRewrite: { '^/api': '' }
		// 	}
		// }
	},
	configureWebpack: {
		// plugins: isProduction?[
		// 	// 启用gzip
		// 	new CompressionWebpackPlugin({
		// 		algorithm: 'gzip',
		// 		test:productionGzipExtensions,
		// 		deleteOriginalAssets: true // 是否删除源文件
		// 	})
		// ]:[],
		optimization: {
			minimizer: [
				new UglifyJsPlugin({
					uglifyOptions: {
						// 删除注释
						output: {
							comments: false
						},
						// 删除console debugger 删除警告
						compress: {
							drop_console: true,
							drop_debugger: true,
							pure_funcs: ['console.log'] //移除console
						}
					}
				})
			]
		}
	}
}
