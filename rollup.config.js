const nodeResolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const copy = require("rollup-plugin-copy");

module.exports = [
  {
    input: "./src/index.ts",
    output: [
      {
        file: "lib/index.js",
        format: "cjs",
        plugins: [terser()]
      },
      // {
      //   file: "lib/index.min.js",
      //   format: "cjs",
      //   plugins: [terser()]
      // },
      {
        file: "lib/index.mjs",
        format: "esm",
        plugins: [terser()]
      }
      // {
      //   file: "lib/index.esm.min.mjs",
      //   format: "esm",
      //   plugins: [terser()]
      // }
      // {
      //   dir: "lib",
      //   format: "es",
      //   exports: "named",
      //   preserveModules: true,
      //   entryFileNames: "[name].[format].mjs"
      // },
      // {
      //   dir: "lib/cjs",
      //   format: "cjs",
      //   exports: "named",
      //   preserveModules: true
      // }
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      copy({
        targets: [
          { src: "./package.json", dest: "lib/" },
          { src: "./README.md", dest: "lib/" }
        ]
      })
    ],
    external: ["react", "react-dom", /node_modules/]
  }
];
