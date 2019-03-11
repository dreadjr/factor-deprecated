export default (Factor, { pkg }) => {
  return new class {
    constructor() {
      console.log("NEW CLASS")
    }

    // extendBuild() {
    //   this.setup()

    //   Factor.use({
    //     install(Factor) {
    //       Factor.$files = Factor.prototype.$files = require(`@factor/files`)(Factor, { pkg })
    //     }
    //   })

    //   const plugins = require(Factor.$filters.get("plugins-loader-build"))
    //   this.injectPlugins(plugins)
    // }

    extendApp() {
      this.setup()

      console.log("plugins loader app", Factor.$filters.get("plugins-loader-app"))

      // const plugins = require(Factor.$filters.get("plugins-loader-app"))

      // this.injectPlugins(plugins)
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      Factor.use({
        install(Factor) {
          Factor.$filters = Factor.prototype.$filters = require(`@factor/filters`)(Factor, { pkg })
        }
      })

      Factor.use({
        install(Factor) {
          Factor.$config = Factor.prototype.$config = require(`@factor/config`)(Factor, { pkg })
        }
      })
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
  }()
}
