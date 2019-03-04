module.exports = config => {
  require("./transpiler")()

  require(`./setup`)

  require("./loader").extendApp({ config })

  require("./load-server")({ config })
}
