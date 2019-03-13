export default Factor => {
  return new class {
    constructor() {
      this.registerComponents()
    }

    registerComponents() {
      console.log("REGISTER COMPONENTS")
      Factor.$filters.add("components", _ => {
        _["el-link"] = () => import("./el/link")
        _["el-btn"] = () => import("./el/btn")
        _["el-modal"] = () => import("./el/modal")
        _["el-lightbox"] = () => import("./el/lightbox")
        _["el-avatar"] = () => import("./el/avatar")
        _["el-loading-ring"] = () => import("./el/loading-ring")

        return _
      })
    }
  }()
}
