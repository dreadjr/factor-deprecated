import Vue from "vue"
import VueRouter from "vue-router"
import qs from "qs"

Vue.use(VueRouter)

export function createRouter() {
  const routes = [] // Vue.$filters.applyFilters("routes", []).filter(_ => _) // remove undefined

  const router = new VueRouter({
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

  Vue.$router = router

  return router
}
