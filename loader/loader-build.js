module.exports = (Factor, { pkg }) => {
  return new class {
    constructor() {}

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      Factor.$baseDir = Factor.prototype.$baseDir = pkg.baseDir

      const coreUtils = ["filters"]

      if (require("detect-node")) {
        coreUtils.push("config")
        coreUtils.push("files")
      }

      coreUtils.forEach(_ => {
        Factor.use({
          install(Factor) {
            Factor[`$${_}`] = Factor.prototype[`$${_}`] = require(`@factor/${_}`)(Factor, { pkg })
          }
        })
      })
    }

    extendBuild() {
      const plugins = require(Factor.$filters.get("plugins-loader-build"))
      this.injectPlugins(plugins)
    }

    extendApp() {
      const plugins = require(Factor.$filters.get("plugins-loader-app"))

      this.injectPlugins(plugins)
    }

    injectPlugins(plugins) {
      const opts = { config: Factor.$config.getPublicConfig() }
      for (var _p in plugins) {
        if (plugins[_p]) {
          if (typeof plugins[_p] == "function") {
            Factor.use({
              install(Factor) {
                const h = `$${_p}`
                Factor[h] = Factor.prototype[h] = plugins[_p](Factor, opts)
              }
            })
          } else {
            Factor.use(plugins[_p], opts)
          }
        }
      }
    }

    // registerComponents() {
    //   // Use this hook to add components dynamically
    //   const callbacks = Factor.$filters.applyFilters("register-components", {})
    //   for (var _m in callbacks) {
    //     if (callbacks[_m]) {
    //       if (typeof callbacks[_m] == "function") {
    //         callbacks[_m]()
    //       }
    //     }
    //   }

    //   // Utility to simply register a global component instance
    //   // Alternatively the register-components filter could be used along with native 'Factor.component()'
    //   const _components = Factor.$filters.applyFilters("components", {})
    //   for (var _c in _components) {
    //     if (_components[_c]) {
    //       Factor.component(_c, _components[_c])
    //     }
    //   }
    // }

    // loadMixins() {
    //   const mixins = Factor.$filters.applyFilters("mixins", {})

    //   Object.keys(mixins).forEach(key => {
    //     if (typeof mixins[key] == "function") {
    //       mixins[key]()
    //     }
    //   })
    // }
  }()
}
