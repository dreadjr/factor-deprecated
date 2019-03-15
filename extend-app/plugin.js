export default (Factor, FACTOR_CONFIG, target) => {
  return new class {
    constructor() {
      Factor.$pkg = FACTOR_CONFIG
      this.setup()
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      const core = {}
      core.filters = require(`@factor/core-filters`)
      core.config = require(`@factor/core-config`)

      Factor.use({
        install(Factor) {
          for (var _p in core) {
            const h = `$${_p}`
            Factor[h] = Factor.prototype[h] = core[_p](Factor)
          }
        }
      })

      require(`@factor/core-app`)(Factor, { target: "app" })

      const plugins = require("@generated/load-plugins-app")
      this.injectPlugins(plugins)
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
      this._runCallbacks(Factor.$filters.get("initialize-app", {}))
      this._runCallbacks(Factor.$filters.get("after-initialize-app", {}))

      const comps = Factor.$filters.get("components", {})
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
