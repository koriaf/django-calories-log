module.exports = {
    entry: "./src/frontend/backlog.app/app.js",
    output: {
        path: __dirname,
        filename: "./src/nutricalc/backlog/static/backlog/backlog.app.bundle.js"
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
