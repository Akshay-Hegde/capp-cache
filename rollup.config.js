// Rollup plugins
import babel from "rollup-plugin-babel";

export default {
  entry: "index.js",
  dest: "dist/capp-cache_r.js",
  format: "iife",
  // sourceMap: 'inline',
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
  ],
};
