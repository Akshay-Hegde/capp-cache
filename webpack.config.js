const path = require("path");

const distFolder = path.join(__dirname, "_dist");
module.exports = {
    entry: "./index.js",
    output: {
        path: distFolder,
        filename: "bundle.js",
    },
    devtool: "eval-source-map",
    devServer: {
        hot: true,
        contentBase: distFolder,
    },
    module: {
        rules: [
            /*
             {
                test: /\.js$/,
                exclude: /(^node_modules$)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["env"]
                    }
                }
            }
*/
        ],
    },
};
