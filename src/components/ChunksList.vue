<template>
  <div class="chunks-section">
    <div class="chunks-header">
      <div class="chunks-title">文件切片</div>
      <div class="chunks-count">{{ chunks.length }} 个切片</div>
    </div>
    <div class="chunks-list">
      <div
        class="chunk-item"
        v-for="(item, index) in chunks"
        :key="item.hash"
      >
        <div class="chunk-info">
          <div class="chunk-index">#{{ index + 1 }}</div>
          <div class="chunk-hash" :title="item.hash">{{ item.hash }}</div>
          <div class="chunk-size">{{ formatFileSize(item.size) }}</div>
        </div>
        <div class="chunk-progress">
          <div
            class="chunk-progress-bar"
            :style="{ width: item.percentage + '%' }"
          ></div>
          <div class="chunk-progress-text">{{ item.percentage }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChunksList",
  props: {
    chunks: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatFileSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
  },
};
</script>

<style lang="scss" scoped>
.chunks-section {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out 0.3s both;
}

.chunks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chunks-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.chunks-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
}

.chunks-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.chunks-list::-webkit-scrollbar {
  width: 6px;
}

.chunks-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.chunks-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 10px;
}

.chunks-list::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.7);
}

.chunk-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.chunk-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.chunk-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.chunk-index {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  min-width: 44px;
  text-align: center;
}

.chunk-hash {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-family: "Monaco", "Menlo", monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chunk-size {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.chunk-progress {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.chunk-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.chunk-progress-text {
  position: absolute;
  right: 0;
  top: -24px;
  font-size: 12px;
  font-weight: 700;
  color: #38ef7d;
}
</style>
