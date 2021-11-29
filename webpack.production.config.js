const webpack = require('webpack');
const webpackDevConfig = require('./webpack.config');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = webpackDevConfig.map(config => ({
    ...config,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
		new UglifyJsPlugin({
			sourceMap: true,
			parallel: true
		}),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ],
}));
