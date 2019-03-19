const Factor = require("vue")
const admin = require(`firebase-admin`)
module.exports = () => {
  require("./extend-functions")(Factor)

  const {
    firebase: { databaseURL, serviceAccount }
  } = Factor.$config

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL })

  admin.firestore()

  return Factor
}
