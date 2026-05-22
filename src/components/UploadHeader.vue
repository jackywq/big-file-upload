<template>
  <div class="header">
    <div class="title">
      <SvgIcon name="upload-main" :stroke-width="'2'" class="icon" />
      <span>大文件上传</span>
    </div>
    <div class="subtitle">支持断点续传，高效安全</div>
  </div>
</template>

<script>
import SvgIcon from "./SvgIcon.vue";

export default {
  name: "UploadHeader",
  components: {
    SvgIcon
  }
};
</script>

<style lang="scss" scoped>
.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}
</style>
