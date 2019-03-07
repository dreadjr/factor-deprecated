const Factor = require("vue")

module.exports = config => {
  return new class {
    constructor() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      Factor.use({
        install(Factor) {
          Factor[`$filters`] = Factor.prototype[
            `$filters`
          ] = require("@factor/plugin-filters")(Factor, config)
        }
      })

      Factor.use({
        install(Factor) {
          Factor[`$files`] = Factor.prototype[
            `$files`
          ] = require("@factor/plugin-files")(Factor, config)
        }
      })

      const { transpile = false } = config
      if (transpile) {
        require("@babel/register")(Factor.$files.transpilerConfig())
      }
    }
  }()
}
