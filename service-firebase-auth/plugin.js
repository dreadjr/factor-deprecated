const consola = require("consola")

export default Factor => {
  return new class {
    constructor() {
      const firebaseApp = require("@factor/service-firebase-app").default
      require("firebase/auth")
      // console.log("do auth", require("firebase/auth"))
      // Factor.$interop()
      this.client = firebaseApp(Factor).client

      Factor.$filters.add("after-initialize-app", () => {
        this.events()
      })
    }

    error(error) {
      consola.error("[Firebase Auth]", error)
    }

    events() {
      if (!Factor.$isNode) {
        try {
          this.client.auth().onAuthStateChanged(async serviceUser => {
            Factor.$events.$emit("auth-state-changed", { uid: serviceUser ? serviceUser.uid : null })
          })
        } catch (error) {
          this.error(error)
        }
      }
    }

    async linkProvider(provider, token = {}) {
      if (provider.includes("facebook")) {
        await this.linkFacebook(token) // will get token if unset
      } else if (provider.includes("google")) {
        await this.linkGoogle(token) // will get token if unset
      } else if (provider.includes("email")) {
        await this.emailVerification()
      }

      return
    }

    async _googleCredential(token) {
      if (!token.idToken || !token.accessToken) {
        const googleAuth = await Factor.$google.login()

        token.idToken = googleAuth.Zi.id_token
        token.accessToken = googleAuth.Zi.access_token
      }

      let credential = firebase.auth.GoogleAuthProvider.credential(token.idToken, token.accessToken)
      return credential
    }

    async linkGoogle(token) {
      const credential = await this._googleCredential(token)
      const u = this.client.auth().currentUser
      await u.linkAndRetrieveDataWithCredential(credential)
    }

    async unlinkProvider(provider) {
      return await firebase.auth().currentUser.unlink(provider)
    }

    async setCustomClaims(uid) {
      const result = await Factor.$endpoint.request({
        endpoint: "user",
        action: "customClaims",
        uid
      })

      if (result) {
        const { refresh } = result

        if (refresh) {
          await this.client.auth().currentUser.getIdToken(refresh)
          tokenResult = await this.client.auth().currentUser.getIdTokenResult(refresh)
        }

        return true
      } else {
        return false
      }
    }

    authGetPrivs(parsedToken) {
      const privs = {}
      const { claims } = parsedToken

      if (tokenResult) {
        const userRoles = Factor.$user.roles

        Object.keys(userRoles).forEach(key => {
          if (claims[key]) {
            privs[key] = claims[key]
          }
        })
      }

      return privs
    }

    async authUpdateUser(user) {
      const _ = this.client.auth().currentUser

      const { displayName, photoURL, email } = user

      if (displayName && displayName !== _.displayName) {
        await _.updateProfile({ displayName })
      }

      if (photoURL && photoURL !== _.photoURL) {
        await _.updateProfile({ photoURL })
      }

      if (email && email !== _.email) {
        await _.updateEmail(email)
        this.emailVerification() // ASYNC
      }

      return currentUser
    }

    async emailVerification() {
      return await this.client.auth().currentUser.sendEmailVerification()
    }

    async emailPasswordReset({ email }) {
      await this.client.auth().sendPasswordResetEmail(email)
    }

    async phoneSendCode({ phoneNumber }) {
      let result

      if (!phoneNumber) {
        throw new Error("No phone number was entered.")
      }

      window.messageConfirmationResult = await this.client
        .auth()
        .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)

      return result
    }

    async phoneVerifyCode({ phoneCode }) {
      let user

      if (!window.messageConfirmationResult) {
        throw new Error("Verification code expired.")
      }

      if (!this.client.auth().currentUser) {
        throw new Error("There was an issue connecting to a logged in user account.")
      }

      var credential = await this.client.auth.PhoneAuthProvider.credential(
        window.messageConfirmationResult.verificationId,
        phoneCode
      )

      await this.client.auth().currentUser.linkAndRetrieveDataWithCredential(credential)

      Factor.$events.$emit("user-updated", { location: "verify phone" })

      return user
    }
  }()
}
