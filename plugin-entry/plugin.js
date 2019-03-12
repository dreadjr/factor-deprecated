export default Factor => {
  return new class {
    constructor() {
      const path = require("path")

      Factor.$paths.add({
        entry: __dirname,
        "entry-client": path.resolve(__dirname, "entry-client.js"),
        "entry-server": path.resolve(__dirname, "entry-server.js")
      })

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
