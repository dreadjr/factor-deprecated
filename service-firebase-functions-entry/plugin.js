const Factor = require("vue")
const admin = require(`firebase-admin`)
const functions = require("firebase-functions")
const { resolve } = require("path")
module.exports = FACTOR_CONFIG => {
  return new class {
    constructor() {
      this.initialize()
    }

    initialize() {
      this.endpointHandler = require("@factor/extend-endpoint")(Factor, {
        baseDir: FACTOR_CONFIG.baseDir,
        setup() {
          const { passwords } = functions.config().factor || {}

          if (passwords) {
            Factor.$filters.add("master-password", passwords)
          }

          // Add the Firebase Functions call that handles the https endpoint requests
          // This is used by the 'endpoint' class
          Factor.$filters.add("endpoint-service", functions.https.onRequest)
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
      // Export endpoints in the form obj['endpointname'] = endpoint(req, res)
      return this.endpointHandler.endpoints()
    }
  }()
}
