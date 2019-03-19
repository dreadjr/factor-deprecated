const Factor = require("vue")
const admin = require(`firebase-admin`)
const functions = require("firebase-functions")
const { resolve } = require("path")
module.exports = () => {
  return new class {
    constructor() {
      this.initialize()
    }

    initialize() {
      require("@factor/extend-endpoint")(Factor, {
        baseDir: __dirname,
        setup() {
          const passwords = functions.config().factorPasswords

          if (passwords) {
            Factor.$filters.add("master-password", passwords)
          }
        }
      })

      const {
        firebase: { databaseURL, serviceAccount }
      } = Factor.$config

      admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL })

      admin.firestore()

      return Factor
    }

    endpoints() {
      return require(resolve(Factor.$paths.get("generated"), "load-plugins-endpoint"))
    }
  }()
}
