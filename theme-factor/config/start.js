// This is the initialization file for the Factor framework.
// Add any config customization to the object that is passed in to the function.

require("@factor/core")({
  ...require("../package").factor,
  ...require("yargs").argv,
  baseDir: require("path").resolve(__dirname, "../")
})
