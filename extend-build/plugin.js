module.exports = (Factor, FACTOR_CONFIG) => {
  return new class {
    constructor() {
      Factor.FACTOR_CONFIG = FACTOR_CONFIG

      Factor.FACTOR_ENV = "build"
      this.setup()
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      const _ = {}
      _.filters = require(`@factor/core-filters`)
      _.paths = require(`@factor/core-paths`)
      _.keys = require(`@factor/core-keys`)
      _.config = require(`@factor/core-config`)

      _.files = require(`@factor/core-files`)

      Factor.use({
        install(Factor) {
          for (var _p in _) {
            const h = `$${_p}`
            Factor[h] = Factor.prototype[h] = _[_p](Factor)
          }
        }
      })

      require(`@factor/core-app`)(Factor, { target: "build" })

      const plugins = require(Factor.$paths.get("plugins-loader-build"))
      this.injectPlugins(plugins)
    }

    injectPlugins(plugins) {
      for (var _p in plugins) {
        if (plugins[_p]) {
          if (typeof plugins[_p] == "function") {
            Factor.use({
              install(Factor) {
                const h = `$${_p}`
                Factor[h] = Factor.prototype[h] = plugins[_p](Factor)
              }
            })
          }
        }
      }
    }
  }()
}
