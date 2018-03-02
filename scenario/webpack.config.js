const path = require('path');
const libraryName = 'index';
const outputFile = libraryName + '.js';


module.exports = {
	entry: ['babel-polyfill','./src/library.js'],  
	output: {
		filename: outputFile,
		path: path.resolve(__dirname, 'lib'),
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			include: path.resolve(__dirname,'src'),
			use: 'babel-loader'
		}]
	},
};