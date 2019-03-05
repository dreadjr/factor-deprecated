const fs = require("fs")
const path = require("path")
const LRU = require("lru-cache")
const https = require("https")
const express = require("express")
const favicon = require("serve-favicon")
const consola = require("consola")
const { createBundleRenderer } = require("vue-server-renderer")

const env = process.env.NODE_ENV || "production"
const PROD = env === "production"

require("module-alias/register")

export default (Vue, { config = {} }) => {
  return new class {
    constructor() {
      Vue.$filters.addFilter("server", () => {
        return this.server()
      })
    }

    resolve(file) {
      return path.resolve(config.baseDir, file)
    }

    getServerInfo() {
      const { version: expressVersion } = require("express/package.json")
      const {
        version: ssrVersion
      } = require("vue-server-renderer/package.json")

      return `express/${expressVersion} vue-server-renderer/${ssrVersion}`
    }

    createRenderer(bundle, options) {
      return createBundleRenderer(
        bundle,
        Object.assign(options, {
          cache: new LRU({ max: 1000, maxAge: 1000 * 60 * 15 }),
          runInNewContext: false,
          basedir: this.resolve("./"),
          directives: {
            "formatted-text"(vnode, directiveMeta) {
              const content = appUtils.cleanUserMessage(directiveMeta.value)
              const domProps = vnode.data.domProps || (vnode.data.domProps = {})
              domProps.innerHTML = content
            }
          }
        })
      )
    }

    getProductionBundle() {
      return require(this.resolve("./dist/vue-ssr-server-bundle.json"))
    }

    getProductionManifest() {
      return require(this.resolve("./dist/vue-ssr-client-manifest.json"))
    }

    handleError(req, res, err) {
      if (err.url) {
        res.redirect(err.url)
      } else if (err.code === 404) {
        res.status(404).send("404 | Page Not Found")
      } else {
        res.status(500).send("500 | Internal Server Error")
        consola.error(`error during render : ${req.url}`)
        consola.error(err.stack)
      }
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

        if (PROD) {
          res.set("cache-control", this.getCacheControl(req.url))
        }

        res.send(html)

        if (!PROD) {
          consola.info(`Request: ${Date.now() - s}ms`, req.url)
        }
      })
    }

    server() {
      this.server = express()

      this.renderer = null
      this.readyPromise = null
      this.httpRoutine = this.getHttpRoutine()

      if (PROD) {
        this.renderer = this.createRenderer(
          Vue.$files.getPath("productionBundle"),
          {
            template: Vue.$files.readHtmlFile(Vue.$files.getPath("template")),
            clientManifest: Vue.$files.getPath("productionManifest")
          }
        )
      } else {
        const devServer = Vue.$filters.applyFilters("development-server")

        if (devServer) {
          this.readyPromise = devServer(this.server, (bundle, options) => {
            console.log("no really, update")
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

      if (!PROD) {
        this.resolveStaticAssets()
      }

      this.server.get(
        "*",
        PROD
          ? this.render
          : (req, res) => {
              this.readyPromise.then(() => this.render(req, res))
            }
      )

      if (!PROD) {
        consola.info(`NODE_ENV: "${env}"`)

        const port = config.port || 1975

        this.getListenRoutine(this.server).listen(port, () => {
          const url = `${this.httpRoutine}://localhost:${port}`

          consola.info(`Server @ ${url}`)

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
      console.log(`Cache Control Set @ ${url} for ${mins} minutes.`)
      return `public, max-age=${mins * 30}, s-maxage=${mins * 60}`
    }

    resolveStaticAssets() {
      try {
        const fav = Vue.$files.getPath("static/favicon.png")
        this.server.use(favicon(fav))
      } catch {
        consola.info("Couldn't find [static/favicon.png]")
      }

      const staticAssets = Vue.$files.getPath("static")
      this.server.use("/", express.static(staticAssets))

      const built = Vue.$files.getPath("dist")
      this.server.use("/", express.static(built))
    }
  }()
}
