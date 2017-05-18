const webpack = require("webpack");
const path = require("path");

module.exports = function(env = { dev: "true" }) {
    const buildForDev = env.dev;
    const distFolder = path.join(__dirname, buildForDev ? "_dist" : "dist");
    console.log(
        `Building webpack with env ${JSON.stringify(env)}. buildForDev = ${env.dev}`
    );
    const config = {
        entry: "./index.js",
        output: {
            path: distFolder,
            filename: "capp-cache.js",
        },
        devtool: buildForDev ? "eval-source-map" : "source-map",
        plugins: buildForDev ? [] : [new webpack.optimize.UglifyJsPlugin([])],
        devServer: {
            hot: true,
            contentBase: distFolder,
        },
        module: {
            rules: buildForDev
                ? []
                : [
                      {
                          test: /\.js$/,
                          exclude: /(^node_modules$)/,
                          use: {
                              loader: "babel-loader",
                              options: {
                                  presets: ["env"],
                              },
                          },
                      },
                  ],
        },
    };
    console.log(`building with config ${JSON.stringify(config, null, 2)}`);
    return config;
};
