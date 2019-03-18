module.exports = Factor => {
  const env = process.env.NODE_ENV || "production"
  let publicConfig = {}
  try {
    publicConfig = require("@config/keys-public.json")
  } catch (error) {
    consola.error(`Can't find public config file @[${this.keysPublic}]`)
  }

  const merged = require("deepmerge").all([
    Factor.$pkg,
    publicConfig[env],
    publicConfig.all,
    {
      env
    }
  ])

  return merged
}
