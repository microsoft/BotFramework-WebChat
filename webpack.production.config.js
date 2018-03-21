const webpack = require('webpack');
const webpackDevConfig = require('./webpack.config');

module.exports = webpackDevConfig.map(config => ({
    ...config,
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            },
            sourceMap: true
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ]
}));
