// This is the initialization file for the Factor framework.
// Add any config customization to the object that is passed in to the function.
// Anything that needs access to the $filters, $files or $config object should happen inside the setup callback
require("@factor/core")({
  ...require("../package"),
  ...require("yargs").argv,
  baseDir: require("path").resolve(__dirname, "../"),
  setup: Factor => {
    // Override password.json master key handling
    // Factor.$filters.add('master-password', yourPasswordsObject )
  }
})
