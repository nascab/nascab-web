const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'
const GenerateAssetPlugin = require('generate-asset-webpack-plugin')
const path = require('path')
const fs = require('fs')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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

		plugins: [
			// new BundleAnalyzerPlugin(
			// 	{
			// 		analyzerMode: 'static',//可选值有server static disabled
			// 		generateStatsFile: false,
			// 		statsOptions: { source: false },
			// 		openAnalyzer: false
			// 	}
			// ),
			//用插件 打包的时候把package.json带上
			new GenerateAssetPlugin({
				filename: 'package.json', // 定义生成的文件名
				fn: (compilation, cb) => {
					cb(null, fs.readFileSync(path.resolve(__dirname, 'package.json')));
				},
				extraFiles: []
			})
		],
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
