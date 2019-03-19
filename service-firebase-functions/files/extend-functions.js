const functions = require("firebase-functions")
module.exports = Factor => {
  return new class {
    constructor() {
      Factor.FACTOR_CONFIG = { baseDir: __dirname }
      Factor.FACTOR_ENV = "endpoint"
      this.setup()
    }

    // If there is an environmental variables set with key factorPasswords
    // Then use a filter to set that, this way passwords.json doesn't have to move around
    handleAdminPasswords() {
      const passwords = functions.config().factorPasswords

      if (passwords) {
        Factor.$filters.add("master-password", passwords)
      }
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = true
      Factor.config.silent = false

      const _ = {}
      _.filters = require(`@factor/core-filters`)
      _.paths = require(`@factor/core-paths`)
      _.paths = require(`@factor/core-keys`)
      _.config = require(`@factor/core-config`)

      Factor.use({
        install(Factor) {
          for (var plug in _) {
            Factor[`$${plug}`] = Factor.prototype[`$${plug}`] = _[plug](Factor)

            if (plug == "filters") {
              this.handleAdminPasswords()
            }
          }
        }
      })
    }
  }()
}
