FROM nvidia/cuda:12.4.1-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# -----------------------------------------------------------------------------
# 1. [优化] 替换 Apt 源为阿里云 (解决 apt-get update 慢的问题)
# -----------------------------------------------------------------------------
RUN sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    sed -i 's/security.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list

# -----------------------------------------------------------------------------
# 2. [优化] 安装系统依赖 & Python 3.11
# 注意：不再使用 curl 下载 get-pip.py，改用 apt 安装 python3-pip 更稳定
# -----------------------------------------------------------------------------
RUN apt-get update && apt-get install -y \
    software-properties-common \
    git \
    ninja-build \
    curl \
    ca-certificates \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3.11-distutils \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 设置 python3.11 为默认
RUN ln -sf /usr/bin/python3.11 /usr/bin/python && \
    ln -sf /usr/bin/python3.11 /usr/bin/python3

WORKDIR /app

# -----------------------------------------------------------------------------
# 3. [优化] 配置 Pip 全局镜像 (解决 pip install 慢的问题)
# 使用阿里云 PyPI 镜像，速度通常最快
# -----------------------------------------------------------------------------
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple/ && \
    pip config set global.trusted-host mirrors.aliyun.com


# -----------------------------------------------------------------------------
# [修复步骤] 分步安装以解决源找不到的问题
# -----------------------------------------------------------------------------

# 第一步：使用阿里云镜像安装通用依赖 (ninja, packaging)
RUN pip install --no-cache-dir packaging ninja

# 第二步：使用 PyTorch 官方源安装 Torch 全家桶 (指定 --index-url)
RUN pip install --no-cache-dir "torch==2.5.1" "torchvision==0.20.1" "torchaudio==2.5.1" --index-url https://download.pytorch.org/whl/cu124

# 第三步：安装 Flash Attention (它依赖上面的 ninja 和 torch)
# 此时应该能直接下载预编译包，速度很快
RUN pip install --no-cache-dir "flash-attn>=2.6.3" --no-build-isolation


# [新增/修改] 核心修复步骤：
# 1. 升级 pip, setuptools, wheel 到最新版，解决 "install_layout" 兼容性报错
# 2. --no-cache-dir 保持开启以节省空间
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# [Source: 6] 优化 Diffusers 安装：增加 --no-cache-dir
RUN pip install --no-cache-dir git+https://gh.llkk.cc/https://github.com/huggingface/diffusers.git

# [Source: 7] 优化 requirements.txt 安装：增加 --no-cache-dir
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
