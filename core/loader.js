const findNodeModules = require("find-node-modules")
const fs = require("fs")
const path = require("path")
const consola = require("consola")
import Vue from "vue"

export function extendApp(opts) {
  const { dependencies } = opts.config

  const nodeModulesFolders = findNodeModules()

  const plugins = []

  const group = "@factor"

  nodeModulesFolders
    .map(folder => path.resolve(folder, `./${group}`))
    .forEach(folder => {
      if (fs.existsSync(folder)) {
        fs.readdirSync(folder)
          .filter(_ => {
            return _.includes("plugin") ? true : false
          })
          .forEach(folder => {
            try {
              const plugin = require(`${group}/${folder}`)
              plugins.push(plugin.default)
            } catch (error) {
              consola.error(error)
            }
          })
      }
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
