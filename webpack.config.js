const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },

  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
};
