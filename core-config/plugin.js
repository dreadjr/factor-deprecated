const merge = require("deepmerge")
const env = process.env.NODE_ENV || "production"
const isNode = require("detect-node")
module.exports = Factor => {
  const handler = new class {
    getPasswords() {
      let passwords = Factor.$filters.apply("master-password")
      if (!passwords) {
        try {
          passwords = require("@config/passwords.json")
        } catch (error) {}
      }

      return passwords
    }

    serverPrivateConfig() {
      const passwords = this.getPasswords()
      const build = env == "production" ? "prod" : "dev"
      const password = passwords[build]
      let config = {}

      if (password) {
        config = Factor.$keys.readEncryptedSecrets({ build, password })
      }

      console.log("private config", config)

      return config
    }

    fullConfig() {
      let publicConfig = {}
      try {
        publicConfig = require("@config/keys-public.json")
      } catch (error) {
        consola.error(`Can't find public config file @[${this.keysPublic}]`)
      }

      const privateConfig = Factor.FACTOR_ENV != "app" && isNode ? this.serverPrivateConfig() : {}

      return merge.all([
        Factor.FACTOR_CONFIG,
        publicConfig[env],
        publicConfig.all,
        privateConfig,
        isNode,
        {
          env
        }
      ])
    }
  }()

  return handler.fullConfig()
}
