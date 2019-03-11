export default (Factor, { config }) => {
  return new class {
    constructor() {
      const path = require("path")

      Factor.$filters.add("app-path", () => path.resolve(config.baseDir))

      Factor.$filters.add("theme-path", () => path.resolve(config.baseDir))

      Factor.$filters.add("src-path", () => path.resolve(config.baseDir, "src"))

      Factor.$filters.add("html-template-path", () => {
        return path.resolve(Factor.$filters.get("src-path"), "index.html")
      })

      Factor.$filters.add("static-path", () => {
        return path.resolve(Factor.$filters.get("app-path"), "static")
      })

      Factor.$filters.add("favicon-path", () => {
        return path.resolve(Factor.$filters.get("static-path"), "favicon.png")
      })

      Factor.$filters.add("entry-client-path", () => path.resolve(__dirname, "entry-client.js"))

      Factor.$filters.add("entry-server-path", () => path.resolve(__dirname, "entry-server.js"))

      this.routes()
    }

    routes() {
      Factor.$filters.add("routes", _ => {
        _.push({
          path: "/",
          component: () => import("@/content"),
          children: Factor.$filters.get("content-routes", []),
          meta: {
            nav: false
          }
        })

        return _
      })

      // Add 404 Handling last
      Factor.$filters.add(
        "routes",
        _ => {
          _.push({
            path: "*",
            component: () => import("@/site-content-wrap"),
            children: [
              {
                name: "forbidden",
                path: "/forbidden",
                component: () => import("@/error"),
                meta: { error: 403 }
              },
              {
                path: "/:permalink",
                component: () => import("./template")
              },
              {
                name: "generalError",
                path: "*",
                component: () => import("@/error"),
                meta: { error: 404 }
              }
            ],
            priority: 3000
          })

          return _
        },
        { priority: 3000 }
      )
    }
  }()
}
