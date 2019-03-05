import Vue from "vue"

// // Utility functions
// const utilsFile = require("./plugin/utils/utils")
// const utilsGlobal = require("./utils-global")
// const utils = Object.assign({}, utilsFile, utilsGlobal)

// // Disable annoying console logging
// Vue.config.productionTip = false
// Vue.config.devtools = utils.isTest() ? false : true
// Vue.config.silent = utils.isTest() ? true : false

// // Config
// import config from "~/config"
// import { extendApp, registerComponents, mixinApp } from "./loader"
// import filtersPlugin from "../lib/filters"

// // Router + Store
import { createStore } from "./store"
import { createRouter } from "./router"
// import { sync } from "vuex-router-sync"

// SSR
//import metatagsMixin from "@plugin/ssr/utils-ssr"

// App Entry Component
//import site from "@theme/site"

// mixin for handling metatags
// Must be OUTSIDE of create APP or gets added on every page load
//Vue.mixin(metatagsMixin)

export default () => {
  // Vue.use({
  //   install(Vue) {
  //     Vue[`$filters`] = Vue.prototype[`$filters`] = filtersPlugin(Vue, {
  //       config
  //     })
  //   }
  // })

  // const hook = new Vue()

  // const opts = { utils, config, hook }

  // // Extend with plugins, happens before router and store so we can add hooks for them
  // extendApp(opts)

  // registerComponents(opts)

  const store = createStore()

  // // Initialize Routes
  const router = createRouter()

  // // sync the router with the vuex store.
  // // this registers `store.state.route`
  // sync(store, router)

  // // Extend with mixins, etc... happens after router and store
  // mixinApp({ ...opts, store, router })

  return { router, store }
  //return { Vue, hook, config, utils, router, store }
}
