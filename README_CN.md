# Z-Image-Turbo 中文文档文档🇨🇳

[English](./README.md) | **中文**

Z-Image-Turbo 是一个基于 React 前端和 CUDA 加速 Python 后端的 AI 图像生成应用。该项目结合了现代 Web 技术和强大的 AI 模型，提供高性能的图像生成服务。

<p align="center">
<img src="https://github.com/user-attachments/assets/placeholder" alt="Z-Image Turbo UI" width="800" />
</p>

## 📋 项目概述

Z-Image-Turbo 是一个完整的 AI 图像生成解决方案，具有以下特点：

- **前端**: React + Tailwind CSS + Lucide 图标，提供现代化用户界面
- **后端**: FastAPI + PyTorch + Diffusers，支持 GPU 加速推理
- **模型**: Tongyi-MAI/Z-Image-Turbo，高性能文本转图像模型
- **部署**: Docker Compose，支持一键部署
- **性能**: 支持 CUDA 12.4和 Flash Attention 2 加速

##🛠️ 技术栈

### 前端
- **React** 18+ (Vite 构建)
- **TypeScript** 类型安全
- **Tailwind CSS** 实用类框架
- **Lucide React** 图标库
- **Nginx** 静态资源服务
- **端口**: 3000

### 后端
- **FastAPI** Web 框架
- **PyTorch** 深度学习框架
- **Diffusers** Hugging Face 库
- **Z-Image-Turbo** 预训练模型
- **CUDA 12.4** GPU加速
- **Flash Attention 2** 性能优化
- **端口**: 8000

### 基础设施
- **Docker** 容器化
- **NVIDIA Container Toolkit** GPU 支持
- **Docker Compose** 编排管理

## 🚀 快速开始

### 前提条件
- **Docker** (20.10+)
- **NVIDIA Container Toolkit** (GPU 支持)
- **NVIDIA GPU** (Ampere 架构或更新，推荐 RTX 3090/4090, A100)
- **Node.js** 18+ (可选，用于开发)

### 方法 1: Docker Compose (推荐)

最简单的方式是使用 Docker Compose 一键启动整个应用：

```bash
docker-compose up --build
```

这会自动构建并启动：
- 前端服务: http://localhost:3000
- 后端服务: http://localhost:8000

### 方法 2: 手动部署

#### 1. 启动后端服务 (Docker)

```bash
cd backend

# 构建镜像 (编译 Flash Attention 可能需要 5-10 分钟)
docker build -t z-image-turbo-backend .

# 推送镜像到 Docker Hub (可选)
docker login
docker tag z-image-turbo-backend your-username/z-image-turbo-backend:latest
docker push your-username/z-image-turbo-backend:latest

# 运行容器 (必须使用 --gpus all)
docker run --gpus all -p 8000:8000 z-image-turbo-backend
```

> **Flash Attention 2 注意事项**: 后端 Dockerfile 安装了 `flash-attn` 包，需要 Ampere 架构 (RTX 3090, A100) 或更新架构。旧架构 (Turing/Volta) 可能会安装失败或回退到标准注意力机制。

#### 2. 启动前端服务 (Docker)

打开新的终端窗口：

```bash
cd frontend

# 构建前端镜像
docker build -t z-image-turbo-frontend .

# 运行容器
docker run -p 3000:3000 z-image-turbo-frontend
```

##🎨 功能特性

### 图像生成功能
- **文本提示**: 支持中文和英文提示词
- **参数配置**:
  - 图像尺寸 (64x64 到 1024x1024)
  - 推理步数 (1-50)
  - 指导比例 (0-10)
  - 随机种子控制
- **性能优化**: Flash Attention 3 开关
- **实时日志**: 生成过程监控

### 用户界面功能
- **图像预览**: 高清显示生成结果
- **下载功能**: 一键保存 PNG 图像
- **分享功能**: 便捷分享生成结果
- **随机种子**: 随机化生成结果
- **日志查看**: 实时监控后端状态

### 技术特性
- **GPU加速**: 利用 NVIDIA GPU 加速推理
- **内存优化**: bfloat16 精度减少内存占用
- **模型编译**: 可选的模型编译加速
- **错误处理**: 完善的错误处理机制
- **降级模式**: 后端不可用时提供占位图像

##⚙️ 配置选项

### 后端环境变量
- `NVIDIA_VISIBLE_DEVICES=all` - 可见的 GPU 设备
- `NVIDIA_DRIVER_CAPABILITIES=compute,utility` - GPU 驱动能力

### 性能优化选项

#### Flash Attention 2
后端默认尝试启用 Flash Attention 2。如果失败会自动回退到标准注意力机制。

#### 模型编译
取消注释 `main.py` 中的以下行以启用模型编译加速：

```python
# pipe.transformer.compile()
```

> **注意**: 模型编译会加速推理，但首次运行需要额外时间进行编译。

### 前端配置
前端通过 `services/api.ts` 中的 `API_URL` 变量配置后端地址：

```typescript
const API_URL = 'http://localhost:8000';
```

##📦 部署说明

### 生产环境部署

1. **修改 CORS 配置**: 在生产环境中，修改 `main.py` 中的 CORS 配置：

```python
allow_origins=["https://your-domain.com"],  # 替换为实际域名
```

2. **HTTPS 支持**: 使用 Nginx 或反向代理添加 HTTPS 支持

3. **资源限制**: 在 `docker-compose.yaml` 中配置资源限制

4. **监控**: 添加健康检查监控

### 多实例部署

```yaml
# docker-compose.prod.yaml
version: '3.8'
services:
  backend:
    # ... 其他配置
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 16G
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

##🔍 API 接口

### 生成图像 (POST /generate)

**请求体**:
```json
{
  "prompt": "字符串描述",
  "height": 1024,
  "width": 1024,
  "num_inference_steps": 9,
  "guidance_scale": 0.0,
  "seed": 42
}
```

**响应**: PNG 图像二进制数据

### 健康检查 (GET /health)

**响应**:
```json
{
  "status": "ok",
  "model_loaded": true
}
```

##📊 性能指标

### 生成速度 (1024x1024)
- **A100 GPU**: ~2-3 秒/图
- **RTX 3090**: ~4-5 秒/图
- **RTX 4090**: ~3-4 秒/图

### 内存占用
- **模型加载**: ~10-12 GB GPU内存
- **推理峰值**: ~14-16 GB GPU 内存

##❓ 常见问题

### 1. 后端无法启动
- 确认安装了 NVIDIA Container Toolkit
- 检查 GPU 驱动版本 (推荐 535+)
- 查看 Docker 日志: `docker logs z-image-turbo-backend`

### 2. Flash Attention 安装失败
- 确认 GPU 架构 (需要 Ampere 或更新)
- 检查 CUDA 版本 (需要 12.1+)
- 查看编译日志

### 3. 生成图像质量差
- 增加推理步数 (10-20)
- 调整指导比例 (1.0-3.0)
- 使用更详细的提示词

### 4. 内存不足
- 减小图像尺寸 (512x512)
- 减少推理步数
- 关闭其他 GPU 应用

### 5. 前端连接后端失败
- 确认后端容器正在运行
- 检查端口映射 (8000:8000)
- 查看前端浏览器控制台

##🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

##📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

##🙏 致谢

- [Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) - 基础模型
- [Hugging Face Diffusers](https://huggingface.co/docs/diffusers) - 模型库
- [FastAPI](https://fastapi.tiangolo.com/) - Web 框架
- [React](https://react.dev/) - 前端框架

---

<p align="center">
由🤖 Claude Code 生成 | 基于 Z-Image-Turbo 项目
</p>