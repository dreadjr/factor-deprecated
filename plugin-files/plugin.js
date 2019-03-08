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

      this.nodeModulesFolders = findNodeModules()

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

      this.addWatchers()
      this.generateLoaders()
    }

    addWatchers() {
      Factor.$filters.add("dev-watchers", _ => {
        const files = this.getExtensionPatterns()

        const watchers = [
          {
            files,
            cb: (event, path) => {
              if (
                path.includes("package.json") &&
                (event == "add" || event == "unlink")
              ) {
                this.generateLoaders()
                return true
              }
            }
          }
        ]

        return _.concat(watchers)
      })
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

      consola.success(
        `Made Loaders [${Date.now() - s}ms]`,
        `- ${pluginsLoader.length} Plugins`,
        `- ${themesLoader.length} Themes`
      )

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

    getExtensionPatterns() {
      let patterns = []

      this.nodeModulesFolders.forEach(_ => {
        patterns.push(path.resolve(_, `./@${this.namespace}/**/package.json`))
        patterns.push(path.resolve(_, `./${this.namespace}*/package.json`))
      })

      patterns.push(
        path.resolve(config.baseDir, `**/@${this.namespace}/**/package.json`)
      )

      return patterns
    }

    getExtensions() {
      const plug = "package.json"

      let activeTheme = false

      let packages = []
      this.getExtensionPatterns().forEach(pattern => {
        packages = packages.concat(glob(pattern))
      })

      const themesPackages = packages.filter(_ => _.includes("theme"))
      const themesLoader = this.makeLoader(themesPackages, "theme")

      activeTheme = config.theme
        ? themesLoader.find((_, index) => {
            themesLoader[index].active = true
            return _.id == config.theme
          })
        : false

      if (activeTheme) {
        const themePluginPattern = path.resolve(
          activeTheme.filepath,
          `**/@${this.namespace}/**/package.json`
        )
        packages = packages.concat(glob(themePluginPattern))
      }

      const pluginPackages = packages.filter(_ => _.includes("plugin"))

      const pluginsLoader = this.makeLoader(pluginPackages, "plugin")

      return {
        activeTheme,
        pluginsLoader,
        themesLoader
      }
    }

    makeLoader(packages, key) {
      const loader = []
      packages.forEach(_ => {
        const filepath = _.replace("package.json", "")
        const { name, priority = 100, version } = require(_)
        const id = name.split(key)[1].replace(/\-/g, "")
        loader.push({ name, priority, version, id, filepath, pkg: _ })
      })

      return loader
    }
  }()
}
