import Vue from "vue"

module.exports = opts => {
  const server = Vue.$filters.applyFilters("server", "", opts)

  console.log("here i am in server", server)
}
