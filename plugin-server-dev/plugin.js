const fs = require("fs")
const path = require("path")
const MFS = require("memory-fs")
const chokidar = require("chokidar")
const webpack = require("webpack")
const consola = require("consola")
const webpackHotMiddleware = require("webpack-hot-middleware")
const webpackDevMiddleware = require("webpack-dev-middleware")
const argv = require("yargs").argv

export default (Vue, { config = {} }) => {
  return new class {
    constructor() {
      Vue.$filters.addFilter("development-server", () => {
        return this.devServer()
      })
    }

    devServer() {
      this.templatePath = Vue.$files.getPath("template")
      this.confServer = Vue.$files.webpackConfig({ target: "server" })
      this.confClient = Vue.$files.webpackConfig({ target: "client" })

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
      return Vue.$files.readHtmlFile(this.templatePath)
    }
    watcher() {
      // read template from disk and watch

      chokidar.watch(this.templatePath).on("change", () => {
        this.template = this.getTemplate()
        this.updateServer("Template Changed")
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
            Vue.$files.getFilename("manifest")
          )
        )
        this.updateServer("Client Compiler")
      })

      // hot middleware
      this.server.use(
        webpackHotMiddleware(clientCompiler, {
          heartbeat: 5000
        })
      )

      this.server.getConnections
    }

    compileServer() {
      // watch and update server renderer
      const serverCompiler = webpack(this.confServer)
      const mfs = new MFS()
      serverCompiler.outputFileSystem = mfs
      serverCompiler.watch({}, (err, stats) => {
        if (err) throw err
        stats = stats.toJson()
        if (stats.errors.length !== 0) return

        this.bundle = JSON.parse(
          this.readFile(mfs, Vue.$files.getFilename("bundle"))
        )
        this.updateServer("Server Compiler")
      })
    }
  }()
}
