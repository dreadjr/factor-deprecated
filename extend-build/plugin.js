module.exports = (Factor, FACTOR_CONFIG) => {
  return new class {
    constructor() {
      Factor.$pkg = FACTOR_CONFIG
      this.setup()
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      const _ = {}
      _.filters = require(`@factor/filters`)
      _.paths = require(`@factor/paths`)
      _.keys = require(`@factor/keys`)
      _.files = require(`@factor/files`)
      _.config = require(`@factor/config`)

      Factor.use({
        install(Factor) {
          for (var _p in _) {
            const h = `$${_p}`
            Factor[h] = Factor.prototype[h] = _[_p](Factor)
          }
        }
      })

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
