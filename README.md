# 精英群聊系统 | Elite Chat

一个集成 DeepSeek 大模型的 4 人精英群聊系统，让纳瓦尔、乔布斯、芒格、马斯克为你分析问题、给出建议。

## 功能特性

- 🎨 **极简科技风界面** - 深色主题 + 科技网格 + 渐变边框
- 🤖 **DeepSeek 大模型驱动** - 真正理解你的问题
- 👥 **4 位精英角色** - 各自保持独立人设和价值观
- 💬 **智能群聊** - 角色间可以互相接话、辩论
- ⚡ **流畅体验** - 打字动画 + 消息滑入效果

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 密钥

复制 `.env.example` 为 `.env`，并填入你的 DeepSeek API 密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
```

> 获取 API 密钥：访问 [DeepSeek 官网](https://platform.deepseek.com/) 注册并获取

### 3. 启动服务器

```bash
npm start
```

### 4. 打开浏览器

访问 http://localhost:3000

## 项目结构

```
elite-chat/
├── server.js          # Express 后端服务器
├── deepseek.js        # DeepSeek API 调用模块
├── characters.js      # 4 位角色的系统提示词
├── package.json       # 项目配置
├── .env               # 环境变量（API密钥）
├── .env.example       # 环境变量示例
└── public/
    └── index.html     # 前端界面
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat/:characterId` | POST | 获取单个角色回复 |
| `/api/chat/stream/:characterId` | POST | 流式获取角色回复（带上下文） |
| `/api/chat/all` | POST | 获取所有角色回复 |
| `/api/characters` | GET | 获取角色列表 |
| `/api/health` | GET | 健康检查 |

## 4 位精英角色

### 纳瓦尔 (Naval Ravikant)
- **身份**：硅谷天使投资人、《纳瓦尔宝典》作者
- **思维**：杠杆、复利、自由、专长
- **风格**：冷静、通透、短句哲学

### 乔布斯 (Steve Jobs)
- **身份**：苹果创始人、产品狂人
- **思维**：极简、创新、用户体验
- **风格**：强势、犀利、有感染力

### 查理·芒格 (Charlie Munger)
- **身份**：巴菲特合伙人、价值投资大师
- **思维**：逆向思维、多元模型、避免愚蠢
- **风格**：睿智、沉稳、逻辑严谨

### 马斯克 (Elon Musk)
- **身份**：特斯拉/SpaceX 创始人
- **思维**：第一性原理、激进、长期主义
- **风格**：直接、狂妄、热血

## 技术栈

- **前端**：HTML + Tailwind CSS + Vanilla JS
- **后端**：Node.js + Express
- **AI**：DeepSeek API

## 许可证

MIT
