# file-upload (大文件上传)

## 项目描述
本项目是一个大文件上传系统，采用 Vue.js 作为前端，Node.js 作为后端。它支持文件分块、并行上传和可恢复上传等功能，旨在高效处理大文件。

## 功能特性
- **大文件上传**：通过将大文件拆分为块来高效上传。
- **可恢复上传**：支持从中断处恢复上传。
- **文件校验**：检查现有文件或文件块，以防止重复上传。
- **文件合并**：在服务器上合并已上传的文件块，以重建原始文件。
- **前端**：使用 Vue.js 和 ElementUI 构建，提供响应式的用户界面。
- **后端**：Node.js 服务器，提供上传、校验、合并和删除等 API 接口。

## 项目结构
```
.
├── public/                  # 静态资源和 HTML 模板
│   ├── favicon.ico
│   ├── hash.js              # 客户端哈希逻辑 (SparkMD5)
│   ├── index.html           # 主 HTML 文件
│   └── spark-md5.min.js     # 用于文件哈希的 SparkMD5 库
├── server/                  # Node.js 后端服务器
│   ├── controller.js        # 处理文件操作的业务逻辑
│   └── index.js             # 服务器入口文件，定义 API 路由
├── src/                     # Vue.js 前端源代码
│   ├── App.vue              # 主 Vue 组件
│   └── main.js              # Vue 应用入口文件，初始化 Vue 和 ElementUI
├── .browserslistrc          # Browserslist 配置
├── .eslintignore            # ESLint 忽略配置
├── .eslintrc.js             # ESLint 配置
├── .gitattributes           # Git 属性配置
├── .gitignore               # Git 忽略规则
├── .npmrc                   # npm 配置
├── .prettierignore          # Prettier 忽略配置
├── LICENSE                  # 项目许可证
├── README.md                # 本 README 文件
├── babel.config.js          # Babel 配置
├── package-lock.json        # npm 包锁定文件
├── package.json             # 项目元数据和依赖项
└── vue.config.js            # Vue CLI 配置
```

## 使用技术
**前端:**
- [Vue.js](https://vuejs.org/)
- [ElementUI](https://element.eleme.io/)
- [SparkMD5](https://github.com/satazor/js-spark-md5) (用于客户端文件哈希)

**后端:**
- [Node.js](https://nodejs.org/)
- [http](https://nodejs.org/api/http.html) (Node.js 内置 HTTP 模块)
- [multiparty](https://github.com/pillarjs/multiparty) (用于解析 multipart/form-data)
- [fs-extra](https://github.com/jprichardson/node-fs-extra) (用于扩展文件系统操作)
- [nodemon](https://nodemon.io/) (用于开发过程中自动重启服务器)

## 安装

1.  **克隆仓库：**
    ```bash
    git clone https://github.com/yeyan1996/file-upload.git
    cd file-upload
    ```

2.  **安装依赖：**
    ```bash
    npm install
    ```

## 使用方法

要启动前端开发服务器和 Node.js 后端服务器：

```bash
npm start
```

前端通常运行在 `http://localhost:8080`（如果 8080 端口被占用，则使用其他端口），后端 API 服务器将运行在 `http://localhost:3000`。

打开浏览器并导航到前端 URL 以使用应用程序。

## API 接口 (后端)

-   `POST /`: 处理文件块上传。
-   `POST /verify`: 验证文件是否存在和已上传的块。
-   `POST /merge`: 将所有上传的文件块合并为完整文件。
-   `POST /delete`: 删除已上传的文件和文件块。
