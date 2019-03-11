import Factor from "vue"
import FactorRouter from "vue-router"
import qs from "qs"

Factor.use(FactorRouter)

export function createRouter() {
  const routes = [] //Factor.$filters.get("routes", []).filter(_ => _) // remove undefined

  const router = new FactorRouter({
    routes,
    mode: "history", // abstract
    scrollBehavior(to, from, savedPosition) {
      if (to.path == from.path && to.hash != from.hash) {
        return false
      } else if (savedPosition) {
        return savedPosition
      } else {
        return { x: 0, y: 0 }
      }
    },
    // set custom query resolver that allows for objects in GET requests
    parseQuery(query) {
      return qs.parse(query)
    },
    stringifyQuery(query) {
      var result = qs.stringify(query)

      return result ? "?" + result : ""
    }
  })

  Factor.$router = router

  return router
}
