const { ensureDirSync, emptyDirSync, copySync, lstatSync } = require("fs-extra")
const { spawn } = require("child_process")
const glob = require("glob").sync

const { resolve, basename, dirname } = require("path")
export default Factor => {
  return new class {
    constructor() {
      this.applicationPath = Factor.$paths.get("app")
      this.buildDirectory = resolve(this.applicationPath, "functions")
      this.buildFunctionsFolder()
    }

    buildFunctionsFolder() {
      const files = glob(resolve(this.applicationPath, "*"), {
        ignore: ["**/node_modules", "**/package.json", "**/start.js"]
      })

      ensureDirSync(this.buildDirectory)
      emptyDirSync(this.buildDirectory)
      files.forEach(f => {
        const isDir = lstatSync(f).isDirectory()

        const dest = basename(f)
        console.log("dest", this.buildDirectory, dest)
        copySync(f, resolve(this.buildDirectory, dest))
      })
    }
  }()
}
