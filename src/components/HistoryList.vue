<template>
  <div class="history-section">
    <div class="history-header">
      <div class="history-title">历史文件</div>
      <div class="history-actions">
        <div class="history-count">{{ files.length }} 个文件</div>
        <button class="btn-refresh" @click="fetchFiles">
          <svg-icon name="refresh" />
          刷新
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <div v-else-if="files.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <div class="empty-text">暂无历史文件</div>
    </div>

    <div v-else class="history-list">
      <div
        class="history-item"
        v-for="(file, index) in files"
        :key="(file.hashedFilename || file.filename) + index"
      >
        <div class="file-icon">
          {{ getFileIcon(file.filename) }}
        </div>
        <div class="file-info">
          <div class="file-name" :title="file.filename">
            {{ file.filename }}
          </div>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-time">{{ formatTime(file.uploadTime) }}</span>
          </div>
          <div
            v-if="file.hashedFilename && file.hashedFilename !== file.filename"
            class="file-hash"
            :title="file.hashedFilename"
          >
            {{ file.hashedFilename }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from "./SvgIcon.vue";

export default {
  name: "HistoryList",
  components: {
    SvgIcon
  },
  data() {
    return {
      files: [],
      loading: false
    };
  },
  mounted() {
    this.fetchFiles();
  },
  methods: {
    async fetchFiles() {
      this.loading = true;
      try {
        const response = await fetch("http://localhost:3000/files");
        const result = await response.json();
        if (result.code === 0) {
          this.files = result.data || [];
        }
      } catch (error) {
        console.error("获取历史文件失败:", error);
      } finally {
        this.loading = false;
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    formatTime(timeStr) {
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;

      // 小于1分钟
      if (diff < 60000) return "刚刚";
      // 小于1小时
      if (diff < 3600000) return Math.floor(diff / 60000) + " 分钟前";
      // 小于1天
      if (diff < 86400000) return Math.floor(diff / 3600000) + " 小时前";
      // 小于7天
      if (diff < 604800000) return Math.floor(diff / 86400000) + " 天前";

      // 格式化日期
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },
    getFileIcon(filename) {
      const ext = filename
        .split(".")
        .pop()
        .toLowerCase();
      const iconMap = {
        // 视频
        mp4: "🎬",
        mkv: "🎬",
        avi: "🎬",
        mov: "🎬",
        wmv: "🎬",
        // 图片
        jpg: "🖼️",
        jpeg: "🖼️",
        png: "🖼️",
        gif: "🖼️",
        webp: "🖼️",
        svg: "🖼️",
        bmp: "🖼️",
        // 音频
        mp3: "🎵",
        wav: "🎵",
        flac: "🎵",
        aac: "🎵",
        // 文档
        pdf: "📄",
        doc: "📝",
        docx: "📝",
        xls: "📊",
        xlsx: "📊",
        ppt: "📽️",
        pptx: "📽️",
        txt: "📃",
        // 压缩包
        zip: "📦",
        rar: "📦",
        "7z": "📦",
        tar: "📦",
        gz: "📦",
        // 代码
        js: "💻",
        ts: "💻",
        vue: "💻",
        html: "💻",
        css: "💻",
        json: "💻",
        py: "💻",
        java: "💻",
        go: "💻",
        rs: "💻"
      };
      return iconMap[ext] || "📄";
    }
  }
};
</script>

<style lang="scss" scoped>
.history-section {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  margin-top: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out 0.4s both;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 15px;
}

.history-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.7);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 10px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.7);
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
  border-color: rgba(102, 126, 234, 0.3);
}

.file-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.file-size {
  font-weight: 500;
}

.file-time {
  opacity: 0.8;
}

.file-hash {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-family: "Monaco", "Menlo", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
