const path = require("path")

module.exports = (Factor, { pkg }) => {
  return new class {
    constructor() {
      this.namespace = "factor"

      this.production = process.env.NODE_ENV === "development" ? false : true

      this.build = this.production ? "production" : "development"

      if (this.build == "development") {
        this.generateLoaders()
      }

      this.addWatchers()
    }

    addWatchers() {
      Factor.$filters.add("dev-watchers", _ => {
        const files = this.getExtensionPatterns()

        const watchers = [
          {
            files,
            cb: (event, path) => {
              if (path.includes("package.json") && (event == "add" || event == "unlink")) {
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
        destination: Factor.$filters.get("plugins-loader-build"),
        target: "build"
      })

      this.makeLoaderFile({
        loader: pluginsLoader,
        destination: Factor.$filters.get("plugins-loader-app"),
        target: "app"
      })

      this.makeLoaderFile({
        loader: themesLoader,
        destination: Factor.$filters.get("themes-loader")
      })

      require("consola").success(
        `Made Loaders [${Date.now() - s}ms]`,
        `- ${pluginsLoader.length} Plugins`,
        `- ${themesLoader.length} Themes`
      )

      if (pkg.theme == activeTheme) {
        require("consola").success(`Active Theme: "${pkg.theme}"`)
      }
    }

    makeLoaderFile({ loader, destination, target }) {
      const fs = require("fs-extra")

      if (target) {
        loader = loader.filter(_ => _.target == target || _.target == "all")
      }

      const lines = [`/* GENERATED FILE */`]

      lines.push("const files = {}")

      if (true || target == "build") {
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
      const fs = require("fs-extra")

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

      require("find-node-modules")().forEach(_ => {
        patterns.push(path.resolve(_, `./@${this.namespace}/**/package.json`))
        patterns.push(path.resolve(_, `./${this.namespace}*/package.json`))
      })

      patterns.push(path.resolve(Factor.$baseDir, `**/@${this.namespace}/**/package.json`))

      return patterns
    }

    getExtensions() {
      const glob = require("glob").sync

      let activeTheme = false

      let packages = []
      this.getExtensionPatterns().forEach(pattern => {
        packages = packages.concat(glob(pattern))
      })

      const themesPackages = packages.filter(_ => _.includes("theme"))
      const themesLoader = this.makeLoader(themesPackages, { key: "theme" })

      activeTheme = pkg.theme
        ? themesLoader.find((_, index) => {
            themesLoader[index].active = true
            return _.id == pkg.theme
          })
        : false

      if (activeTheme) {
        const themePluginPattern = path.resolve(activeTheme.filepath, `**/@${this.namespace}/**/package.json`)
        packages = packages.concat(glob(themePluginPattern))
      }

      const pluginPackages = packages.filter(_ => _.includes("plugin"))

      const pluginsLoader = this.makeLoader(pluginPackages, { key: "plugin" })

      return {
        activeTheme,
        pluginsLoader,
        themesLoader
      }
    }

    sortPriority(arr) {
      if (!arr || arr.length == 0) return arr

      return arr.sort((a, b) => {
        const ap = a.priority || 100
        const bp = b.priority || 100
        return ap < bp ? -1 : ap > bp ? 1 : 0
      })
    }

    makeLoader(packages, { key }) {
      const loader = []
      packages.forEach(_ => {
        const filepath = _.replace("package.json", "")
        const { name, factor: { priority = 100, target = "all" } = {}, version } = require(_)
        const id = name.split(key)[1].replace(/\-/g, "")
        loader.push({ name, priority, version, id, filepath, pkg: _, target })
      })

      return this.sortPriority(loader)
    }
  }()
}
