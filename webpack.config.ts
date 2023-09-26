import path from "path";

const config = {
  entry: {
    inputs: {
      import: "./src/index.ts",
      filename: "inputs.js"
    }
  },
  externals: ["react"],
  cache: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: { extensions: [".ts"], fallback: { crypto: false } },
  output: {
    library: {
      type: "commonjs"
    },
    path: path.resolve(__dirname, "lib")
  }
};

export { config };
