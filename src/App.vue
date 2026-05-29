<template>
  <div id="app">
    <div class="container">
      <!-- 上传头部组件 -->
      <UploadHeader />

      <!-- 上传卡片组件：处理文件选择、上传、暂停、继续、删除 -->
      <UploadCard
        :file="container.file"
        :status="status"
        :file-hash="container.hash"
        @file-change="handleFileChange"
        @upload="handleUpload"
        @pause="handlePause"
        @resume="handleResume"
        @delete="handleDelete"
      />

      <!-- 进度条区域：只有在非等待状态或哈希计算进行中时显示 -->
      <div
        class="progress-section"
        v-if="status !== Status.wait || hashPercentage > 0"
      >
        <!-- 哈希计算进度条 -->
        <ProgressBar title="哈希计算" :percentage="hashPercentage" />
        <!-- 文件上传进度条 -->
        <ProgressBar
          title="上传进度"
          :percentage="fakeUploadPercentage"
          :is-upload="true"
        />
      </div>

      <!-- 切片列表：只有在有切片数据时显示 -->
      <ChunksList v-if="data.length > 0" :chunks="data" />
    </div>
  </div>
</template>

<script>
// 导入所需组件
import UploadHeader from "./components/UploadHeader.vue";
import UploadCard from "./components/UploadCard.vue";
import ProgressBar from "./components/ProgressBar.vue";
import ChunksList from "./components/ChunksList.vue";

// 切片大小：10MB
const SIZE = 10 * 1024 * 1024;

// 上传状态枚举
const Status = {
  wait: "wait", // 等待上传
  pause: "pause", // 暂停上传
  uploading: "uploading" // 正在上传
};

