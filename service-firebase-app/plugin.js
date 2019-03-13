export default Factor => {
  return new class {
    constructor() {
      const firebase = require("firebase/app")

      Factor.$events.$emit("firebase-load", firebase)

      // Start Client Firebase Instance
      if (firebase.apps.length == 0) {
        firebase.initializeApp(Factor.$config.firebase)
      }

      Factor.$events.$emit("firebase-init", firebase)
    }
  }()
}
