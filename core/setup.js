const Factor = require("vue")

module.exports = config => {
  return new class {
    constructor() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      const filtersPlugin = require("./tools/plugin-filters")
      const filesPlugin = require("./tools/plugin-files")

      Factor.use({
        install(Factor) {
          Factor[`$filters`] = Factor.prototype[`$filters`] = filtersPlugin(
            Factor,
            config
          )
        }
      })

      Factor.use({
        install(Factor) {
          Factor[`$files`] = Factor.prototype[`$files`] = filesPlugin(
            Factor,
            config
          )
        }
      })

      const { transpile = false } = config
      if (transpile) {
        require("@babel/register")(Factor.$files.transpilerConfig())
      }
    }
  }()
}
