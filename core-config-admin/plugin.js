const merge = require("deepmerge")
const env = process.env.NODE_ENV || "production"
const isNode = require("detect-node")
const { resolve } = require("path")
const consola = require("consola")
module.exports = Factor => {
  const handler = new class {
    constructor() {}
    getPasswords() {
      let passwords = Factor.$filters.apply("master-password")
      if (!passwords) {
        passwords = {}
        try {
          passwords = require(resolve(Factor.$paths.get("passwords")))
        } catch (error) {}
      }

      if (Object.keys(passwords).length == 0) {
        consola.warn("Can't find private key passwords")
      }

      return passwords
    }

    serverPrivateConfig() {
      const passwords = this.getPasswords()

      const build = env == "production" ? "prod" : "dev"

      let config = {}

      if (passwords && passwords[build]) {
        config = Factor.$keys.readEncryptedSecrets({ build, password: passwords[build] })
      }

      return config
    }

    getPublicConfig() {
      let out = {}
      const path = Factor.$paths.get("keys-public")

      try {
        out = require(path)
      } catch (error) {
        consola.warn(`Public config file error @[${path}]`, error.message)
      }
      return out
    }

    getPasswordsFile() {
      const out = {}
      try {
        out = require(resolve(Factor.$paths.get("config"), "passwords.json"))
      } catch (error) {}
      return out
    }

    fullConfig() {
      let publicConfig = this.getPublicConfig()

      const privateConfig = this.serverPrivateConfig()

      const configObjects = [
        Factor.FACTOR_CONFIG,
        publicConfig[env],
        publicConfig.all,
        privateConfig,
        isNode,
        {
          env
        }
      ].filter(_ => _)

      return merge.all(configObjects)
    }
  }()

  return handler.fullConfig()
}
