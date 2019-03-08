const Factor = require("vue")

module.exports = async pkg => {
  pkg.transpile = true
  pkg.coreDir = __dirname

  const config = require(`./setup`)(pkg)

  require("./loader")({ config })

  if (config.build) {
    await Factor.$filters.applyFilters("build-production", config)
  }

  Factor.$filters.applyFilters("server", "", config)
}
