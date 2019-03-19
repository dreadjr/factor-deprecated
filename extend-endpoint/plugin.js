module.exports = (Factor, FACTOR_CONFIG) => {
  return new class {
    constructor() {
      Factor.FACTOR_CONFIG = FACTOR_CONFIG
      Factor.FACTOR_ENV = "endpoint"
      this.setup()
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = false
      Factor.config.silent = true

      const _ = {}
      _.filters = require(`@factor/core-filters`)
      _.paths = require(`@factor/core-paths`)
      _.paths = require(`@factor/core-keys`)
      _.config = require(`@factor/core-config`)

      Factor.use({
        install(Factor) {
          for (var plug in _) {
            Factor[`$${plug}`] = Factor.prototype[`$${plug}`] = _[plug](Factor)

            if (plug == "filters" && typeof FACTOR_CONFIG.setup == "function") {
              FACTOR_CONFIG.setup()
            }
          }
        }
      })
    }
  }()
}
