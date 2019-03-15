<template>
  <div class="home">
    <section class="splash-wrap">
      <div class="splash mast">
        <div>
          <h1 class="title">The New Standard in CMS</h1>
          <p class="subtitle">Factor helps developers build sites faster with vue.js.</p>
          <div class="actions">
            <el-link path="/download" btn="secondary" size="large">
              Download Factor
              <i class="fa fa-arrow-right" />
            </el-link>
          </div>
        </div>
        <div>
          <div class="splash-image">Any image or content can go here</div>
        </div>
      </div>
    </section>
    <section class="boxes-wrap stripes-wrap">
      <div class="stripes" />
      <div class="mast">
        <h2 class="title">Why Factor?</h2>
        <p class="subtitle">At vero eos et accusamus et iusto odio dignissimos ducimus.</p>
        <div class="boxes">
          <div class="box">
            <el-svg icon="server" />
            <h2>Static Hosting</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
          </div>
          <div class="box">
            <el-svg icon="js" />
            <h2>100% JavaScript</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
          </div>
          <div class="box">
            <el-svg icon="npm" />
            <h2>NPM Plugins</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
          </div>
          <div class="box">
            <el-svg icon="infinite" />
            <h2>Infinite Scalability</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
          </div>
          <div class="box">
            <el-svg icon="vue" />
            <h2>Vue/Reactive Components</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
          </div>
          <div class="box">
            <el-svg icon="fast-clock" />
            <h2>Faster Development</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
          </div>
        </div>
        <div class="actions">
          <el-link path="/how-it-works">
            See how it works
            <i class="fa fa-arrow-right" />
          </el-link>
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
      title: "The New Standard in CMS",
      description: "Factor helps developers build sites faster with vue.js.",
      image: ""
    }
  }
}
</script>
<style lang="less">
.home {
  .mast {
    padding: 0 2em;
    line-height: 1.2;
    max-width: 1200px;
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
      background: linear-gradient(90deg, #fff, #fafbff, #fafbff, #fafbff, #fff);
      @media (max-width: 767px) {
        background: #fafbff;
      }
    }
    .mast {
      position: relative;
    }
  }

  .splash-wrap {
    background: rgb(255, 255, 255);
  }
  .splash {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 60px;
    padding: 7em 2em;
    @media (max-width: 767px) {
      grid-template-columns: 1fr;
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
    .actions {
      margin-top: 1.5em;
      @media (max-width: 767px) {
        margin-bottom: 1.5em;
      }
    }
    .splash-image {
      min-height: 220px;
      max-width: 350px;
      transform: scale(1.2) translateX(50px) translateY(0) perspective(3190px)
        rotateY(-29deg) rotateX(4deg) rotate(1deg);
      border-radius: 6px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      padding: 10px;
      background: #fff;
      // box-shadow: 1px 1px 5px 0 rgba(26, 26, 67, 0.05),
      //   39px 62.5px 125px -25px rgba(50, 50, 93, 0.5),
      //   23.4px 37.5px 75px -37.5px rgba(0, 0, 0, 0.6);
      box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.25),
        0 18px 36px -18px rgba(0, 0, 0, 0.3),
        23.4px 37.5px 75px -37.5px rgba(0, 0, 0, 0.4);
      @media (max-width: 767px) {
        max-width: inherit;
        margin-top: 3em;
        transform: scale(1) translateX(0) translateY(0) perspective(0)
          rotateY(0deg) rotateX(0deg) rotate(0deg);
        box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.25),
          0 18px 36px -18px rgba(0, 0, 0, 0.3);
      }
    }
  }
  .boxes-wrap {
    padding: 4em 0;
    margin: 3em 0;
    .title {
      font-weight: 600;
      font-size: 2.4em;
      letter-spacing: -0.03em;
      line-height: 1;
      margin-bottom: 0.2em;
      text-align: center;
    }
    .subtitle {
      opacity: 0.5;
      font-size: 1.4em;
      font-weight: 500;
      text-align: center;
      @media (max-width: 767px) {
        font-size: 1.2em;
      }
    }
    .actions {
      display: flex;
      justify-content: center;
      a {
        font-size: 1.2em;
      }
    }
  }
  .boxes {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 60px;
    @media (max-width: 767px) {
      display: block;
    }
    .box {
      margin: 2em 0;
      @media (max-width: 767px) {
        margin: 1em 0;
      }
      .svg-wrap {
        display: inline-block;
        width: 50px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        border-radius: 14px;
        background: #fff;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11),
          0 1px 3px rgba(0, 0, 0, 0.08);
        svg {
          padding: 2px;
          min-height: 50px;
        }
      }
      h2 {
        margin: 0.5em 0;
        font-weight: 600;
      }
      p {
        font-size: 1.2em;
        line-height: 1.4em;
        font-weight: 500;
        margin-top: 0.5em;
        opacity: 0.6;
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
