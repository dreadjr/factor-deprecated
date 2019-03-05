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
        console.log("actually, update")
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
        this.updateServer("Template Updated")
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
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin() // HMR shows correct file names in console on update.
      )

      // dev middleware
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
      this.server.use(webpackHotMiddleware(clientCompiler))
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

// const findRoot = require("find-root")
// const root = findRoot(__dirname)

// const { flog } = require(`${root}/src/utils-server`)

// const watchKeys = ["plugin", "middleware", "endpoint", "ssr", "test"]

// const makeOnChange = ["functions", "endpoint", "ssr", "node", "test", "spec"]

// const readFile = (fs, file) => {
//   try {
//     return fs.readFileSync(path.join(clientConfig.output.path, file), "utf-8")
//   } catch (error) {}
// }

// function makeLoaderFiles() {
//   require(`./make-function.js`).createLoaders()
//   require(`./make-loader.js`).createLoaders()
// }

// function makeTestFiles() {
//   require("./make-test.js").createLoaders()
// }

// function isTestFile(p) {
//   if (p.includes("spec") || p.includes("test")) {
//     return true
//   } else {
//     return false
//   }
// }

// function watchChangeFile(path) {
//   return makeOnChange.some(f => {
//     if (path.includes(f)) {
//       return true
//     }
//   })
// }

// Stripe Hook
// const serverlessUrl = config.serverlessUrl
// const webhookUrl = `${serverlessUrl}/stripewebhooks?action=webhook`

// Poll For Stripe Events
// require("stripe-local")({
//   secretKey: "sk_test_0OSh96ooYB9vKSwxxzgUD3D3",
//   webhookUrl,
//   interval: 30000
// })

// module.exports = function setupDevServer(server, templatePath, cb) {
//   let bundle
//   let template
//   let clientManifest

//   let ready
//   const readyPromise = new Promise(r => {
//     ready = r
//   })
//   const update = why => {
//     flog(`Update: ${why}`)
//     if (bundle && clientManifest) {
//       ready()
//       cb(bundle, {
//         template,
//         clientManifest
//       })
//     }
//   }

//   // read template from disk and watch
//   // used in the update routine
//   template = fs.readFileSync(templatePath, "utf-8")

//   const pluginFolder = "**/src/plugin"

//   const watchGlobs = watchKeys
//     .map(k => `${pluginFolder}/**/*${k}*`)
//     .concat([
//       `${pluginFolder}/**/*.vue`,
//       `${pluginFolder}/**/functions/**`,
//       `${pluginFolder}/**/test/**`,
//       templatePath
//     ])

//   chokidar
//     .watch(watchGlobs, {
//       ignored: [`**/node_modules`, `./functions`, "**/*loader*"],
//       ignoreInitial: true
//     })
//     .on("all", (event, path) => {
//       flog(`${event}@${path}`)
//       // update template variable
//       if (path === templatePath) {
//         template = fs.readFileSync(templatePath, "utf-8")
//       }

//       if (
//         path.indexOf("loader") === -1 &&
//         path.indexOf("node_modules") === -1 &&
//         path.indexOf("functions") !== 0
//       ) {
//         if (
//           (event === "change" && watchChangeFile(path)) ||
//           event === "add" ||
//           event === "unlink"
//         ) {
//           if (isTestFile(path)) {
//             flog(`Test Files Made`)
//             makeTestFiles()
//           } else {
//             makeLoaderFiles()
//           }

//           update("Files Generated")
//         }
//       }
//     })

//   // modify client config to work with hot middleware
//   clientConfig.entry.app = [
//     "webpack-hot-middleware/client?quiet=true",
//     clientConfig.entry.app
//   ]
//   clientConfig.output.filename = "[name].js"
//   clientConfig.plugins.push(
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoEmitOnErrorsPlugin(),
//     new webpack.NamedModulesPlugin() // HMR shows correct file names in console on update.
//   )

//   // dev middleware
//   const clientCompiler = webpack(clientConfig)
//   const devMiddleware = require("webpack-dev-middleware")(clientCompiler, {
//     publicPath: clientConfig.output.publicPath,
//     logLevel: "silent"
//   })
//   server.use(devMiddleware)
//   clientCompiler.plugin("done", stats => {
//     stats = stats.toJson()
//     stats.errors.forEach(err => console.error(err))
//     stats.warnings.forEach(err => console.warn(err))
//     if (stats.errors.length !== 0) return
//     clientManifest = JSON.parse(
//       readFile(devMiddleware.fileSystem, "vue-ssr-client-manifest.json")
//     )
//     update("Client Compiler")
//   })

//   // hot middleware
//   server.use(
//     require("webpack-hot-middleware")(clientCompiler, {
//       heartbeat: 5000
//     })
//   )

//   // watch and update server renderer
//   const serverCompiler = webpack(serverConfig)
//   const mfs = new MFS()
//   serverCompiler.outputFileSystem = mfs
//   serverCompiler.watch({}, (err, stats) => {
//     if (err) throw err
//     stats = stats.toJson()
//     if (stats.errors.length !== 0) return

//     // read bundle generated by vue-ssr-webpack-plugin
//     bundle = JSON.parse(readFile(mfs, "vue-ssr-server-bundle.json"))
//     update("Server Compiler")
//   })

//   return readyPromise
// }
