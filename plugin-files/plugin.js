const NODE_ENV = process.env.NODE_ENV
const path = require("path")
const glob = require("glob").sync
const fs = require("fs-extra")
const consola = require("consola")
const findNodeModules = require("find-node-modules")
module.exports = (Factor, config) => {
  return new class {
    constructor() {
      this.namespace = "factor"

      this.baseDir = config.baseDir
      this.coreDir = config.coreDir

      this.production = NODE_ENV === "development" ? false : true

      this.build = this.production ? "production" : "development"

      Factor.$filters.add("plugins-loader", () =>
        path.resolve(config.baseDir, "extend/plugins.js")
      )
      Factor.$filters.add("themes-loader", () =>
        path.resolve(config.baseDir, "extend/themes.js")
      )
      Factor.$filters.add("active-loader", () =>
        path.resolve(config.baseDir, "extend/active.js")
      )

      this.generateLoaders()
    }

    generateLoaders() {
      const s = Date.now()
      const { pluginsLoader, themesLoader, activeTheme } = this.getExtensions()

      this.makeLoaderFile({
        loader: pluginsLoader,
        destination: Factor.$filters.get("plugins-loader")
      })

      this.makeLoaderFile({
        loader: themesLoader,
        destination: Factor.$filters.get("themes-loader")
      })

      consola.log(`Made Loaders - ${Date.now() - s}ms`)
      consola.success(`${themesLoader.length} Themes`)
      consola.success(`${pluginsLoader.length} Plugins`)

      if (config.theme == activeTheme) {
        consola.success(`Active Theme: "${config.theme}"`)
      }
    }

    makeLoaderFile({ loader, destination, target = "node" }) {
      const lines = [`/* GENERATED FILE */`]

      lines.push("const files = {}")

      if (target == "node") {
        loader.forEach(({ id, name }) => {
          lines.push(`files["${id}"] = require("${name}").default`)
        })

        lines.push(`module.exports = files`)
      } else {
        loader.forEach(({ id, name }) => {
          lines.push(`files["${id}"] = () => import("${name}")`)
        })

        lines.push(`export default files`)
      }

      fs.ensureDirSync(path.dirname(destination))

      fs.writeFileSync(destination, lines.join("\n"))
    }

    transpilerConfig() {
      return {
        ignore: [
          // **not** compiled if `true` is returned.
          function(filepath) {
            return !!!filepath.includes("@factor")
          }
        ],
        plugins: [
          "@babel/plugin-transform-modules-commonjs",
          "@babel/plugin-syntax-dynamic-import",
          "@babel/plugin-transform-regenerator",
          "dynamic-import-node",
          "@babel/plugin-transform-runtime"
        ],
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                browsers: ["ie >= 9", "> 1%", "last 2 versions"]
              },
              modules: "cjs" // the default value is auto
            }
          ]
        ]
      }
    }

    readHtmlFile(filePath, { minify = true, name = "" } = {}) {
      const fs = require("fs")

      let str = fs.readFileSync(filePath, "utf-8")

      if (minify) {
        str = require("html-minifier").minify(str, {
          minifyJS: true,
          collapseWhitespace: true
        })
      }

      if (name) {
        str = `<!-- ${name} -->${str}<!-- / ${name} -->`
      }

      return str
    }

    getExtensions() {
      const nm = findNodeModules()
      const plug = "package.json"

      let activeTheme = false
      let pluginsLoader = []
      let themesLoader = []

      let patterns = []

      nm.forEach(_ => {
        patterns.push(path.resolve(_, `./@${this.namespace}/**/${plug}`))
        patterns.push(path.resolve(_, `./${this.namespace}*/${plug}`))
      })

      patterns.push(
        path.resolve(config.baseDir, `**/@${this.namespace}/**/${plug}`)
      )

      let packages = []
      patterns.forEach(pattern => {
        packages = packages.concat(glob(pattern))
      })

      const themesPackages = packages.filter(_ => _.includes("theme"))

      themesPackages.forEach(_ => {
        const filepath = _.replace(plug, "")
        const { name, priority = 100, version } = require(_)
        const id = name.split("theme")[1].replace(/\-/g, "")
        themesLoader.push({ name, priority, version, id, filepath, pkg: _ })
      })

      activeTheme = config.theme
        ? themesLoader.find((_, index) => {
            themesLoader[index].active = true
            return _.id == config.theme
          })
        : false

      if (activeTheme) {
        const themePluginPattern = path.resolve(
          activeTheme.filepath,
          `**/@${this.namespace}/**/${plug}`
        )
        packages = packages.concat(glob(themePluginPattern))
      }

      const pluginPackages = packages.filter(_ => _.includes("plugin"))

      pluginPackages.forEach(_ => {
        const filepath = _.replace(plug, "")
        const { name, priority = 100, version } = require(_)
        const id = name.split("plugin")[1].replace(/\-/g, "")
        pluginsLoader.push({
          name,
          priority,
          version,
          id,
          filepath,
          pkg: _
        })
      })

      return {
        activeTheme,
        pluginsLoader,
        themesLoader
      }
    }
  }()
}
