module.exports = {
    entry: "./src/frontend/backlog.app/backlog.app.js",
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
            },
            {
                test: /\.jsx$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015']
                }
            },
        ]
    }
};
