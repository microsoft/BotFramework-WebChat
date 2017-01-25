var webpack = require('webpack');

module.exports = {
    entry: {
        app: ["./built/BotChat.js"],
    },
    output: {
        libraryTarget: "umd",
        library: "BotChat",
        filename: "./botchat.js",
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin()
    ],

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js"]
    },

    module: {
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
    },
};