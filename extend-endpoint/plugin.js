module.exports = (Factor, FACTOR_CONFIG) => {
  return new class {
    constructor() {
      Factor.FACTOR_CONFIG = FACTOR_CONFIG
      Factor.FACTOR_ENV = "endpoint"
      this.setup()
    }

    setup() {
      Factor.config.productionTip = false
      Factor.config.devtools = false
      Factor.config.silent = true

      this.addCoreExtension("filters", require(`@factor/core-filters`))

      if (typeof FACTOR_CONFIG.setup == "function") {
        FACTOR_CONFIG.setup()
      }

      this.addCoreExtension("paths", require(`@factor/core-paths`))
      this.addCoreExtension("keys", require(`@factor/core-keys`))
      this.addCoreExtension("files", require(`@factor/core-files`))
      this.addCoreExtension("config", require(`@factor/core-config-admin`))
      this.addCoreExtension("endpoint", require(`@factor/core-endpoint`))
    }

    addCoreExtension(id, extension) {
      Factor.use({
        install(Factor) {
          Factor[`$${id}`] = Factor.prototype[`$${id}`] = extension(Factor)
        }
      })
    }

    endpoints() {
      const endpoints = {}

      // Get extensions that are endpoints
      const endpointPlugins = require(resolve(
        Factor.$paths.get("generated"),
        "load-plugins-endpoint"
      ))

      // Add the endpoints to be processed by endpoint handler
      for (var id in endpointPlugins) {
        endpoints[id] = Factor.$endpoint.instance(endpointPlugins[id])
      }

      return endpoints
    }
  }()
}
