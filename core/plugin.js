const Factor = require("vue")

module.exports = async FACTOR_CONFIG => {
  // Add aliases for modules
  // This allows us to use the same format for node/webpack
  // (otherwise webpack doesn't allow variables in imports)

  require("@factor/extend-build")(Factor, FACTOR_CONFIG)

  const {
    setup,
    cli: { build }
  } = FACTOR_CONFIG

  // User defined setup hook
  // The code that trigger this should be in the start.js in the app 'config' folder
  if (typeof setup == "function") {
    setup(Factor)
  }

  if (build) {
    await Factor.$filters.apply("build-production")
  }

  Factor.$filters.apply("server")
}
