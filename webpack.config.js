const webpack_rules = [];
let babelLoader = {
    test: /\.js$/,
    exclude: /(node_modules|bower_components)/,
    use: {
        loader: "babel-loader",
        options: {
            presets: ["@babel/preset-env"]
        }
    }
};
webpack_rules.push(babelLoader);
module.exports = {
    mode: "development",
    entry: {
        extension: './src/PianoAnalyticsAVInsightsTHEOplayerAdapter.js',
    },
    output: {
        filename: 'PianoAnalyticsAVInsightsTHEOplayerAdapter.min.js',
        path: __dirname + '/dist'
    },
    resolve: {
        extensions: [".js"]
    },
    module: {
        rules: webpack_rules
    }
};