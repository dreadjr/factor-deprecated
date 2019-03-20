const handler = require(`@factor/service-firebase-functions-entry`)({ baseDir: "/" })

module.exports = handler.endpoints()
