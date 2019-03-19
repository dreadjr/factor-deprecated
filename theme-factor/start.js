// This is the initialization file for the Factor framework.
// Add any config customization to the object that is passed in to the function.
const cli = { ...require("yargs").argv, cwd: process.cwd }
const pkg = require("./package")

// Add configuration options to the 'factor' key in package.json
// Or to factor.config.js
let conf = {}
try {
  conf = require("./factor-config")
} catch {}

const FACTOR_CONFIG = {
  baseDir: __dirname,
  setup: Factor => {
    // Override password.json master key handling
    // Factor.$filters.add('master-password', yourPasswordsObject )
  },
  factor: { ...pkg.factor, ...conf },
  cli
}

// This is the initialization file for the Factor framework.
// Add any config customization to the object that is passed in to the function.
// Anything that needs access to the $filters, $files or $config object should happen inside the setup callback
require("@factor/core")(FACTOR_CONFIG)
