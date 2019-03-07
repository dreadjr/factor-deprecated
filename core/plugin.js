const Factor = require("vue")

module.exports = async config => {
  config.transpile = true
  config.coreDir = __dirname

  require(`./setup`)(config)

  require("./loader")(config)

  if (config.build) {
    await Factor.$filters.applyFilters("build-production", config)
  }

  Factor.$filters.applyFilters("server", "", config)
}
