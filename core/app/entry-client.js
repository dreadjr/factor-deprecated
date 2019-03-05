import Vue from "vue"
import { createApp } from "./app"
//import { clientRouterBefore, clientRouterAfter } from "./utils-router"

const { app, router, store, hook, utils } = createApp()

// Add to <window> for testing
window.Fiction = { app, router, store, hook, Vue }
window.appReady = true

// router.beforeEach((to, from, next) =>
//   clientRouterBefore({ router, to, from, next })
// )

// router.afterEach((to, from) => clientRouterAfter({ router, to, from }))

router.onReady(() => {
  app.$mount("#app")
})
