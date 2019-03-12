const path = require("path")

module.exports = (Factor, { pkg }) => {
  return new class {
    constructor() {}

    get() {
      const env = process.env.NODE_ENV || "production"
      let publicConfig = {}
      try {
        publicConfig = require("@config/keys-public.json")
      } catch {
        consola.error(`Can't find public config file @[${this.keysPublic}]`)
      }

      const merged = require("deepmerge").all([
        pkg,
        publicConfig[env],
        publicConfig.all,
        {
          env
        }
      ])

      return merged
    }
  }()
}
