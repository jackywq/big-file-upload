<template>
  <svg
    :class="['icon', iconClass]"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="strokeWidth"
    :width="width"
    :height="height"
    v-html="pathData"
  ></svg>
</template>

<script>
export default {
  name: "SvgIcon",
  props: {
    name: {
      type: String,
      required: true
    },
    viewBox: {
      type: String,
      default: "0 0 24 24"
    },
    fill: {
      type: String,
      default: "none"
    },
    stroke: {
      type: String,
      default: "currentColor"
    },
    strokeWidth: {
      type: String,
      default: "2"
    },
    width: {
      type: String,
      default: "24px"
    },
    height: {
      type: String,
      default: "24px"
    },
    iconClass: {
      type: String,
      default: ""
    }
  },
  computed: {
    pathData() {
      const icons = {
        "upload-main": `
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        `,
        "upload-area": `
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        `,
        play: `
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        `,
        pause: `
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        `,
        delete: `
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        `,
        refresh: `
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        `
      };
      return icons[this.name] || "";
    }
  }
};
</script>

<style lang="scss" scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
