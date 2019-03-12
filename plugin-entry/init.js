import Factor from "vue"

// // Utility functions
// const utilsFile = require("./plugin/utils/utils")
// const utilsGlobal = require("./utils-global")
// const utils = Object.assign({}, utilsFile, utilsGlobal)

// // Config
// import config from "~/config"
import extend from "@factor/extend-app"

// // Router + Store
import { createStore } from "./store"
import { createRouter } from "./router"
import { sync } from "vuex-router-sync"

// SSR
//import metatagsMixin from "@plugin/ssr/utils-ssr"

// App Entry Component
//import site from "@theme/site"

// mixin for handling metatags
// Must be OUTSIDE of create APP or gets added on every page load
//Vue.mixin(metatagsMixin)

export default () => {
  // const hook = new Vue()

  // const opts = { utils, config, hook }

  // Extend with plugins, happens before router and store so we can add hooks for them
  const loader = extend(Factor, process.env.FACTOR_CONFIG)

  loader.registerComponents()

  const store = createStore()

  // // Initialize Routes
  const router = createRouter()

  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router)

  // Extend with mixins, etc... happens after router and store
  loader.mixinApp()

  return { router, store }
  //return { Vue, hook, config, utils, router, store }
}
