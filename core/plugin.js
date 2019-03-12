const Factor = require("vue")

module.exports = async pkg => {
  pkg.coreDir = __dirname

  // Add aliases for modules
  // This allows us to use the same format for node/webpack
  // (otherwise webpack doesn't allow variables in imports)
  require("module-alias/register")
  require("@babel/register")(require("./transpile.js")())

  require("@factor/extend-build")(Factor, { pkg })

  // User defined setup hook
  // The code that trigger this should be in the start.js in the app 'config' folder
  if (typeof pkg.setup == "function") {
    pkg.setup(Factor)
  }

  if (pkg.build) {
    await Factor.$filters.applyFilters("build-production", pkg)
  }

  Factor.$filters.applyFilters("server", "", pkg)
}
