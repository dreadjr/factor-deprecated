<template>
  <div class="how-it-works">
    <section class="mast">
      <div class="splash">
        <div>
          <h1 class="title">How Factor Works</h1>
          <p class="subtitle">At vero eos et accusamus et iusto odio dignissimos ducimus.</p>
        </div>
      </div>
    </section>

    <section class="mast">
      <div class="items-wrap">
        <div class="item">
          <div>
            <el-svg icon="fast-clock" background="rgba(4, 149, 254, 0.2)" />
            <h2 class="title">Fast Setup</h2>
            <p>Get started in minutes. sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
            <div class="actions">
              <el-link path="/docs">
                Start Now
                <i class="fa fa-arrow-right" />
              </el-link>
            </div>
          </div>
          <div>
            <strong>Install with NPM</strong>
            <pre>
              <code class="language-css">
                npm install @factor
              </code>
            </pre>
            <strong>Install with YARN</strong>
            <pre>
              <code class="language-css">
                yarn add @factor
              </code>
            </pre>
          </div>
        </div>
        <div class="item">
          <div>
            <el-svg icon="puzzle" color="#F32DA9" background="rgba(243, 45, 169, 0.2)" />
            <h2 class="title">Modular</h2>
            <p>Get started in minutes. sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
            <div class="actions">
              <el-link path="/plugins">
                Get Plugins
                <i class="fa fa-arrow-right" />
              </el-link>
            </div>
          </div>
          <div>
            <div class="stripes-bg">
              <img
                class="image-facing-right"
                :src="require(`./img/modular.png`)"
                alt="Factor - Modular"
              >
            </div>
          </div>
        </div>
        <div class="item">
          <div>
            <el-svg icon="fast-clock" background="rgba(4, 149, 254, 0.2)" />
            <h2 class="title">Build with Vue.js</h2>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            <div class="actions">
              <el-link path="/docs">
                Explore the docs
                <i class="fa fa-arrow-right" />
              </el-link>
            </div>
          </div>
          <div>
            <div class="stripes-bg">
              <img
                class="image-facing-left"
                :src="require(`./img/markdown-editor.png`)"
                alt="Factor - Modular"
              >
            </div>
          </div>
        </div>
        <div class="item">
          <div>
            <el-svg icon="puzzle" color="#F32DA9" background="rgba(243, 45, 169, 0.2)" />
            <h2 class="title">Customizable</h2>
            <p>Include only what you need. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
          </div>
          <div>
            <div class="stripes-bg">
              <img
                class="image-facing-right"
                :src="require(`./img/modular.png`)"
                alt="Factor - Modular"
              >
            </div>
          </div>
        </div>
        <div class="item">
          <div>
            <el-svg icon="fast-clock" background="rgba(4, 149, 254, 0.2)" />
            <h2 class="title">Markdown Editor</h2>
            <p>The Markdown editor provides a great writing experience with simple formatting. It also saves time over hand-crafted HTML tags, and it’s faster than using a WYSIWYG.</p>
          </div>
          <div>
            <div class="stripes-bg">
              <img
                class="image-facing-left"
                :src="require(`./img/markdown-editor.png`)"
                alt="Factor - Modular"
              >
            </div>
          </div>
        </div>
        <div class="item">
          <div>
            <el-svg icon="puzzle" color="#F32DA9" background="rgba(243, 45, 169, 0.2)" />
            <h2 class="title">User Roles &amp; Permissions</h2>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          </div>
          <div>
            <div class="stripes-bg">
              <img
                class="image-facing-right"
                :src="require(`./img/modular.png`)"
                alt="Factor - Modular"
              >
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="mast">
      <div class="cta">
        <div>
          <h3 class="title">Ready to Start Building?</h3>
          <p class="subtitle">Get in touch or create an account</p>
        </div>
        <div class="actions">
          <el-link path="/download" btn="primary" size="large">
            Download
            <i class="fa fa-arrow-right" />
          </el-link>
          <el-link path="/contact" btn="tertiary" size="large">Contact Us</el-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  components: {
    "el-svg": () => import("./el/el-svg")
  },
  data() {
    return {
      loading: true
    }
  },
  mounted() {},
  metatags() {
    return {
      title: "How Factor Works",
      description: "",
      image: ""
    }
  }
}
</script>
<style lang="less">
.how-it-works {
  .mast {
    padding: 0 2em;
    line-height: 1.2;
    max-width: 1000px;
    margin: 0 auto;
  }
  .svg-wrap {
    display: inline-block;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-radius: 14px;
    svg {
      padding: 2px;
      min-height: 50px;
    }
  }
  .splash {
    padding: 7em 0;
    text-align: center;
    @media (max-width: 767px) {
      padding: 4em 0;
    }
    .title {
      font-weight: 600;
      font-size: 3em;
      letter-spacing: -0.03em;
      line-height: 0.9;
      margin-bottom: 0.2em;
    }
    .subtitle {
      opacity: 0.5;
      font-size: 1.5em;
      font-weight: 500;
      @media (max-width: 767px) {
        font-size: 1.2em;
      }
    }
  }

  .item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 3em;
    align-items: center;
    padding: 3em 0;

    @media (max-width: 767px) {
      grid-template-columns: 1fr;
      grid-gap: 0;
      padding: 2em 1em;
    }

    &:nth-child(2n + 2) {
      direction: rtl; //reverse even items order
      > div {
        direction: ltr;
      }
    }
    // &:last-child {
    //   padding-bottom: 0;
    // }
    .title {
      font-size: 2em;
      line-height: 1;
      margin: 0.3em 0;
      font-weight: 600;
    }
    p {
      font-size: 1.2em;
      line-height: 1.4em;
      opacity: 0.5;
    }
    .actions {
      margin-top: 1em;
      a {
        font-size: 1.4em;
      }
    }

    .stripes-bg {
      background: url(./img/stripes.svg) no-repeat center center;
      background-size: contain;
    }

    img {
      max-width: 100%;
      &.image-facing-right {
        transform: scale(1) perspective(2910px) rotateY(12deg) rotateX(3deg)
          rotate(-2deg);
      }
      &.image-facing-left {
        transform: scale(0.9) perspective(1040px) rotateY(-10deg) rotateX(2deg)
          rotate(2deg);
      }
    }
  }

  .cta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 60px;
    padding: 4em 0;
    @media (max-width: 767px) {
      display: block;
    }
    .title {
      font-weight: 600;
      font-size: 2em;
      letter-spacing: -0.03em;
      line-height: 0.9;
      margin-bottom: 0.2em;
    }
    .subtitle {
      opacity: 0.5;
      font-size: 1.2em;
      font-weight: 500;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      @media (max-width: 767px) {
        display: block;
        margin-top: 1.5em;
      }
    }
  }
}
</style>