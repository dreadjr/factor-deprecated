const { ensureDirSync, emptyDirSync, copySync, writeFileSync } = require("fs-extra")
const { spawn } = require("child_process")
const glob = require("glob").sync
const consola = require("consola")
const { resolve, basename, dirname } = require("path")
export default Factor => {
  return new class {
    constructor() {
      this.folderName = "serverless"
      this.applicationPath = Factor.$paths.get("app")
      this.buildDirectory = resolve(this.applicationPath, this.folderName)
      this.buildFunctionsFolder()
      this.addConfig()
    }

    addConfig() {
      Factor.$filters.add("firebase-config", _ => {
        _.hosting = _.hosting || {}

        _.hosting.rewrites = [
          {
            source: "**",
            function: "ssr"
          }
        ]

        _.functions = {
          source: this.folderName
        }

        return _
      })
    }

    buildFunctionsFolder() {
      this.copyAppDirectories()
      this.makePackageJson()
      this.copyFunctionsFiles()
      this.runtimeFile()
      this.transpile()
    }

    copyAppDirectories() {
      const files = glob(resolve(this.applicationPath, "*"), {
        ignore: ["**/node_modules", "**/package.json", "**/start.js", `**/${this.folderName}`]
      })

      ensureDirSync(this.buildDirectory)
      emptyDirSync(this.buildDirectory)
      files.forEach(f => {
        copySync(f, resolve(this.buildDirectory, basename(f)))
      })
    }

    makePackageJson() {
      const dependencies = {}
      dependencies["@factor/service-firebase-functions-entry"] = "^1.0.0"

      const { pkg } = Factor.$config
      const babelCliPlugins = "--plugins=babel-plugin-dynamic-import-node"
      const lines = {
        name: "serverless",
        description: "** GENERATED FILE **",
        version: pkg.version,
        scripts: {
          install: "npm install",
          transpile: `npx babel *.js --out-dir ./ ${babelCliPlugins} && npx babel src --out-dir src --ignore node_modules,dist,build ${babelCliPlugins}`
        },
        private: true,
        engines: { node: "8" },
        dependencies,
        devDependencies: {}
      }

      writeFileSync(`${this.buildDirectory}/package.json`, JSON.stringify(lines, null, 4))
    }

    copyFunctionsFiles() {
      copySync(resolve(__dirname, "files"), this.buildDirectory)
    }

    runtimeFile() {
      const runner = spawn("npx", ["firebase", "functions:config:get > .runtimeconfig.json"], {
        cwd: `${process.cwd()}/${this.folderName}`
      })

      runner.stdout.on("data", function(data) {
        consola.log(`Runtime > ${data.toString().trim()}`)
      })

      runner.stderr.on("data", function(data) {
        consola.log(`Error: ${data.toString()}`)
      })

      runner.on("close", code => {
        consola.log(`exited with code ${code}`)
      })
    }

    transpile() {
      const transpiler = spawn("npm", ["run", "transpile"], {
        cwd: `${process.cwd()}/${this.folderName}`
      })

      transpiler.stdout.on("data", function(data) {
        consola.log(`ES6 Transpile Serverless > ${data.toString().trim()}`)
      })

      transpiler.stderr.on("data", function(data) {
        consola.log(`TRANSPILE Error: ${data.toString()}`)
      })

      transpiler.on("close", code => {
        consola.log(`Transpiler exited with code ${code}`)
      })
    }
  }()
}
