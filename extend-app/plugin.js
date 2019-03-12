export default (Factor, { pkg }) => {
  return new class {
    constructor() {
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
            Factor[h] = Factor.prototype[h] = core[_p](Factor, { pkg })
          }
        }
      })
    }

    injectPlugins(plugins) {
      const opts = { config: Factor.$config.get() }
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
