const webpack = require('webpack');

require('expose-loader');

const tsLintOptions = {
    // can specify a custom config file relative to current directory or with absolute path
    // 'tslint-custom.json'
    configFile: 'tslint.json',

    // tslint errors are displayed by default as warnings
    // set emitErrors to true to display them as errors
    emitErrors: false,

    // tslint does not interrupt the compilation by default
    // if you want any file with tslint errors to fail
    // set failOnHint to true
    failOnHint: true,

    // enables type checked rules like 'for-in-array'
    // uses tsconfig.json from current working directory
    typeCheck: false,

    // automatically fix linting errors
    fix: true,

    // can specify a custom tsconfig file relative to current directory or with absolute path
    // to be used with type checked rules
    tsConfigFile: 'tsconfig.json',
};

const coreConfig = {
    devtool: 'source-map',

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            // All files with '.ts' or '.tsx' will first be handle by 'tslint-loader'
            {
                test: /\.tsx?$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                exclude: /node_modules/,
                options: tsLintOptions
            },
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader',
                exclude: [/node_modules/]
            },
            {
                test: require.resolve('adaptivecards'),
                use: [{ loader: 'expose-loader', options: 'AdaptiveCards' }]
            }
        ]
    }
};

const chatConfig = {
    entry: './src/BotChat.ts',
    output: {
        libraryTarget: 'umd',
        library: 'BotChat',
        filename: './botchat.js'
    }
}

const chatWithPolyfillConfig = {
    entry: './src/BotChatWithPolyfill.ts',
    output: {
        libraryTarget: 'umd',
        library: 'BotChat',
        filename: './botchat-es5.js'
    }
}

// Config for addon features
const featureConfig = {
    entry: {
        CognitiveServices: './src/CognitiveServices/lib.ts'
    },
    output: {
        libraryTarget: 'umd',
        library: '[name]',
        filename: './[name].js'
    }
}

module.exports = [
    Object.assign(chatConfig, coreConfig),
    Object.assign(chatWithPolyfillConfig, coreConfig),
    Object.assign(featureConfig, coreConfig)
];
