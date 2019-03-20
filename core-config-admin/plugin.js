const merge = require("deepmerge")
const env = process.env.NODE_ENV || "production"
const isNode = require("detect-node")
module.exports = Factor => {
  const handler = new class {
    constructor() {}
    getPasswords() {
      let passwords = Factor.$filters.apply("master-password")
      if (!passwords) {
        passwords = this.getPasswordsFile()
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
      const out = {}
      try {
        out = require("@config/keys-public.json")
      } catch (error) {
        console.error(`Cant Find Public Config`)
      }
      return out
    }

    getPasswordsFile() {
      const out = {}
      try {
        out = require("@config/passwords.json")
      } catch (error) {}
      return out
    }

    fullConfig() {
      let publicConfig = this.getPublicConfig()

      const privateConfig = Factor.FACTOR_ENV != "app" && isNode ? this.serverPrivateConfig() : {}

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
