const webpack = require("webpack");
const path = require("path");

module.exports = function(env = { dev: "true" }) {
    const buildForDev = env.dev;
    const distFolder = path.join(__dirname, "dist");
    console.log(`Building webpack with env ${JSON.stringify(env)}. buildForDev = ${env.dev}`);
    const config = {
        entry: "./index.js",
        output: {
            path: distFolder,
            filename: "capp-cache.js",
        },
        devtool: buildForDev ? "eval" : "source-map",
        plugins: buildForDev
            ? []
            : [
		        new webpack.DefinePlugin({
			        'process.env.NODE_ENV': '"production"'
		        }),
                  new webpack.optimize.UglifyJsPlugin({
                      output: { comments: false },
                      sourceMap: true,
	                  mangle: true,
	                  compress: {
		                  warnings: false, // Suppress uglification warnings
		                  pure_getters: true,
		                  unsafe: true,
		                  unsafe_comps: true,
		                  screw_ie8: true
	                  },
                  }),
              ],
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
