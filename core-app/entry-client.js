import Factor from "vue"
import { createApp } from "./app"

//import { clientRouterBefore, clientRouterAfter } from "@factor/core-app-router"

const { app, router, store } = createApp({ target: "client" })

// Add to <window> for external use
// For example, inside of Cypress integration tests
window.Factor = { app, router, store, Factor }
window.appReady = true

// router.beforeEach(clientRouterBefore)
// router.afterEach(clientRouterAfter)

router.onReady(() => {
  app.$mount("#app")
})
