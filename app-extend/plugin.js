export default (Factor, FACTOR_CONFIG, target) => {
  return new class {
    constructor() {
      Factor.FACTOR_CONFIG = FACTOR_CONFIG
      Factor.FACTOR_ENV = "app"
      this.setup()
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      this.addCoreExtension("filters", require(`@factor/filters`))
      this.addCoreExtension("config", require(`@factor/app-config`))

      require(`@factor/app`)(Factor, { target: "app" })

      const plugins = require("@generated/load-plugins-app")
      this.injectPlugins(plugins)
    }

    addCoreExtension(id, extension) {
      Factor.use({
        install(Factor) {
          Factor[`$${id}`] = Factor.prototype[`$${id}`] = extension(Factor)
        }
      })
    }

    injectPlugins(plugins) {
      for (var _p in plugins) {
        if (plugins[_p]) {
          const plugin = plugins[_p]

          if (typeof plugin == "function") {
            Factor.use({
              install(Factor) {
                const h = `$${_p}`

                Factor[h] = Factor.prototype[h] = plugin(Factor)
              }
            })
          }
        }
      }
    }

    _runCallbacks(callbacks) {
      for (var key in callbacks) {
        const cb = callbacks[key]
        if (cb && typeof cb == "function") {
          cb()
        }
      }
    }

    initializeApp() {
      this._runCallbacks(Factor.$filters.apply("initialize-app", {}))
      this._runCallbacks(Factor.$filters.apply("after-initialize-app", {}))

      const comps = Factor.$filters.apply("components", {})
      for (var _ in comps) {
        if (comps[_]) {
          Factor.component(_, comps[_])
        }
      }

      if (target == "client") {
        const directives = Factor.$filters.apply("client-directives", {})

        for (var _ in directives) {
          if (directives[_]) {
            Factor.directive(_, directives[_])
          }
        }
      }
    }

    mixinApp() {
      const mixins = Factor.$filters.get("mixins", {})

      Object.keys(mixins).forEach(key => {
        if (typeof mixins[key] == "function") {
          mixins[key]()
        }
      })
    }
  }()
}
