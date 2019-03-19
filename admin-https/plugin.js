const parse = require("qs").parse
const config = require("@factor/admin-config")
const auth = require("@factor/admin-auth")
const tools = require("@factor/admin-tools")
export default () => {
  return new class {
    constructor() {
      const endpointService = require("firebase-functions").https.onRequest
    }

    endpoint() {
      const instance = (req, res) => {
        return require("cors")({ origin: true })(req, res, async () => {
          const GET = parse(req.query)

          const POST = tools.isJson(req.body) ? JSON.parse(req.body) : req.body

          const ENDPOINT_ARGS = { ...POST, ...GET }

          const out = this.handler(ENDPOINT_ARGS)

          res
            .status(200)
            .jsonp(out)
            .end()

          return
        })
      }

      return endpointService(instance)
    }

    async handler(args) {
      const { action = "", uid = "", report = "", endpoint = "", ...args } = combined

      let out = {}
      let user
      let ep
      try {
        if (!action) {
          throw new Error("[API] No Action Provided")
        }

        user = uid ? await auth.getUser(uid) : {}

        const endpointGlobals = {
          uid,
          user,
          action,
          query,
          config,
          utils: _,
          root,
          req
        }

        ep = plug(endpointGlobals)

        if (ep[action] && typeof ep[action] == "function") {
          out = await ep[action](args)
        } else {
          throw new Error(`[API] Method for "${action}" does not exist.`)
        }
      } catch (error) {
        out = {
          error: {
            message: error.message,
            stack: error.stack
          }
        }
      }
    }

    isJson(str) {
      try {
        JSON.parse(str)
      } catch (error) {
        return false
      }
      return true
    }
  }()
}
