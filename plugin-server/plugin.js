const fs = require("fs")
const path = require("path")
const LRU = require("lru-cache")
const https = require("https")
const express = require("express")
const favicon = require("serve-favicon")
const consola = require("consola")

const { createBundleRenderer } = require("vue-server-renderer")

const env = process.env.NODE_ENV || "production"
const isProd = env === "production"

require("module-alias/register")

export default (Factor, { config }) => {
  return new class {
    constructor() {
      // If development or --serve variable is passed
      // We should serve the app (locally)
      this.serveApp = !isProd || config.serve ? true : false

      Factor.$filters.addFilter("server", () => {
        return this.server()
      })
    }

    resolve(file) {
      return path.resolve(config.baseDir, file)
    }

    createRenderer(bundle, options) {
      return createBundleRenderer(bundle, {
        ...options,
        cache: new LRU({ max: 1000, maxAge: 1000 * 60 * 15 }),
        runInNewContext: false,
        // basedir: this.resolve("./")
        directives: Factor.$filters.applyFilters("ssr-directives", {})
      })

      // "formatted-text"(vnode, directiveMeta) {
      //   const content = appUtils.cleanUserMessage(directiveMeta.value)
      //   const domProps = vnode.data.domProps || (vnode.data.domProps = {})
      //   domProps.innerHTML = content
      // }
    }

    render(req, res) {
      const s = Date.now()

      res.setHeader("Content-Type", "text/html")
      res.setHeader("Server", this.getServerInfo())

      const context = {
        url: req.url,
        metatags: {
          title: "",
          titleSuffix: "",
          image: "",
          canonical: ""
        }
      }

      this.renderer.renderToString(context, (err, html) => {
        if (err) {
          return this.handleError(req, res, err)
        }

        if (isProd && (typeof config.cache == "undefined" || config.cache)) {
          res.set("cache-control", this.getCacheControl(req.url))
        }

        res.send(html)

        if (this.serveApp) {
          consola.success(`Request @[${req.url}] - ${Date.now() - s}ms`)
        }
      })
    }

    server() {
      this.server = express()

      this.renderer = null
      this.readyPromise = null
      this.httpRoutine = this.getHttpRoutine()

      if (isProd) {
        const bundle = require(Factor.$filters.get("server-bundle-path"))
        const clientManifest = require(Factor.$filters.get(
          "client-manifest-path"
        ))

        this.renderer = this.createRenderer(bundle, {
          template: Factor.$files.readHtmlFile(
            Factor.$filters.get("html-template-path")
          ),
          clientManifest
        })
      } else {
        const devServer = Factor.$filters.applyFilters("development-server")

        if (devServer) {
          this.readyPromise = devServer(this.server, (bundle, options) => {
            this.renderer = this.createRenderer(bundle, options)
          })
        } else {
          consola.error(
            new Error(
              "No development server added. Add a development server to your app dependencies."
            )
          )
        }
      }

      // Serve static assets
      if (this.serveApp) {
        this.resolveStaticAssets()
      }

      // Set Express routine for all fallthrough paths
      this.server.get("*", (req, res) => {
        if (isProd) {
          this.render(req, res)
        } else {
          this.readyPromise.then(() => {
            this.render(req, res)
          })
        }
      })

      // Serve the app from node
      if (this.serveApp) {
        const port = config.port || 7000

        this.getListenRoutine(this.server).listen(port, () => {
          const url = `${this.httpRoutine}://localhost:${port}`

          consola.success(`Server @[${url}] - ${env}`)

          require("opn")(url)
        })
      }

      return this.server
    }

    getHttpRoutine() {
      return fs.existsSync(this.resolve("./server.key")) ? "https" : "http"
    }

    getListenRoutine(server) {
      let listenRoutine
      if (this.httpRoutine == "https") {
        var certOptions = {
          key: fs.readFileSync(this.resolve("./server.key")),
          cert: fs.readFileSync(this.resolve("./server.crt"))
        }
        listenRoutine = https.createServer(certOptions, server)
      } else {
        listenRoutine = server
      }

      return listenRoutine
    }

    getCacheControl(url) {
      const mins = 60
      console.log(`Cache Control Set @[${url}] for ${mins} minutes.`)
      return `public, max-age=${mins * 30}, s-maxage=${mins * 60}`
    }

    serve(path, cache) {
      return express.static(Factor.$filters.get(path), {
        maxAge: cache && isProd ? 1000 * 60 * 60 * 24 : 0
      })
    }

    resolveStaticAssets() {
      const fav = Factor.$filters.get("favicon-path")
      try {
        this.server.use(favicon(fav))
      } catch {
        consola.warn(`Couldn't find [${fav}]`)
      }

      // Global and Static Images/Manifests, etc..
      this.server.use("/static", this.serve("static-path", true))

      // Serve distribution folder at Root URL
      this.server.use("/", this.serve("distribution-path", true))
    }

    getServerInfo() {
      const { version: expressVersion } = require("express/package.json")
      const {
        version: ssrVersion
      } = require("vue-server-renderer/package.json")

      return `express/${expressVersion} vue-server-renderer/${ssrVersion}`
    }

    handleError(req, res, err) {
      if (err.url) {
        res.redirect(err.url)
      } else if (err.code === 404) {
        res.status(404).send("404 | Page Not Found")
      } else {
        res.status(500).send("500 | Internal Error")
        consola.error(`error during render : ${req.url}`)
        consola.error(err.stack)
      }
    }
  }()
}
