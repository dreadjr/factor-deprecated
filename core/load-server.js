import Vue from "vue"
const argv = require("yargs").argv

module.exports = opts => {
  const server = Vue.$filters.applyFilters("server", "", opts)
}
