const path = require("path")
const fs = require("fs-extra")
const consola = require("consola")
module.exports = (Factor, { config }) => {
  return new class {
    constructor() {
      this.configFolder = Factor.$filters.add("config-path", path.resolve(config.baseDir, "config"))
      this.keysPublic = path.resolve(this.configFolder, Factor.$filters.add("keys-public-name", "keys-public.json"))
      this.keysRaw = path.resolve(this.configFolder, Factor.$filters.add("keys-private-name", "keys-private-raw.json"))

      const genFilesFolder = Factor.$filters.get("generated-files-folder")
      this.keysEncryptedDev = path.resolve(genFilesFolder, "keys-encrypted-dev.json")
      this.keysEncryptedProd = path.resolve(genFilesFolder, "keys-encrypted-prod.json")

      this.merge = require("deepmerge")

      this.crypto = require("crypto-json")

      Factor.$filters.add("development-server", () => {
        let passwords = Factor.$filters.get("master-password")

        if (!passwords) {
          const passwordsFile = path.resolve(Factor.$filters.get("config-path"), "passwords.json")
          try {
            passwords = require(passwordsFile)
          } catch (error) {
            consola.warn(`Couldn't Find Passwords @[${passwordsFile}] or Filter: 'master-password'`)
          }
        }
        if (passwords) {
          this.makeEncryptedSecrets()
        }
      })
    }

    getPublicConfig() {
      const env = process.env.NODE_ENV || "production"
      const publicConfig = require(this.keysPublic)
      return this.merge.all([
        config,
        publicConfig[env],
        publicConfig.all,
        {
          env
        }
      ])
    }

    readEncryptedSecrets({ build = "dev", password }) {
      const file = build == "dev" ? this.keysEncryptedDev : this.keysEncryptedProd
      return this.crypto.decrypt(require(file), password)
    }

    makeEncryptedSecrets(passwords = {}) {
      if (!fs.pathExistsSync(this.keysRaw)) {
        consola.warn(`Couldn't Find Private Keys File @[${this.keysRaw}]`)
        return
      }

      const rawKeys = require(this.keysRaw)

      const generated = []
      if (passwords.dev) {
        const encryptedDev = this.crypto.encrypt(rawKeys, passwords.dev)
        fs.writeFileSync(this.keysEncryptedDev, JSON.stringify(encryptedDev, null, "  "))
        generated.push("dev")
      }

      if (passwords.prod) {
        const encryptedProd = this.crypto.encrypt(rawKeys, passwords.prod)
        fs.writeFileSync(this.keysEncryptedProd, JSON.stringify(encryptedProd, null, "  "))
        generated.push("prod")
      }

      if (generated.length > 0) {
        consola.success(`Generated Encrypted Keys [${generated.join(",")}]`)
      }
    }
  }()
}
