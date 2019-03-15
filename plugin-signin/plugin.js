export default Factor => {
  return new class {
    constructor() {
      Factor.$filters.add("content-routes", _ => {
        _.push({
          name: "signin",
          path: "/signin",
          component: () => import("./view-signin")
        })

        return _
      })

      Factor.$filters.add("site-components", (_ = {}) => {
        _["plugin-signin-modal"] = () => import("./el-modal-signin")

        return _
      })
    }
  }()
}
