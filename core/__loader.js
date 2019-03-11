const Factor = require("vue")

module.exports = ({ config }) => {
  return new class {
    constructor() {
      const plugins = require(Factor.$filters.get("plugins-loader"))

      for (var _p in plugins) {
        if (plugins[_p]) {
          if (typeof plugins[_p] == "function") {
            Factor.use({
              install(Factor) {
                const h = `$${_p}`
                Factor[h] = Factor.prototype[h] = plugins[_p](Factor, {
                  config
                })
              }
            })
          } else {
            Factor.use(plugins[_p], config)
          }
        }
      }
    }
  }()
}
