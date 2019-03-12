const Factor = require("vue")

module.exports = async FACTOR_CONFIG => {
  // Add aliases for modules
  // This allows us to use the same format for node/webpack
  // (otherwise webpack doesn't allow variables in imports)
  require("module-alias/register")
  require("@babel/register")(require("./transpile.js")())

  require("@factor/extend-build")(Factor, FACTOR_CONFIG)

  // User defined setup hook
  // The code that trigger this should be in the start.js in the app 'config' folder
  if (typeof FACTOR_CONFIG.setup == "function") {
    FACTOR_CONFIG.setup(Factor)
  }

  if (FACTOR_CONFIG.build) {
    await Factor.$filters.get("build-production")
  }

  Factor.$filters.get("server", "")
}
