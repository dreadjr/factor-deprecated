import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

const debug = false

export function createStore() {
  const root = {
    strict: debug,
    plugins: [],
    state: {},
    getters: {},
    mutations: {},
    actions: {},
    modules: {} // Vue.$filters.applyFilters("stores", {})
  }
  for (var mod in root.modules) {
    if (root.modules[mod]) {
      root.modules[mod].namespaced = true
    } else {
      delete root.modules[mod]
    }
  }

  const store = new Vuex.Store(root)

  // prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  // Make sure this is done after store modules are setup and added
  if (typeof window != "undefined" && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }

  Vue.$store = store

  return store
}
