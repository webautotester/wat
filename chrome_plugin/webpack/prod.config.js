const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const webpack = require('webpack');

module.exports = merge(baseConfig, {

	plugins: [
		new webpack.DefinePlugin({
			BASE_URL : JSON.stringify('https://wat.promyze.com'),
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin()
	]
});