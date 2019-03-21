import Factor from "vue"
import FactorStore from "vuex"
Factor.use(FactorStore)

export function createStore() {
  const root = {
    strict: false,
    plugins: [],
    state: () => {},
    getters: {
      getItem: state => item => {
        return state[item]
      }
    },
    mutations: {
      setItem: (state, { item, value }) => {
        Factor.set(state, item, value)
      }
    },
    actions: {},
    modules: Factor.$filters.get("stores", {})
  }
  for (var mod in root.modules) {
    if (root.modules[mod]) {
      root.modules[mod].namespaced = true
    } else {
      delete root.modules[mod]
    }
  }

  const store = new FactorStore.Store(root)

  // prime the store with server-initialized state.
  // the state is determined during SSR and inlined in the page markup.
  // Make sure this is done after store modules are setup and added
  if (typeof window != "undefined" && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }

  Factor.$store = store

  return store
}
