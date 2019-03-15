<template>
  <div class="content-layout">
    <div class="nav">Quick Nav:
      <factor-link path="/">Home</factor-link>
      <factor-link path="/how-it-works">How it works</factor-link>
      <factor-link path="/plugins">Plugins</factor-link>
      <factor-link path="/docs">Docs</factor-link>
    </div>
    <router-view />
  </div>
</template>
<style src="./css/common.less" lang="less"></style>
<script>
export default {}
</script>

<style lang="less">
.content-layout {
  display: flex;
  flex-direction: column;

  .content-content {
    display: flex;
    flex-grow: 1;
    .content-nav,
    .content-main {
      overflow-y: scroll;
    }
    .content-nav {
      flex: 0 0 250px;
      padding: 1em 1.5em;
      background: rgba(38, 67, 89, 0.08);
    }
    .content-main {
      flex: 1 1 100%;
      display: flex;
      flex-direction: column;
      .content-main-content {
        padding: 1.5em;
        flex-grow: 1;
      }
      .content-footer {
        padding: 1em 1.5em;
        font-size: 0.85em;
        //  background: rgba(38, 67, 89, 0.03);
        color: rgba(38, 67, 89, 0.2);
        text-align: center;
      }
    }
  }
}
</style>