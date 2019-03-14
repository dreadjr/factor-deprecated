<template>
  <div class="how-it-works">
    <section class="splash-wrap">
      <div class="splash mast">
        <div>
          <h1 class="title">How Factor Works</h1>
          <p class="subtitle">At vero eos et accusamus et iusto odio dignissimos ducimus.</p>
        </div>
      </div>
    </section>

    <section class="items-wrap stripes-wrap">
      <div class="stripes" />
      <div class="mast">
        <div class="item">
          <div>
            <el-svg icon="fast-clock" />
            <h2 class="title">5 Minute Setup</h2>
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
              <code class="language-html">npm install @factor</code>
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
            <el-svg icon="puzzle" />
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
            <div class="circles-bg">
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
            <el-svg icon="vue" />
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
            <div class="glow-bg">
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
            <el-svg icon="wrench" />
            <h2 class="title">Customizable</h2>
            <p>Include only what you need. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
          </div>
          <div>
            <div class="triangles-bg">
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
            <el-svg icon="markdown" />
            <h2 class="title">Markdown Editor</h2>
            <p>The Markdown editor provides a great writing experience with simple formatting. It also saves time over hand-crafted HTML tags, and it’s faster than using a WYSIWYG.</p>
          </div>
          <div>
            <div>
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
            <el-svg icon="user" />
            <h2 class="title">User Roles &amp; Permissions</h2>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          </div>
          <div>
            <div>
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

  .stripes-wrap {
    position: relative;
    .stripes {
      position: absolute;
      z-index: 0;
      width: 100%;
      height: 100%;
      top: 0;
      transform: skewY(-5deg);
      background: #fafbff;
      background: linear-gradient(
        0deg,
        rgba(250, 251, 255, 1) 0%,
        rgba(255, 255, 255, 1) 49%,
        rgba(250, 251, 255, 1) 100%
      );
    }
    .mast {
      position: relative;
    }
  }

  .svg-wrap {
    display: inline-block;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
    svg {
      padding: 2px;
      min-height: 50px;
      max-width: 30px;
    }
  }

  .splash-wrap {
    background: rgb(255, 255, 255);
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(250, 251, 255, 1) 100%
    );
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

  .items-wrap {
    padding: 4em 0;
    margin: 3em 0;
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
      margin: 0.5em 0;
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
        font-size: 1.2em;
      }
    }

    .circles-bg {
      background: url(./img/circles.svg) no-repeat center center;
      background-size: contain;
    }
    .glow-bg {
      background: url(./img/glow.svg) no-repeat center center;
      background-size: contain;
    }
    .triangles-bg {
      background: url(./img/triangles.svg) no-repeat center center;
      background-size: contain;
    }
    .blue-lines-bg {
      background: url(./img/lines.svg) no-repeat center center;
      background-size: contain;
    }
    .pink-lines-bg {
      background: url(./img/lines-pink.svg) no-repeat center center;
      background-size: contain;
    }

    img {
      max-width: 100%;
      &.image-facing-right {
        transform: scale(0.7) perspective(2910px) rotateY(12deg) rotateX(3deg)
          rotate(-2deg);
      }
      &.image-facing-left {
        border-radius: 14px;
        box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.25),
          0 18px 36px -18px rgba(0, 0, 0, 0.3),
          0 -12px 36px -8px rgba(0, 0, 0, 0.025);
        transform: scale(0.7) perspective(1040px) rotateY(-5deg) rotateX(1deg)
          rotate(1deg);
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