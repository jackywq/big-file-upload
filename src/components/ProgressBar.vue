<template>
  <div class="progress-card">
    <div class="progress-header">
      <div class="progress-title">{{ title }}</div>
      <div class="progress-value">{{ percentage }}%</div>
    </div>
    <div class="progress-bar-container">
      <div
        class="progress-bar"
        :class="{ 'upload-progress': isUpload }"
        :style="{ width: percentage + '%' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: {
    title: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isUpload: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.progress-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-value {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.progress-bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-bar.upload-progress {
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
}
</style>
