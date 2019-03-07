export default (Factor, { config }) => {
  return new class {
    constructor() {
      const path = require("path")

      Factor.$filters.add("app-path", () => path.resolve(config.baseDir))

      Factor.$filters.add("theme-path", () => path.resolve(config.baseDir))

      Factor.$filters.add("src-path", () => path.resolve(config.baseDir, "src"))

      Factor.$filters.add("html-template-path", () => {
        return path.resolve(Factor.$filters.get("src-path"), "index.html")
      })

      Factor.$filters.add("static-path", () => {
        return path.resolve(Factor.$filters.get("app-path"), "static")
      })

      Factor.$filters.add("favicon-path", () => {
        return path.resolve(Factor.$filters.get("static-path"), "favicon.png")
      })

      Factor.$filters.add("entry-client-path", () =>
        path.resolve(__dirname, "entry-client.js")
      )

      Factor.$filters.add("entry-server-path", () =>
        path.resolve(__dirname, "entry-server.js")
      )
    }
  }()
}
