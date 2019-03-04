module.exports = (transpiled = false) => {
  if (!transpiled) {
    require("@babel/register")({
      ignore: [
        // **not** compiled if `true` is returned.
        function(filepath) {
          return !!!filepath.includes("@factor")
        }
      ],
      plugins: [
        "@babel/plugin-transform-modules-commonjs",
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-transform-regenerator",
        "dynamic-import-node",
        "@babel/plugin-transform-runtime"
      ],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: ["ie >= 9", "> 1%", "last 2 versions"]
            },

            modules: "cjs" // the default value is auto
          }
        ]
      ]
    })
  }
}
