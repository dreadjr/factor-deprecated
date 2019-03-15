export default Factor => {
  return new class {
    constructor() {
      Factor.$filters.add("site-components", (_ = {}) => {
        _["plugin-ssr-progress-bar"] = () => import("./ssr-progress-bar")

        return _
      })
    }
  }()
}
