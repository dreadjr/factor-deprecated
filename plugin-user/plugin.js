export default Factor => {
  return new class {
    constructor() {
      // Fire the init triggers only once
      this.initialized = false

      // Where the cached user is stored
      this.cacheKey = "factorUser"

      this.filters()
      this.events()
    }

    filters() {
      // Factor.$filters.addFilter("stores", _ => {
      //   _.user = () => import("./store")
      //   return _
      // })

      Factor.$filters.addFilter("mixins", _ => {
        _.user = this.mixin()
        return _
      })
    }

    config() {
      return require("./config")
    }

    events() {
      // Has to be after client load to avoid SSR conflicts
      Factor.$events.$on("app-mounted", () => {
        this.start()
      })

      Factor.$events.$on("user-updated", ({ uid }) => {
        this.setActiveUser({ uid, from: "refresh" })
      })

      Factor.$events.$on("auth-init", ({ uid }) => {
        this.setActiveUser({ uid, from: "auth" })
      })
    }

    start() {
      this.cachedUser = this.getCachedUser()

      if (this.cachedUser) {
        this.storeUser({ user: this.cachedUser, from: "cache" })
      }
    }

    // Utility function that calls a callback when the user is set initially
    // If due to route change then initialized var is set and its called immediately
    init(callback) {
      if (this.initialized) {
        callback.call(this, this.uid())
      } else {
        Factor.$events.$on("user-init", () => {
          const uid = this.getUser().uid || false
          callback.call(this, this.uid())
        })
      }
    }

    uid() {
      return this.getUser().uid || false
    }

    getUser() {
      return Factor.$store.getters["getItem"]("activeUser") || {}
    }

    storeUser({ user, from }) {
      // Don't set user and trigger all hooks if unneeded.
      if (from == "cache" || !Factor.$lodash.isEqual(this.getUser(), user)) {
        Factor.$store.commit("user/setItem", { item: "activeUser", value: user })
        this.setCacheUser(user)
        Factor.$events.$emit("user-set", user)
      }

      // Send a global event when the user is definitively initiated
      // If !user then wait til auth system verifies they are logged out
      if (!this.initialized && ((user && from == "cache") || from == "auth")) {
        Factor.$events.$emit("user-init", { user, from })
        this.initialized = true
      }
    }

    async setActiveUser({ uid, from }) {
      const uid = uid ? uid : this.getUser().uid
      const user = uid ? await this.requestActiveUser(uid) : {}

      this.storeUser({ user, from })
    }

    async requestActiveUser(uid) {
      uid = uid ? uid : this.getUser().uid || false

      if (!uid) return {}

      const publicData = await Factor.$db.query({
        table: "public",
        id: uid
      })

      const privateData = await Factor.$db.query({
        table: "private",
        id: uid
      })
      return { uid, ...publicData, ...privateData }
    }

    setCacheUser(user) {
      if (localStorage) {
        localStorage.setItem(this.cacheKey, user ? JSON.stringify(user) : false)
      }
    }

    getCachedUser() {
      return localStorage && localStorage[this.cacheKey]
        ? JSON.parse(localStorage[this.cacheKey])
        : false
    }

    mixin() {
      return () => {
        Factor.mixin({
          computed: {
            $activeUser() {
              return this.$store.getters["getItem"]("activeUser") || {}
            },
            $uid() {
              return this.$activeUser && this.$activeUser.uid ? this.$activeUser.uid : ""
            }
          }
        })
      }
    }
  }()
}
