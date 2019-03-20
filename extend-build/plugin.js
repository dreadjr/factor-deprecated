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

      this.addCoreExtension("filters", require(`@factor/core-filters`))
      this.addCoreExtension("paths", require(`@factor/core-paths`))

      const aliases = Factor.$paths.getAliases()

      this.addCoreExtension("keys", require(`@factor/core-keys`))
      this.addCoreExtension("files", require(`@factor/core-files`))
      this.addCoreExtension("config", require(`@factor/core-config-admin`))

      const transpiler = require("@factor/core-transpiler")(Factor)

      transpiler.register({ target: "build" })

      require(`@factor/core-app`)(Factor, { target: "build" })

      const plugins = require(Factor.$paths.get("plugins-loader-build"))
      this.injectPlugins(plugins)
      this.initializeBuild()
      transpiler.copyTranspilerConfig()
    }

    addCoreExtension(id, extension) {
      Factor.use({
        install(Factor) {
          Factor[`$${id}`] = Factor.prototype[`$${id}`] = extension(Factor)
        }
      })
    }

    initializeBuild() {
      this._runCallbacks(Factor.$filters.apply("initialize-build", {}))
    }

    _runCallbacks(callbacks) {
      for (var key in callbacks) {
        const cb = callbacks[key]
        if (cb && typeof cb == "function") {
          cb()
        }
      }
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
