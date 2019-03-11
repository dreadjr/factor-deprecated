<template>
  <div id="app" class="factor-app">123
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