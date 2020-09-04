const webpack = require('webpack');
const webpackDevConfig = require('./webpack.config');

module.exports = webpackDevConfig.map(config => ({
    ...config,
    mode: "production",
    optimization: {
      minimize: true,
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ]
}));
