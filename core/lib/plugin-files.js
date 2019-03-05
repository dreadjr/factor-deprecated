const NODE_ENV = process.env.NODE_ENV
const path = require("path")

module.exports = (Vue, { config }) => {
  return new class {
    constructor() {
      this.baseDir = config.baseDir
      this.coreDir = config.coreDir

      this.production = NODE_ENV === "development" ? false : true

      this.build = this.production ? "production" : "development"

      this.paths = this.setPaths()
    }

    getFilename(target) {
      const out = {}

      out.manifest = "vue-ssr-client-manifest.json"

      out.bundle = "vue-ssr-server-bundle.json"

      out.entryServer = "entry-server.js"

      out.entryClient = "entry-client.js"

      return out[target]
    }

    setPaths() {
      const _ = {}

      _.app = path.resolve(
        this.baseDir,
        Vue.$filters.applyFilters("path-app", "./")
      )

      _.theme = path.resolve(
        this.baseDir,
        Vue.$filters.applyFilters("path-theme", "./")
      )

      _.dist = path.resolve(
        this.baseDir,
        Vue.$filters.applyFilters("path-dist", "./dist")
      )

      _.build = path.resolve(
        this.baseDir,
        Vue.$filters.applyFilters("path-build", "./build")
      )

      _.template = path.resolve(
        this.baseDir,
        Vue.$filters.applyFilters("path-template", "./index.html")
      )

      console.log("coreDIR", this.coreDir, config.coreDir)

      _.core = this.coreDir

      _.coreApp = path.resolve(
        this.coreDir,
        Vue.$filters.applyFilters("path-core-app", "./app")
      )

      _.entryServer = path.resolve(_.coreApp, this.getFilename("entryServer"))
      _.entryClient = path.resolve(_.coreApp, this.getFilename("entryClient"))

      _.productionBundle = path.resolve(_.dist, this.getFilename("bundle"))
      _.productionManifest = path.resolve(_.dist, this.getFilename("manifest"))

      return _
    }

    getPath(target) {
      const existing = this.paths[target]

      return existing ? existing : path.resolve(this.paths.app, target)
    }

    webpackConfig({ target }) {
      return Vue.$filters.applyFilters("webpack-config", {
        target,
        build: this.build
      })
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
  }()
}
