<template>
  <div class="upload-card">
    <div
      class="upload-area"
      :class="{ dragover: isDragover }"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-icon">
        <SvgIcon name="upload-area" :stroke-width="'1.5'" />
      </div>
      <div class="upload-text">
        <div class="upload-title" v-if="!file">拖拽文件到此处或点击选择</div>
        <div class="upload-title" v-else>{{ file.name }}</div>
        <div class="upload-desc" v-if="!file">支持大文件上传，自动切片处理</div>
        <div class="upload-desc" v-else>
          {{ formatFileSize(file.size) }}
        </div>
      </div>
      <input
        type="file"
        class="file-input"
        :disabled="status !== Status.wait"
        @change="onFileChange"
        ref="fileInput"
      />
    </div>

    <div class="action-buttons">
      <div class="btn-group">
        <button
          class="btn btn-primary"
          @click="onUpload"
          :disabled="uploadDisabled"
          :class="{ 'btn-disabled': uploadDisabled }"
        >
          <SvgIcon name="upload-main" />
          <span>开始上传</span>
        </button>
        <button
          class="btn btn-secondary"
          v-if="status === Status.pause"
          @click="onResume"
        >
          <SvgIcon name="play" />
          <span>继续</span>
        </button>
        <button
          class="btn btn-warning"
          v-else
          :disabled="status !== Status.uploading || !fileHash"
          @click="onPause"
          :class="{
            'btn-disabled': status !== Status.uploading || !fileHash
          }"
        >
          <SvgIcon name="pause" />
          <span>暂停</span>
        </button>
      </div>
      <button
        class="btn btn-danger"
        @click="onDelete"
        :disabled="deleteDisabled"
        :class="{ 'btn-disabled': deleteDisabled }"
      >
        <SvgIcon name="delete" />
        <span>删除</span>
      </button>
    </div>
  </div>
</template>

<script>
import SvgIcon from "./SvgIcon.vue";

const Status = {
  wait: "wait",
  pause: "pause",
  uploading: "uploading"
};

export default {
  name: "UploadCard",
  components: {
    SvgIcon
  },
  props: {
    file: {
      type: File,
      default: null
    },
    status: {
      type: String,
      default: Status.wait
    },
    fileHash: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      Status,
      isDragover: false
    };
  },
  computed: {
    uploadDisabled() {
      return (
        !this.file || [Status.pause, Status.uploading].includes(this.status)
      );
    },
    deleteDisabled() {
      return this.status === Status.uploading;
    }
  },
  methods: {
    formatFileSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },
    handleDrop(e) {
      this.isDragover = false;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.$emit("file-change", { target: { files } });
      }
    },
    onFileChange(e) {
      this.$emit("file-change", e);
    },
    onUpload() {
      this.$emit("upload");
    },
    onPause() {
      this.$emit("pause");
    },
    onResume() {
      this.$emit("resume");
    },
    onDelete() {
      this.$emit("delete");
    }
  }
};
</script>

<style lang="scss" scoped>
.upload-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out 0.1s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.upload-area {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 50px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-area::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-area:hover::before,
.upload-area.dragover::before {
  opacity: 1;
}

.upload-area:hover,
.upload-area.dragover {
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(102, 126, 234, 0.05);
  transform: translateY(-2px);
}

.upload-area.dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.upload-icon {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.6);
  }
}

.upload-text {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.upload-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.btn-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
}

.btn-primary:active:not(.btn-disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.4);
}

.btn-warning:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(245, 87, 108, 0.5);
}

.btn-danger {
  background: rgba(255, 255, 255, 0.08);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.btn-danger:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .btn-group {
    width: 100%;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }

  .btn-danger {
    width: 100%;
  }
}
</style>
