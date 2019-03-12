export default (Factor, FACTOR_CONFIG) => {
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
      core.filters = require(`@factor/filters`)
      core.config = require(`@factor/config`)

      Factor.use({
        install(Factor) {
          for (var _p in core) {
            const h = `$${_p}`
            Factor[h] = Factor.prototype[h] = core[_p](Factor)
          }
        }
      })

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

    registerComponents() {
      const callbacks = Factor.$filters.get("register-components", {})
      for (var _m in callbacks) {
        if (callbacks[_m]) {
          if (typeof callbacks[_m] == "function") {
            callbacks[_m](this.opts)
          }
        }
      }

      const _components = Factor.$filters.get("components", {})
      for (var _c in _components) {
        if (_components[_c]) {
          Factor.component(_c, _components[_c])
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
