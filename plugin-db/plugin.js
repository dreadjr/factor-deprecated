export default Factor => {
  return new class {
    constructor() {
      Factor.$filters.addFilter("mixins", _ => {
        _.db = this.mixin()
        return _
      })
    }

    mixin() {
      return () => {
        this.processors = Factor.$filters.apply("database-query-processors", {})
      }
    }

    async save(query) {
      return this.query({
        method: "save",
        ...query
      })
    }

    async publish(query) {
      return this.query({
        method: "publish",
        ...query
      })
    }

    async search(query) {
      return this.query({
        method: "search",
        ...query
      })
    }

    async read(query) {
      return this.query({
        method: "search",
        ...query
      })
    }

    async query(query) {
      const _promises = Object.keys(this.processors).map(key => {
        const cb = this.processors[key]
        return cb(query)
      })

      let result = await Promise.all(_promises)

      result = result.filter(_ => _)

      const entry = Factor.$lodash.flatten(result)[0]

      const { results = null } = entry || {}

      return results
    }
  }()
}
