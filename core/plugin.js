module.exports = args => {
  args.transpile = true
  args.config.coreDir = __dirname

  require(`./setup`)(args)

  require("./loader").extendApp(args)

  require("./load-server")(args)
}
