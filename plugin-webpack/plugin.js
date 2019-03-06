const path = require("path")
const consola = require("consola")
// const resolve = dir => path.join(__dirname, "..", dir)
const merge = require("webpack-merge")
const webpack = require("webpack")
const nodeExternals = require("webpack-node-externals")
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const VueLoaderPlugin = require("vue-loader/lib/plugin")

const TerserPlugin = require("terser-webpack-plugin")

const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin")
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin")
const WebpackBar = require("webpackbar")

const NODE_ENV = process.env.NODE_ENV

export default Factor => {
  return new class {
    constructor() {
      Factor.$filters.addFilter("build-production", args => {
        return this.buildProduction(args)
      })
      Factor.$filters.addFilter("webpack-config", args => {
        return this.getConfig(args)
      })
    }

    buildCallback({ err, stats, resolve, reject }) {}

    augmentBuild(name, compiler, { resolve, reject }) {
      var ProgressPlugin = require("webpack/lib/ProgressPlugin")
      const progressBar = require("cli-progress")

      let bar = new progressBar.Bar(
        {
          format: `${name} [{bar}] {percentage}% {msg}`
        },
        progressBar.Presets.rect
      )

      bar.start(100, 1, { msg: "" })

      compiler.apply(
        new ProgressPlugin((ratio, msg) => {
          const percent = ratio * 100

          bar.update(percent, {
            msg
          })
        })
      )

      compiler.run((err, stats) => {
        bar.stop()

        process.stdout.write(
          stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          }) + "\n\n"
        )

        if (err || stats.hasErrors()) {
          consola.error(err)
          reject(err)
        } else {
          consola.success(`[${name}] Built`)
          resolve()
        }
      })
    }

    async buildProduction(args, cb) {
      try {
        const serverConfig = this.getConfig({
          build: "production",
          target: "server"
        })

        await new Promise((resolve, reject) => {
          const serverCompiler = webpack(serverConfig)
          this.augmentBuild("Server", serverCompiler, { resolve, reject })
        })

        const clientConfig = this.getConfig({
          build: "production",
          target: "client"
        })

        await new Promise((resolve, reject) => {
          const clientCompiler = webpack(clientConfig)
          this.augmentBuild("Client", clientCompiler, { resolve, reject })
        })

        return
      } catch (error) {
        consola.error(error)
      }
    }

    getConfig(args) {
      const { target, build, analyze = false, testing = false } = args

      const baseConfig = this.base(args)

      const buildConfig =
        build == "production" ? this.production() : this.development()

      const targetConfig = target == "server" ? this.server() : this.client()

      const testingConfig = testing ? this.testing() : {}

      const analyzeConfig = analyze ? this.analyze() : {}

      return merge(
        baseConfig,
        buildConfig,
        targetConfig,
        testingConfig,
        analyzeConfig
      )
    }

    server() {
      return {
        target: "node",
        entry: Factor.$files.getPath("entryServer"),
        output: {
          filename: "server-bundle.js",
          libraryTarget: "commonjs2"
        },
        // https://webpack.js.org/configuration/externals/#externals
        // https://github.com/liady/webpack-node-externals
        externals: nodeExternals({
          // do not externalize CSS files in case we need to import it from a dep
          whitelist: /\.css$/
        }),
        plugins: [
          new VueSSRServerPlugin()
          // new WebpackBar({
          //   name: "server",
          //   color: "#FF0076"
          // })
        ]
      }
    }

    client() {
      return {
        entry: {
          app: Factor.$files.getPath("entryClient")
        },

        plugins: [
          new VueSSRClientPlugin()
          // new WebpackBar({
          //   name: "client",
          //   color: "#0496FF"
          // })
        ]
      }
    }

    production() {
      return {
        mode: "production",
        // devtool: false,
        output: {
          publicPath: "/"
        },
        plugins: [
          new MiniCssExtractPlugin({
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css"
          })
        ],
        performance: {
          hints: "warning"
        },
        optimization: {
          minimizer: [new TerserPlugin(), new OptimizeCSSAssetsPlugin({})]
        }
      }
    }

    development() {
      return {
        mode: "development",
        devtool: "eval-source-map",
        output: {
          publicPath: Factor.$files.getPath("dist")
        },
        plugins: [new FriendlyErrorsWebpackPlugin()],
        performance: { hints: false } // Warns about large dev file sizes
      }
    }

    analyze() {
      return { plugins: [new BundleAnalyzerPlugin()] }
    }

    testing() {
      return {
        devtool: "#cheap-module-source-map"
      }
    }

    base(args) {
      const out = {
        output: {
          path: Factor.$files.getPath("dist"),
          filename: "js/[name].[chunkhash].js"
        },
        resolve: {
          extensions: [".js", ".vue", ".json"],
          alias: {
            "@": Factor.$files.getPath("theme"),
            "~": Factor.$files.getPath("app")
          }
        },

        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: "vue-loader"
            },

            {
              test: /\.js$/,
              loader: "babel-loader",
              options: Factor.$files.transpilerConfig("loader")
            },

            {
              test: /\.(png|jpg|gif|svg)$/,
              loader: "file-loader",
              options: {
                limit: 10000,
                name: "[name].[hash].[ext]"
              }
            },
            { test: /\.(mov|mp4)$/, use: ["file-loader"] },

            {
              test: /\.less/,
              use: this.lessLoad(args)
            },

            {
              test: /\.css$/,
              use: [
                {
                  loader: "vue-style-loader"
                },
                {
                  loader: "css-loader"
                }
              ]
            }
          ]
        },
        performance: {
          maxEntrypointSize: 600000
        },
        node: {
          fs: "empty"
        },
        plugins: [
          new CopyWebpackPlugin([
            {
              from: Factor.$files.getPath("static"),
              to: "static",
              ignore: [".*"]
            }
          ]),
          new VueLoaderPlugin(),
          new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
            "process.env.VUE_ENV": JSON.stringify(args.target)
          })
        ],
        stats: { children: false }
      }

      return out
    }

    lessLoad({ target, build }) {
      let finishing
      const baseLoaders = [
        {
          loader: "css-loader"
        },
        {
          loader: "postcss-loader",
          options: {
            plugins: [require("cssnano")({ preset: "default" })],
            minimize: true
          }
        },
        {
          loader: "less-loader"
        }
      ]

      if (build != "production") {
        finishing = [
          {
            loader: "vue-style-loader"
          }
        ]
      } else if (target == "client" && build == "production") {
        finishing = [
          {
            loader: MiniCssExtractPlugin.loader
          }
        ]
      } else if (target == "server" && build == "production") {
        finishing = [{ loader: "null-loader" }]
      }

      return [...finishing, ...baseLoaders]
    }
  }()
}
