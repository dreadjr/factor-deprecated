import Vue from "vue"

Vue.config.productionTip = false
Vue.config.devtools = true
Vue.config.silent = false

import filtersPlugin from "./lib/plugin-filters"

Vue.use({
  install(Vue) {
    Vue[`$filters`] = Vue.prototype[`$filters`] = filtersPlugin(Vue)
  }
})
