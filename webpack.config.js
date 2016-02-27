module.exports = {
    entry: "./src/nutricalc/log/frontend/logger.page/app.js",
    output: {
        path: __dirname,
        filename: "./src/nutricalc/log/static/log/logger.page.app.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            }
        ]
    }
};
