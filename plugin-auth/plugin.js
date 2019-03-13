export default Factor => {
  return new class {
    constructor() {
      // Authentication events only work after SSR
      if (Factor.$isNode) {
        return
      }

      this.events()
      this.initialized = false
    }

    events() {
      Factor.$events.$on("auth-state-changed", ({ uid }) => {
        if (!uid) {
          this.removeAuth()
        }
        Factor.$events.$emit("auth-init", { uid })
        this.initialized = true
      })

      // If 'auth state changed' never fires, initialize after 5s
      setTimeout(() => {
        if (!this.initialized) {
          Factor.$events.$emit("auth-init", { uid: false })
          console.warn("[Factor] Auth state didn't initialize.")
        }
      }, 5000)
    }

    uid() {
      return this.$user.getUser().uid || false
    }

    async logout(args) {
      this.removeAuth()

      Factor.$events.$emit("logout", { uid: this.uid(), ...args })
    }

    async removeAuth() {
      Factor.$events.$emit("auth-remove", { uid: this.uid() })
    }
  }()
}
