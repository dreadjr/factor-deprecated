const findNodeModules = require("find-node-modules")
const fs = require("fs")
const path = require("path")
const consola = require("consola")
import Factor from "vue"

export function extendApp(config) {
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
        Factor.use({
          install(Factor) {
            const h = `$${_p}`
            Factor[h] = Factor.prototype[h] = plugins[_p](Factor, { config })
          }
        })
      } else {
        Factor.use(plugins[_p], config)
      }
    }
  }
}
