const { ensureDirSync, emptyDirSync, copySync, writeFileSync } = require("fs-extra")
const { spawn } = require("child_process")
const glob = require("glob").sync
const consola = require("consola")
const { resolve, basename, dirname } = require("path")
export default Factor => {
  return new class {
    constructor() {
      this.applicationPath = Factor.$paths.get("app")
      this.buildDirectory = resolve(this.applicationPath, "functions")
      this.buildFunctionsFolder()
    }

    buildFunctionsFolder() {
      this.copyAppDirectories()
      this.makePackageJson()
      this.copyFunctionsFiles()
    }

    copyAppDirectories() {
      const files = glob(resolve(this.applicationPath, "*"), {
        ignore: ["**/node_modules", "**/package.json", "**/start.js", "**/functions"]
      })

      ensureDirSync(this.buildDirectory)
      emptyDirSync(this.buildDirectory)
      files.forEach(f => {
        copySync(f, resolve(this.buildDirectory, basename(f)))
      })
    }

    makePackageJson() {
      const { pkg } = Factor.$config

      const lines = {
        name: "functions",
        description: "** GENERATED FILE **",
        version: pkg.version,
        scripts: {
          //transpile: `npx babel *.js --out-dir ./ ${babelCliPlugins} && npx babel src --out-dir src --ignore node_modules,dist,build ${babelCliPlugins}`
        },
        private: true,
        engines: { node: "8" },
        dependencies: {},
        devDependencies: {}
      }

      writeFileSync(`${this.buildDirectory}/package.json`, JSON.stringify(lines, null, 4))
    }

    copyFunctionsFiles() {
      copySync(resolve(__dirname, "files"), this.buildDirectory)
    }

    // makeIndexEntry() {
    //   const endpoints = []
    //   const lines = [
    //     "/* GENERATED FILE */",
    //     "const entry = require(`@factor/service-firebase-functions-entry`)()",
    //     "module.exports = entry.initialize()"
    //   ]

    //   writeFileSync(`${this.buildDirectory}/index.js`, lines.join(`\n`))
    // }

    transpile() {
      const transpiler = spawn("yarn", ["transpile"], {
        cwd: `${process.cwd()}/functions`
      })

      transpiler.stdout.on("data", function(data) {
        nodeUtils.flog(`TRANSPILE > ${data.toString().trim()}`)
      })

      transpiler.stderr.on("data", function(data) {
        nodeUtils.flog(`TRANSPILE Error: ${data.toString()}`)
      })
    }
  }()
}
