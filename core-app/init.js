import Factor from "vue"

// // Config
import extendApp from "@factor/extend-app"
import { createStore } from "@factor/core-app-store"
import { createRouter } from "@factor/core-app-router"

// SSR
// mixin for handling metatags
// Must be OUTSIDE of create APP or gets added on every page load
//import metatagsMixin from "@plugin/ssr/utils-ssr"
//Vue.mixin(metatagsMixin)

export default ({ target }) => {
  // Extend with plugins, happens before router and store so we can add hooks for them
  const loader = extendApp(Factor, process.env.FACTOR_CONFIG)

  loader.initializeApp()

  const store = createStore({ target })
  const router = createRouter({ target })

  // Extend with mixins, etc... happens after router and store
  loader.mixinApp()

  return { router, store }
  //return { Vue, hook, config, utils, router, store }
}