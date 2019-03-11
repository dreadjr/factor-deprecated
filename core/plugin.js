const Factor = require("vue")

module.exports = async pkg => {
  pkg.coreDir = __dirname

  require("@babel/register")(require("./transpile.js")())

  const loader = require("@factor/loader").loaderBuild(Factor, { pkg, target: "build" })

  loader.setup()
  loader.extendBuild()

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
