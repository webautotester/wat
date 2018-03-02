const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports =  {
	context: path.resolve(__dirname,'..'),
	entry: {
		background: './src/background.js',
		popup: './src/popup.jsx',
		listener: './src/attachListener.js'
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, '../crx')
	},
	resolve: {
		extensions:['.js','.jsx']
	},
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			include: path.resolve(__dirname,'../src'),
			use: 'babel-loader'
		}]
	},
	plugins: [
		new CopyPlugin([
			{ from: './src/manifest.json', to: 'manifest.json' },
			{ from: './src/favicon.js', to: 'favicon.js' },
			{ from: './src/icon.png', to: 'icon.png' },
			{ from: './src/popup.html', to: 'popup.html' }
		]),
	]
};