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
      return Factor.$user.getUser().uid || false
    }

    async authenticate(args) {
      const { method, form = {}, newAccount = false } = args

      const result = await Promise.all(Factor.$filters.apply("signin-promises", [], args))
      const credentials = Factor.$lodash.flatten(result)[0]

      if (credentials) {
        const { uid } = credentials
        this.update({ uid })
      }

      return credentials
    }

    async logout(args) {
      this.removeAuth()

      Factor.$events.$emit("logout", { uid: this.uid(), ...args })
    }

    async removeAuth() {
      Factor.$events.$emit("auth-remove", { uid: this.uid() })
    }

    async addAuthMethod(args) {
      const processors = Factor.$filters.apply("add-auth-method-promises", [], args)
      const results = await Promise.all(processors)

      this.update()

      return results
    }

    async removeAuthMethod(args) {
      const processors = Factor.$filters.apply("remove-auth-method-promises", [], args)
      const results = await Promise.all(processors)

      this.update()

      return results
    }

    async sendPasswordReset(email) {
      const promises = Factor.$filters.apply("send-password-reset", [], email)
      return await Promise.all(promises)
    }

    async sendEmailVerification(email) {
      const promises = Factor.$filters.apply("send-email-verification", [], email)
      return await Promise.all(promises)
    }

    update(args) {
      Factor.$events.$emit("user-updated", args)
    }
  }()
}
