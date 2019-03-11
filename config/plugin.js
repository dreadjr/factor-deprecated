const path = require("path")
module.exports = (Factor, { pkg }) => {
  return new class {
    constructor() {
      this.configFolder = Factor.$filters.add("config-path", path.resolve(pkg.baseDir, "config"))
      this.keysPublic = path.resolve(this.configFolder, Factor.$filters.add("keys-public-name", "keys-public.json"))
      this.keysRaw = path.resolve(this.configFolder, Factor.$filters.add("keys-private-name", "keys-private-raw.json"))

      const genFilesFolder = Factor.$filters.add("generated-files-folder", path.resolve(pkg.baseDir, ".factor"))
      Factor.$filters.add("plugins-loader-app", path.resolve(genFilesFolder, "load-plugins-app.js"))
      Factor.$filters.add("plugins-loader-build", path.resolve(genFilesFolder, "load-plugins-build.js"))
      Factor.$filters.add("themes-loader", path.resolve(genFilesFolder, "load-themes.js"))
      Factor.$filters.add("active-loader", path.resolve(genFilesFolder, "load-active.js"))

      this.keysEncryptedDev = path.resolve(genFilesFolder, "keys-encrypted-dev.json")
      this.keysEncryptedProd = path.resolve(genFilesFolder, "keys-encrypted-prod.json")

      this.merge = require("deepmerge")

      this.crypto = require("crypto-json")

      this.doWatchers()
    }

    doWatchers() {
      Factor.$filters.add("development-server", () => {
        this.makeEncryptedSecrets()
      })
      Factor.$filters.add("dev-watchers", _ => {
        const files = [this.keysRaw]

        const watchers = [
          {
            files,
            cb: (event, path) => {
              if (path == this.keysRaw && event == "change") {
                this.makeEncryptedSecrets()
                return true
              }
            }
          }
        ]

        return _.concat(watchers)
      })
    }

    getPublicConfig() {
      const env = process.env.NODE_ENV || "production"
      let publicConfig = {}
      try {
        publicConfig = require(this.keysPublic)
      } catch {
        consola.error(`Can't find public config file @[${this.keysPublic}]`)
      }

      return this.merge.all([
        pkg,
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

    makeEncryptedSecrets() {
      const fs = require("fs-extra")
      const consola = require("consola")
      let passwords = Factor.$filters.get("master-password")

      let passwordsFile = null
      if (!passwords) {
        passwordsFile = path.resolve(Factor.$filters.get("config-path"), "passwords.json")
        try {
          passwords = require(passwordsFile)
        } catch {}
      }

      if (!passwords) {
        consola.error(`Couldn't Find Passwords @[${passwordsFile}] or Filter: 'master-password'`)
        return
      }

      if (!fs.pathExistsSync(this.keysRaw)) {
        consola.error(`Couldn't Find Private Keys File @[${this.keysRaw}]`)
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
        consola.success(`Generated Encrypted Keys [${generated.join(", ")}]`)
      }
    }
  }()
}
