module.exports = (Factor, { config }) => {
  return new class {
    constructor() {
      this._filters = {}
      this._applied = {}
    }

    _sort(arr) {
      return arr.sort((a, b) => {
        const ap = a.priority || 100
        const bp = b.priority || 100

        if (ap < bp) {
          return -1
        } else if (ap > bp) {
          return 1
        } else {
          return 0
        }
      })
    }

    uniqueHash(obj) {
      if (!obj) {
        return obj
      }

      let str = typeof obj !== "string" ? obj.toString() : obj

      str = str.substring(0, 500)

      return str
        .split("")
        .reduce(
          (prevHash, currVal) =>
            ((prevHash << 5) - prevHash + currVal.charCodeAt(0)) | 0,
          0
        )
    }

    // Apply filters a maximum of one time, once they've run add to _applied property
    // If that is set just return it
    get(name, data) {
      //if (!this._applied[name]) {

      // Remove "name" argument
      const params = Array.prototype.slice.call(arguments, 1)

      // Get Filters Added
      const _added = this._filters[name]

      // Thread through filters if they exist
      if (_added && Object.keys(_added).length > 0) {
        const _addedArray = Object.keys(_added).map(i => _added[i])
        const _sorted = this._sort(_addedArray)

        for (let i = 0; i < _sorted.length; i++) {
          const { callback, context } = _sorted[i]

          data = callback.apply(context, params)

          // Add into what is passed into next item
          params[0] = data
        }
      }

      // Sort priority if array is returned
      if (Array.isArray(data)) {
        data = this._sort(data)
      }

      this._applied[name] = data

      return this._applied[name]
    }

    add(name, filter, { context = false, priority = 100 } = {}) {
      if (!this._filters[name]) {
        this._filters[name] = {}
      }

      // create unique ID
      // In certain situations (HMR, dev), the same filter can be added twice
      // Using objects and a hash identifier solves that
      const id = "id" + this.uniqueHash(filter)

      // For simpler assignments where no callback is needed
      const callback = typeof filter != "function" ? () => filter : filter

      context = context || this

      this._filters[name][id] = { callback, context, priority }
    }

    addFilter(name, callback, args) {
      return this.add(name, callback, args)
    }

    applyFilters(name, data) {
      return this.get(name, data)
    }
  }()
}
