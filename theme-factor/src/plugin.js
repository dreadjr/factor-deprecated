export default Factor => {
  return new class {
    constructor() {
      Factor.$filters.add("routes", _ => {
        const contentRoutes = [
          {
            path: "/",
            component: () => import("./home"),
            meta: { nav: true }
          },
          {
            path: "/how-it-works",
            component: () => import("./page-how-it-works"),
            meta: { nav: true }
          },
          {
            path: "/plugins",
            component: () => import("./page-plugins"),
            meta: { nav: true }
          },
          {
            path: "/docs",
            component: () => import("./page-docs"),
            meta: { nav: true }
          }
        ]

        const children = Factor.$filters.applyFilters("content-routes", contentRoutes)

        _.push({
          path: "/",
          component: () => import("@/content"),
          children,
          meta: {
            nav: false
          }
        })

        return _
      })
    }
  }()
}
