<template>
  <div id="app" class="factor-app">
    <router-view />
    <site-progress-bar />
  </div>
</template>
<script>
export default {
  components: {
    "site-progress-bar": () => import("./site-progress-bar")
  }
}
</script>