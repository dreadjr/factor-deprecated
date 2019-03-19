module.exports = Factor => {
  return new class {
    constructor() {
      const conf = Factor.$paths.get("config")
      const gen = Factor.$paths.get("generated")
      const res = require("path").resolve

      Factor.$paths.add({
        "keys-public": res(conf, "keys-public.json"),
        "keys-private-raw": res(conf, "keys-private-raw.json"),
        "keys-encrypted-dev": res(gen, "keys-encrypted-dev.json"),
        "keys-encrypted-prod": res(gen, "keys-encrypted-prod.json"),
        "plugins-loader-app": res(gen, "load-plugins-app.js"),
        "plugins-loader-build": res(gen, "load-plugins-build.js"),
        passwords: res(conf, "passwords.json")
      })

      this.doWatchers()
    }

    doWatchers() {
      const keysRaw = Factor.$paths.get("keys-private-raw")
      Factor.$filters.add("development-server", () => {
        this.makeEncryptedSecrets()
      })
      Factor.$filters.add("dev-watchers", _ => {
        const files = [keysRaw]
        const watchers = [
          {
            files,
            cb: (event, path) => {
              if (path == keysRaw && event == "change") {
                this.makeEncryptedSecrets()
                return true
              }
            }
          }
        ]
        return _.concat(watchers)
      })
    }

    readEncryptedSecrets({ build = "dev", password }) {
      const file = `keys-encrypted-${build}`
      return require("crypto-json").decrypt(require(this.$paths.get(file)), password)
    }

    makeEncryptedSecrets() {
      const fs = require("fs-extra")
      const consola = require("consola")
      let passwords = Factor.$filters.get("master-password")

      let passwordsFile = Factor.$paths.get("passwords")
      if (!passwords) {
        try {
          passwords = require(passwordsFile)
        } catch (error) {}
      }

      if (!passwords) {
        consola.warn(
          `Didn't generate encrypted keys. No passwords @[${passwordsFile}] or Filter: 'master-password'`
        )
        return
      }

      const keysRaw = Factor.$paths.get("keys-private-raw")

      if (!fs.pathExistsSync(keysRaw)) {
        consola.error(`Couldn't Find Private Keys File @[${keysRaw}]`)
        return
      }

      const rawKeys = require(keysRaw)

      const generated = []
      if (passwords.dev) {
        const encryptedDev = require("crypto-json").encrypt(rawKeys, passwords.dev)
        fs.writeFileSync(
          Factor.$paths.get("keys-encrypted-dev"),
          JSON.stringify(encryptedDev, null, "  ")
        )
        generated.push("dev")
      }

      if (passwords.prod) {
        const encryptedProd = require("crypto-json").encrypt(rawKeys, passwords.prod)
        fs.writeFileSync(
          Factor.$paths.get("keys-encrypted-prod"),
          JSON.stringify(encryptedProd, null, "  ")
        )
        generated.push("prod")
      }

      if (generated.length > 0) {
        consola.success(`Generated Encrypted Keys [${generated.join(", ")}]`)
      }
    }
  }()
}