export default {
  name: "app",
  components: {
    UploadHeader,
    UploadCard,
    ProgressBar,
    ChunksList
  },
  filters: {
    // 字节转换过滤器：将字节转换为KB
    transformByte(val) {
      return Number((val / 1024).toFixed(0));
    }
  },
  data: () => ({
    Status,
    // 容器对象：存储文件、哈希和worker
    container: {
      file: null, // 选中的文件
      hash: "", // 文件哈希值
      worker: null // 计算哈希的web worker
    },
    hashPercentage: 0, // 哈希计算进度
    data: [], // 切片数据数组
    requestList: [], // 请求列表（用于取消上传）
    status: Status.wait, // 当前上传状态
    fakeUploadPercentage: 0 // 上传进度（用于平滑显示）
  }),
  computed: {
    // 上传按钮是否禁用
    uploadDisabled() {
      return (
        !this.container.file ||
        [Status.pause, Status.uploading].includes(this.status)
      );
    },
    // 计算实际上传进度
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0;
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
      return parseInt((loaded / this.container.file.size).toFixed(2));
    }
  },
  watch: {
    // 监听上传进度变化，更新 fakeUploadPercentage 实现平滑过渡
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now;
      }
    }
  },
  methods: {
    /**
     * 处理删除操作
     * 删除服务端文件并清空所有状态
     */
    async handleDelete() {
      const { data } = await this.request({
        url: "http://localhost:3000/delete"
      });
      if (JSON.parse(data).code === 0) {
        this.$message.success("delete success");
      }
      // 重置数据
      this.resetData();
      this.container.file = null;
      this.container.hash = "";
      this.data = [];
      this.hashPercentage = 0;
      this.fakeUploadPercentage = 0;
      this.status = Status.wait;
    },
    /**
     * 处理暂停操作
     * 将状态设为暂停并重置数据
     */
    handlePause() {
      this.status = Status.pause;
      this.resetData();
    },
    /**
     * 重置数据
     * 中止所有请求，清空请求列表，清除worker监听
     */
    resetData() {
      this.requestList.forEach(xhr => xhr?.abort());
      this.requestList = [];
      if (this.container.worker) {
        this.container.worker.onmessage = null;
      }
    },
    /**
     * 处理继续上传操作
     * 从上次暂停的位置继续上传
     */
    async handleResume() {
      this.status = Status.uploading;
      const { uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      );
      await this.uploadChunks(uploadedList);
    },
    /**
     * 封装XMLHttpRequest请求
     * @param {Object} options - 请求选项
     * @param {string} options.url - 请求URL
     * @param {string} [options.method='post'] - 请求方法
     * @param {*} options.data - 请求数据
     * @param {Object} [options.headers={}] - 请求头
     * @param {Function} [options.onProgress=e=>e] - 上传进度回调
     * @param {Array} options.requestList - 请求列表（用于管理请求）
     * @returns {Promise} 请求Promise
     */
    request({
      url,
      method = "post",
      data,
      headers = {},
      onProgress = e => e,
      requestList
    }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onProgress;
        xhr.open(method, url);
        // 设置请求头
        Object.keys(headers).forEach(key =>
          xhr.setRequestHeader(key, headers[key])
        );
        xhr.send(data);
        xhr.onload = e => {
          // 将请求成功的 xhr 从列表中删除
          if (requestList) {
            const xhrIndex = requestList.findIndex(item => item === xhr);
            requestList.splice(xhrIndex, 1);
          }
          resolve({
            data: e.target.response
          });
        };
        // 暴露当前 xhr 给外部，便于后续管理
        requestList?.push(xhr);
      });
    },
    /**
     * 生成文件切片
     * @param {File} file - 原始文件
     * @param {number} [size=SIZE] - 切片大小，默认10MB
     * @returns {Array} 切片数组
     */
    createFileChunk(file, size = SIZE) {
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
      }
      return fileChunkList;
    },
    /**
     * 使用web worker计算文件hash
     * @param {Array} fileChunkList - 文件切片数组
     * @returns {Promise<string>} 文件哈希值
     */
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        this.container.worker = new Worker("/hash.js");
        this.container.worker.postMessage({ fileChunkList });
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data;
          this.hashPercentage = percentage;
          if (hash) {
            resolve(hash);
          }
        };
      });
    },
    /**
     * 处理文件选择变化
     * @param {Event} e - 文件选择事件
     */
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      // 重置之前的数据
      this.resetData();
      Object.assign(this.$data, this.$options.data());
      // 设置新文件
      this.container.file = file;
    },
    /**
     * 处理上传操作
     * 完整的上传流程：计算hash -> 验证文件 -> 上传切片 -> 合并文件
     */
    async handleUpload() {
      if (!this.container.file) return;
      this.status = Status.uploading;
      // 生成文件切片
      const fileChunkList = this.createFileChunk(this.container.file);
      // 计算文件hash
      this.container.hash = await this.calculateHash(fileChunkList);

      // 验证文件是否已经上传过
      const { shouldUpload, uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      );
      // 如果文件已完整上传，提示用户
      if (!shouldUpload) {
        this.$message.success("文件已上传，无需重复上传，请检查 /target 目录");
        this.status = Status.wait;
        return;
      }

      // 初始化切片数据
      this.data = fileChunkList.map(({ file }, index) => ({
        fileHash: this.container.hash,
        index,
        hash: this.container.hash + "-" + index,
        chunk: file,
        size: file.size,
        percentage: uploadedList.includes(index) ? 100 : 0
      }));

      // 上传切片
      await this.uploadChunks(uploadedList);
    },
    /**
     * 上传文件切片，同时过滤掉已上传的切片
     * @param {Array} [uploadedList=[]] - 已上传的切片列表
     */
    async uploadChunks(uploadedList = []) {
      const requestList = this.data
        // 过滤已上传的切片
        .filter(({ hash }) => !uploadedList.includes(hash))
        // 构建每个切片的FormData
        .map(({ chunk, hash, index }) => {
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("hash", hash);
          formData.append("filename", this.container.file.name);
          formData.append("fileHash", this.container.hash);
          return { formData, index };
        })
        // 发送上传请求
        .map(({ formData, index }) =>
          this.request({
            url: "http://localhost:3000",
            data: formData,
            onProgress: this.createProgressHandler(this.data[index]),
            requestList: this.requestList
          })
        );
      // 等待所有切片上传完成
      await Promise.all(requestList);
      // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时合并切片
      if (uploadedList.length + requestList.length === this.data.length) {
        await this.mergeRequest();
      }
    },
    /**
     * 通知服务端合并切片
     */
    async mergeRequest() {
      await this.request({
        url: "http://localhost:3000/merge",
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          size: SIZE,
          fileHash: this.container.hash,
          filename: this.container.file.name
        })
      });
      this.$message.success("upload success, check /target directory");
      this.status = Status.wait;
    },
    /**
     * 根据hash验证文件是否曾经已经被上传过
     * @param {string} filename - 文件名
     * @param {string} fileHash - 文件哈希值
     * @returns {Promise<Object>} 验证结果，包含是否需要上传和已上传切片列表
     */
    async verifyUpload(filename, fileHash) {
      const { data } = await this.request({
        url: "http://localhost:3000/verify",
        headers: {
          "content-type": "application/json"
        },
        data: JSON.stringify({
          filename,
          fileHash
        })
      });
      return JSON.parse(data);
    },
    /**
     * 用闭包保存每个切片的进度数据
     * @param {Object} item - 切片数据项
     * @returns {Function} 进度处理函数
     */
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100));
      };
    }
  }
};
</script>

<style lang="scss">
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 页面主体样式 */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  min-height: 100vh;
  overflow-x: hidden;
}

/* 应用容器样式 */
#app {
  min-height: 100vh;
  padding: 40px 20px;
}

/* 主容器样式 */
.container {
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
}
</style>
