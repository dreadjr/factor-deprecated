import Vue from "vue"

export function extendApp(opts) {
  const { dependencies } = opts.config

  const plugins = Object.keys(dependencies)
    .filter(_ => {
      return _.includes("factor") && _.includes("plugin") ? true : false
    })
    .map(plugin => {
      return require(plugin).default
    })

  for (var _p in plugins) {
    if (plugins[_p]) {
      if (typeof plugins[_p] == "function") {
        Vue.use({
          install(Vue) {
            const h = `$${_p}`
            Vue[h] = Vue.prototype[h] = plugins[_p](Vue, opts)
          }
        })
      } else {
        Vue.use(plugins[_p], opts)
      }
    }
  }
}
