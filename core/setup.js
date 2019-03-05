const Vue = require("vue")

module.exports = args => {
  return new class {
    constructor() {
      Vue.config.productionTip = false
      Vue.config.devtools = true
      Vue.config.silent = false

      const filtersPlugin = require("./lib/plugin-filters")
      const filesPlugin = require("./lib/plugin-files")

      Vue.use({
        install(Vue) {
          Vue[`$filters`] = Vue.prototype[`$filters`] = filtersPlugin(Vue, args)
        }
      })

      Vue.use({
        install(Vue) {
          Vue[`$files`] = Vue.prototype[`$files`] = filesPlugin(Vue, args)
        }
      })

      const { transpile = false } = args
      if (transpile) {
        require("@babel/register")(Vue.$files.transpilerConfig())
      }
    }
  }()
}
