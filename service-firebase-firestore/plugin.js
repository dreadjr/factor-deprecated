export default Factor => {
  return new class {
    constructor() {
      if (Factor.FACTOR_ENV == "build") {
        this.addConfig()
      } else {
        const firebaseApp = require("@factor/service-firebase-app").default
        require("firebase/firestore")

        this.client = firebaseApp(Factor).client

        Factor.$filters.addService({
          name: "db-service-read",
          service: _ => this.read(_)
        })

        Factor.$filters.addService({
          name: "db-service-update",
          service: _ => this.update(_)
        })
      }
    }

    addConfig() {
      const { resolve } = require("path")
      const { copySync } = require("fs-extra")
      const fldr = Factor.$paths.folder("generated")

      copySync(resolve(__dirname, "files"), Factor.$paths.get("generated"))

      Factor.$filters.add("firebase-config", _ => {
        _.firestore = {
          rules: `${fldr}/firebase-firestore.rules`,
          indexes: `${fldr}/firebase-firestore-indexes.json`
        }

        return _
      })
    }

    async queryHandler(query) {
      const { method } = query

      if (method == "search") {
        return
      } else if (method == "read") {
      } else {
      }
      let entry = await this.doQueryRecursive(this.client.firestore(), query)

      return entry
    }

    async read({ id, collection }) {
      const doc = await this.client
        .firestore()
        .collection(collection)
        .doc(id)
        .get()

      return this.refineQueryResults(doc)
    }

    async update({ id, collection, data }) {
      await this.client
        .firestore()
        .collection(collection)
        .doc(id)
        .set(data, { merge: true })

      return true
    }

    async doQueryRecursive(container, query) {
      const {
        table,
        where = [],
        orderBy = [],
        id = false,
        data = {},
        method = "query",
        merge = true,
        limit = 30
      } = query

      const options = { merge }

      const isData = !Factor.$lodash.isEmpty(data) ? true : false
      const isQuery = where.length > 0 || orderBy.length > 0 ? true : false

      let ref = container.collection(table)

      let entry = {}

      if (isQuery) {
        if (where.length > 0) {
          where.forEach(({ field, comp, value }) => {
            ref = ref.where(field, comp, value)
          })
        }

        if (orderBy.length > 0) {
          orderBy.forEach(({ field, direction }) => {
            ref = ref.orderBy(field, direction)
          })
        }

        ref = ref.limit(limit)

        entry = this.refineQueryResults(await ref.get())
      } else if (id && !isData && !query.query) {
        ref = ref.doc(id)
        entry = this.refineQueryResults(await ref.get())
      } else {
        // If query has an id, find the doc
        // If no id but SET date, then get a new doc ref
        ref = id ? ref.doc(id) : isData ? ref.doc() : false

        const documentId = ref.id

        // Update
        if (isData) {
          if (!id) {
            data.createdAt = Factor.$time.stamp()
          }

          data.updatedAt = Factor.$time.stamp()

          data.id = documentId

          const prepared = Factor.$db.prepare(data)

          await ref.set(prepared, options)

          entry = { results: prepared }
        } else if (id && method === "delete") {
          await ref.delete()
        } else if (query.query) {
          entry = await this.doQueryRecursive(ref, query.query) // RECURSION
        }
      }

      return entry
    }

    refineQueryResults(doc) {
      const results = {}

      if (typeof doc.forEach === "function") {
        results.results = []

        doc.forEach(item => {
          const docData = Object.assign(
            {},
            {
              exists: item.exists,
              doc: item.id
            },
            item.data()
          )
          results.results.push(docData)
        })
      } else {
        results.exists = doc.exists

        results.results = doc.exists ? doc.data() : {}

        // results.service = doc

        results.doc = doc.id
      }

      return results
    }
  }()
}
