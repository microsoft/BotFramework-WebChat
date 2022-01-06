const webpack = require('webpack');

require("expose-loader");

const coreConfig = {
    devtool: "source-map",
    
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.(tsx|ts)?$/,
                loader: "awesome-typescript-loader"
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: [/node_modules/]
            },
            {
                test: require.resolve('adaptivecards'),
                use: [{ loader: 'expose-loader', options: 'AdaptiveCards' }]
            },
            {
                test: /\.js$/,
                include: /(node_modules\/engine.io-client|node_modules\/socket.io-client|node_modules\/smartsupp-websocket|device-detector-js)/,
                loader: 'babel-loader',
                options: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};

const chatConfig = {
    entry: "./src/BotChat.ts",
    output: {
        libraryTarget: "window",
        library: "BotChat",
        filename: "./botchat.js"
    }
}

const chatWithPolyfillConfig = {
    entry: "./src/BotChatWithPolyfill.ts",
    output: {
        libraryTarget: "window",
        library: "BotChat",
        filename: "./botchat-es5.js"
    }
}

// Config for addon features
const featureConfig = {
    entry: {
        CognitiveServices: "./src/CognitiveServices/lib.ts"
    },
    output: {
        libraryTarget: "window",
        library: "[name]",
        filename: "./[name].js",
    }
}

module.exports = [
    Object.assign(chatConfig, coreConfig),
    Object.assign(chatWithPolyfillConfig, coreConfig),
    Object.assign(featureConfig, coreConfig)
];
