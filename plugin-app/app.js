import Vue from "vue"

// SSR
//import metatagsMixin from "../lib/plugin-ssr-metatags"

// App Entry Component
import site from "@/site"

// mixin for handling metatags
// Must be OUTSIDE of create APP or gets added on every page load
//Vue.mixin(metatagsMixin)

import init from "./init"

// Expose a factory function that creates a fresh set of store, router,
// app instances on each call (which is called for each SSR request)
export function createApp() {
  //const site = () => import("@theme/site")
  const appComponents = init()
  const { router, store } = appComponents
  // create the app instance.
  // here we inject the router, store and ssr context to all child components,
  // making them available everywhere as `this.$router` and `this.$store`.
  const app = new Vue({
    router,
    store,
    render: h => h(site)
  })

  // expose the app, the router and the store.
  // note we are not mounting the app here, since bootstrapping will be
  // different depending on whether we are in a browser or on the server.
  return { app, ...appComponents }
}
