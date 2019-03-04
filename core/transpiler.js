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
        "dynamic-import-node"
      ],
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: ["ie >= 9", "> 1%", "last 2 versions"]
            },
            useBuiltIns: "usage",
            modules: "cjs" // the default value is auto
          }
        ]
      ]
    })
  }

  require(`./init`)
}
