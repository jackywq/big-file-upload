const multiparty = require("multiparty");
const path = require("path");
const fse = require("fs-extra");

// 大文件存储目录
const UPLOAD_DIR = path.resolve(__dirname, "..", "target");
// 文件名映射文件路径
const FILENAME_MAP_PATH = path.resolve(UPLOAD_DIR, "filename_map.json");

// 读取文件名映射
const readFilenameMap = async () => {
  try {
    if (await fse.pathExists(FILENAME_MAP_PATH)) {
      const data = await fse.readFile(FILENAME_MAP_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("读取文件名映射失败:", error);
  }
  return {};
};

// 保存文件名映射
const saveFilenameMap = async map => {
  try {
    // 确保目录存在
    await fse.ensureDir(UPLOAD_DIR);
    await fse.writeFile(FILENAME_MAP_PATH, JSON.stringify(map, null, 2));
  } catch (error) {
    console.error("保存文件名映射失败:", error);
  }
};

// 提取后缀名
const extractExt = filename =>
  filename.slice(filename.lastIndexOf("."), filename.length);

// 写入文件流
const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on("end", () => {
      fse.unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });

// 提取 body
const resolvePost = req =>
  new Promise(resolve => {
    let chunk = "";
    req.on("data", data => {
      chunk += data;
    });
    req.on("end", () => {
      resolve(JSON.parse(chunk));
    });
  });

// 创建临时文件夹用于临时存储 chunk
// 添加 chunkDir 前缀与文件名做区分
const getChunkDir = fileHash =>
  path.resolve(UPLOAD_DIR, `chunkDir_${fileHash}`);

// 返回已上传的所有切片名
const createUploadedList = async fileHash =>
  fse.existsSync(getChunkDir(fileHash))
    ? await fse.readdir(getChunkDir(fileHash))
    : [];

// 合并切片
const mergeFileChunk = async (filePath, fileHash, size) => {
  const chunkDir = getChunkDir(fileHash);
  const chunkPaths = await fse.readdir(chunkDir);
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序会错乱
  chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);

  // 并发写入文件
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 根据 size 在指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * size
        })
      )
    )
  );
  // 合并后删除保存切片的目录
  fse.rmdirSync(chunkDir);
};

module.exports = class {
  // 获取历史上传文件列表
  async getUploadedFiles(req, res) {
    try {
      // 确保上传目录存在
      if (!fse.existsSync(UPLOAD_DIR)) {
        res.end(
          JSON.stringify({
            code: 0,
            data: []
          })
        );
        return;
      }

      // 读取文件名映射
      const filenameMap = await readFilenameMap();

      // 读取上传目录中的所有文件
      const files = await fse.readdir(UPLOAD_DIR);

      // 过滤掉切片目录和映射文件，只保留合并后的文件
      const uploadedFiles = files
        .filter(
          file => !file.startsWith("chunkDir_") && file !== "filename_map.json"
        )
        .map(file => {
          const filePath = path.resolve(UPLOAD_DIR, file);
          const stats = fse.statSync(filePath);
          return {
            filename: filenameMap[file] || file,
            hashedFilename: file,
            size: stats.size,
            uploadTime: stats.mtime,
            filePath: filePath
          };
        });

      res.end(
        JSON.stringify({
          code: 0,
          data: uploadedFiles
        })
      );
    } catch (error) {
      console.error("获取历史文件列表失败:", error);
      res.end(
        JSON.stringify({
          code: -1,
          message: "获取文件列表失败",
          data: []
        })
      );
    }
  }

  // 合并切片
  async handleMerge(req, res) {
    const data = await resolvePost(req);
    const { fileHash, filename, size } = data;
    const ext = extractExt(filename);
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
    await mergeFileChunk(filePath, fileHash, size);

    // 保存文件名映射
    const filenameMap = await readFilenameMap();
    filenameMap[`${fileHash}${ext}`] = filename;
    await saveFilenameMap(filenameMap);

    res.end(
      JSON.stringify({
        code: 0,
        message: "file merged success"
      })
    );
  }

  // 删除所有文件
  async deleteFiles(req, res) {
    await fse.remove(path.resolve(UPLOAD_DIR));
    res.end(
      JSON.stringify({
        code: 0,
        message: "file delete success"
      })
    );
  }

  // 处理切片
  async handleFormData(req, res) {
    const multipart = new multiparty.Form();

    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status = 500;
        res.end("process file chunk failed");
        return;
      }
      const [chunk] = files.chunk;
      const [hash] = fields.hash;
      const [fileHash] = fields.fileHash;
      const [filename] = fields.filename;
      const filePath = path.resolve(
        UPLOAD_DIR,
        `${fileHash}${extractExt(filename)}`
      );
      const chunkDir = getChunkDir(fileHash);
      const chunkPath = path.resolve(chunkDir, hash);

      // 文件存在直接返回
      if (fse.existsSync(filePath)) {
        res.end("file exist");
        return;
      }

      // 切片存在直接返回
      if (fse.existsSync(chunkPath)) {
        res.end("chunk exist");
        return;
      }

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir);
      }

      // fs-extra 的 rename 方法 windows 平台会有权限问题
      // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
      await fse.move(chunk.path, path.resolve(chunkDir, hash));
      res.end("received file chunk");
    });
  }

  // 验证是否已上传/已上传切片下标
  async handleVerifyUpload(req, res) {
    const data = await resolvePost(req);
    const { fileHash, filename } = data;
    const ext = extractExt(filename);
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`);
    if (fse.existsSync(filePath)) {
      res.end(
        JSON.stringify({
          shouldUpload: false
        })
      );
    } else {
      res.end(
        JSON.stringify({
          shouldUpload: true,
          uploadedList: await createUploadedList(fileHash)
        })
      );
    }
  }
};
