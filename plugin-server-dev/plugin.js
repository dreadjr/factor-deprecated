const fs = require("fs")
const path = require("path")
const MFS = require("memory-fs")
const chokidar = require("chokidar")
const webpack = require("webpack")
const consola = require("consola")
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackDevMiddleware = require("webpack-dev-middleware")
const argv = require("yargs").argv

export default (Factor, { config }) => {
  return new class {
    constructor() {
      this.build = this.production ? "production" : "development"

      Factor.$filters.addFilter("development-server", () => {
        return this.devServer()
      })
    }

    devServer() {
      this.templatePath = Factor.$filters.get("html-template-path")

      this.confServer = Factor.$filters.get("webpack-config", {
        target: "server"
      })

      this.confClient = Factor.$filters.get("webpack-config", {
        target: "client"
      })

      // console.log("this.confServer", this.confServer)

      // console.log("this.confClient", this.confClient)

      return (server, cb) => {
        this.server = server
        this.cb = cb

        this.ready
        const readyPromise = new Promise(resolve => {
          this.ready = resolve
        })

        this.template = this.getTemplate()

        this.watcher()

        this.compileClient()

        this.compileServer()

        return readyPromise
      }
    }

    // Read file using Memory File Service
    readFile(mfs, file) {
      try {
        return mfs.readFileSync(
          path.join(this.confClient.output.path, file),
          "utf-8"
        )
      } catch (error) {}
    }

    updateServer(reason) {
      consola.success(`Update: ${reason}`)
      if (this.bundle && this.clientManifest) {
        this.ready() // triggers promise resolution
        this.cb(this.bundle, {
          template: this.template,
          clientManifest: this.clientManifest
        })
      }
    }
    getTemplate() {
      return Factor.$files.readHtmlFile(this.templatePath)
    }
    watcher() {
      const watchRegen = Factor.$filters.get("dev-watch-regenerate", [
        this.templatePath
      ])

      const watchIgnore = Factor.$filters.get("dev-watch-ignore", [])
      console.log("watchRegen", watchRegen, watchIgnore)

      chokidar
        .watch(watchRegen, {
          ignored: watchIgnore,
          ignoreInitial: true
        })
        .on("all", (event, path) => {
          if (path === this.templatePath) {
            this.template = this.getTemplate()
          } else {
            Factor.$events.$emit("filesChanged", { event, path })
            consola.log(`${event} @[${path}]`)
          }

          this.updateServer("Files Changed")
        })
    }

    compileClient() {
      // modify client config to work with hot middleware
      this.confClient.entry.app = [
        "webpack-hot-middleware/client?quiet=true",
        this.confClient.entry.app
      ]
      this.confClient.output.filename = "[name].js"
      this.confClient.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
        // new webpack.NamedModulesPlugin() // HMR shows correct file names in console on update.
      )

      // Dev Middleware - which injects changed files into the webpack bundle
      const clientCompiler = webpack(this.confClient)

      const devMiddleware = webpackDevMiddleware(clientCompiler, {
        publicPath: this.confClient.output.publicPath,
        logLevel: "silent"
      })

      this.server.use(devMiddleware)

      clientCompiler.plugin("done", stats => {
        stats = stats.toJson()
        stats.errors.forEach(error => consola.error(error))
        stats.warnings.forEach(error => consola.warn(error))

        if (stats.errors.length !== 0) return

        this.clientManifest = JSON.parse(
          this.readFile(
            devMiddleware.fileSystem,
            Factor.$filters.get("client-manifest-name")
          )
        )

        this.updateServer("Client Compiler")
      })

      // hot middleware
      this.server.use(
        webpackHotMiddleware(clientCompiler, {
          heartbeat: 5000,
          log: false
        })
      )

      this.server.getConnections
    }

    compileServer() {
      const serverCompiler = webpack(this.confServer)
      const mfs = new MFS()
      serverCompiler.outputFileSystem = mfs
      serverCompiler.watch({}, (err, stats) => {
        // watch and update server renderer
        if (err) throw err
        stats = stats.toJson()
        if (stats.errors.length !== 0) return

        this.bundle = JSON.parse(
          this.readFile(mfs, Factor.$filters.get("server-bundle-name"))
        )
        this.updateServer("Server Compiler")
      })
    }
  }()
}
