const path = require("path")
const consola = require("consola")
module.exports = Factor => {
  return new class {
    constructor() {
      this.assign()
      require("module-alias/register")
      // Set aliases for node using NPM package
      require("module-alias").addAliases(this.getAliases())
    }

    assign() {
      const { baseDir } = Factor.FACTOR_CONFIG
      const _ = {}
      _.app = baseDir
      _.source = path.resolve(baseDir, "src")
      _.dist = path.resolve(baseDir, "dist")
      _.generated = path.resolve(baseDir, "generated")
      _.config = path.resolve(_.source, "config")
      _.static = path.resolve(_.source, "static")
      _.template = path.resolve(_.source, "index.html")
      _.favicon = path.resolve(_.static, "favicon.png")

      this.paths = Factor.$filters.applyFilters("paths", _)
    }

    get(p) {
      return this.paths[p] || null
    }

    add(p, value) {
      if (typeof p == "object") {
        this.paths = Object.assign({}, this.paths, p)
      } else {
        this.paths[p] = value
      }
    }

    getAliases() {
      return {
        "@": this.get("source"),
        "~": this.get("app"),
        "@generated": this.get("generated"),
        "@config": this.get("config"),
        "@entry": this.get("entry")
      }
    }

    replaceWithAliases(p) {
      const aliases = this.getAliases()

      for (const ali in aliases) {
        if (aliases[ali]) {
          p = p.replace(aliases[ali], ali)
        }
      }

      return p
    }
  }()
}
