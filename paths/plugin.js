const path = require("path")

module.exports = (Factor, { pkg }) => {
  return new class {
    constructor() {
      this.assign()

      // Set aliases for node using NPM package
      require("module-alias").addAliases(this.getAliases())
    }

    assign() {
      const { baseDir } = pkg
      const _ = {}
      _.app = baseDir
      _.source = path.resolve(baseDir, "src")
      _.dist = path.resolve(baseDir, "dist")
      _.config = path.resolve(baseDir, "config")
      _.generated = path.resolve(baseDir, ".factor")
      _.static = path.resolve(baseDir, "static")
      _.template = path.resolve(_.source, "index.html")
      _.favicon = path.resolve(_.static, "favicon.png")

      this.paths = Factor.$filters.applyFilters("paths", _)
    }

    get(p) {
      return this.paths[p]
    }

    add(p, value) {
      if (typeof p == "object") {
        this.paths = { ...this.paths, ...p }
      } else {
        this.paths[p] = value
      }
    }

    getAliases() {
      return {
        "@": this.get("source"),
        "~": this.get("app"),
        "@generated": this.get("generated"),
        "@config": this.get("config")
      }
    }
  }()
}
