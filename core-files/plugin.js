const path = require("path")

module.exports = Factor => {
  return new class {
    constructor() {
      const gen = Factor.$paths.get("generated")
      const res = path.resolve

      this.namespace = "factor"

      this.build = process.env.NODE_ENV === "production" ? "production" : "development"

      Factor.$paths.add({
        "plugins-loader-app": res(gen, "load-plugins-app.js"),
        "plugins-loader-build": res(gen, "load-plugins-build.js"),
        "themes-loader": res(gen, "load-themes.js")
      })

      if (this.build == "development") {
        this.generateLoaders()
      }

      require("@babel/register")(this.transpilerConfig("build"))

      this.addWatchers()
    }

    addWatchers() {
      Factor.$filters.add("dev-watchers", _ => {
        const files = this.getExtensionPatterns()

        const watchers = [
          {
            files,
            cb: (event, path) => {
              if (
                (path.includes("package.json") || path.includes("plugin.js")) &&
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
        destination: Factor.$paths.get("plugins-loader-build"),
        target: "build"
      })

      this.makeLoaderFile({
        loader: pluginsLoader,
        destination: Factor.$paths.get("plugins-loader-app"),
        target: "app"
      })

      this.makeLoaderFile({
        loader: themesLoader,
        destination: Factor.$paths.get("themes-loader")
      })

      require("consola").success(
        `Made Loaders [${Date.now() - s}ms]`,
        `- ${pluginsLoader.length} Plugins`,
        `- ${themesLoader.length} Themes`
      )

      if (Factor.$pkg.theme == activeTheme) {
        require("consola").success(`Active Theme: "${Factor.$pkg.theme}"`)
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
        loader.forEach(({ id, module }) => {
          lines.push(`files["${id}"] = require("${module}").default`)
        })

        lines.push(`module.exports = files`)
      } else {
        loader.forEach(({ id, module }) => {
          lines.push(`files["${id}"] = () => import("${module}")`)
        })

        lines.push(`export default files`)
      }

      fs.ensureDirSync(path.dirname(destination))

      fs.writeFileSync(destination, lines.join("\n"))
    }

    transpilerConfig(target) {
      const modules = "cjs"

      let plugins = [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-transform-modules-commonjs",
        "@babel/plugin-proposal-object-rest-spread"
      ]

      if (target == "build") {
        plugins = plugins.concat(["@babel/plugin-transform-regenerator", "dynamic-import-node"])
      }

      return {
        ignore: [
          // **not** compiled if `true` is returned.
          function(filepath) {
            const modulePath = filepath.includes("node_modules")
              ? filepath.split("node_modules").pop()
              : filepath
            return modulePath.includes("@factor") ? false : true
          }
        ],
        plugins,
        presets: [
          [
            "@babel/preset-env",
            {
              targets: {
                browsers: ["> 1%", "last 2 versions"]
              },
              modules
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

      patterns.push(path.resolve(Factor.$paths.get("app"), `**/plugin.js`))

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

      activeTheme = Factor.$pkg.theme
        ? themesLoader.find((_, index) => {
            themesLoader[index].active = true
            return _.id == Factor.$pkg.theme
          })
        : false

      // if (activeTheme) {
      //   const themePluginPattern = path.resolve(activeTheme.filepath, `**/@${this.namespace}/**/package.json`)
      //   packages = packages.concat(glob(themePluginPattern))
      // }

      const { factor: { services = {} } = {} } = Factor.$config

      const pluginPackages = [
        ...packages.filter(_ => _.includes("plugin")),
        ...Object.values(services)
      ]

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
        let fields = {}
        if (_.includes("package.json")) {
          const { name, factor: { priority = 100, target = "app" } = {} } = require(_)

          fields = {
            ...fields,
            module: name,
            priority,
            target,
            id: name.split(key)[1].replace(/\-/g, "")
          }
        } else {
          const basename = path.basename(_)
          const folderName = path.basename(path.dirname(_))

          fields = {
            module: Factor.$paths.replaceWithAliases(_),
            target: "app",
            id: basename == "plugin.js" ? folderName : basename.replace(/\.js|plugin|\-/gi, "")
          }
        }

        loader.push(fields)
      })

      return this.sortPriority(loader)
    }
  }()
}
