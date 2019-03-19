module.exports = () => {
  const admin = require(`firebase-admin`)

  const {
    firebase: { databaseURL, serviceAccount }
  } = require(`@factor/admin-config`)()

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL })

  admin.firestore()
}
