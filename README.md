# 天空画廊（Sky Gallery）

一个基于 Next.js 16 的互动画廊应用：创作、分享与浏览用户作品，支持国际化、排行榜、搜索、点赞与管理员管理。数据采用本地 JSON 存储，适合演示与轻量场景。

**在线预览**：开发模式默认地址 `http://localhost:3000/`

## 主要功能

- 绘画创作与上传：在画布上绘制后提交作品。
- 漂浮作品云：作品以漂浮动画展示，并带有 0.5x–2x 的大小脉冲效果。
- 排行榜：按点赞数排序展示热门作品。
- 搜索：按标题或 ID 搜索作品。
- 点赞：每日限额点赞，支持取消点赞。
- 国际化：支持 `zh-CN`、`zh-TW`、`en`、`fr` 四种语言，带语言切换。
- 访问统计：记录每日访问用户数（管理员页可查看）。
- 管理员页：查看每日访问与每日新增作品数；编辑作品信息、修改点赞、删除作品、登录与登出。

## 快速开始

### 环境要求
- Node.js 18+（建议使用最新 LTS）

### 安装与本地运行
- 安装依赖：
  ```bash
  npm i
  # 或 pnpm i / yarn / bun
  ```
- 启动开发服务器：
  ```bash
  npm run dev
  ```
- 打开浏览器访问 `http://localhost:3000/`

### 构建与生产运行
- 构建：
  ```bash
  npm run build
  ```
- 启动生产服务：
  ```bash
  npm start
  ```

## 目录结构概览

- `src/app/`：Next.js App Router 页面与 API 路由
  - `page.tsx`：首页（含作品云与语言切换）
  - `leaderboard/`：排行榜页面
  - `search/`：搜索页面
  - `admin/`：管理员页面
  - `api/`：后端接口（见下文“API 一览”）
- `src/components/`：UI 组件（`ArtworkCloud`、`NavBar`、`CanvasDraw`、`TrackVisits` 等）
- `src/lib/`：通用库（`storage`、`types`、`i18n`、`cookies` 等）
- `data/`：本地 JSON 数据文件（`artworks.json`、`likes.json`、`users.json`、`visits.json`）

## 配置与环境变量

- 管理员登录：需在 `.env.local` 配置以下变量，用于账号密码验证：
  ```env
  ADMIN_USERNAME=your_admin_username
  ADMIN_PASSWORD=your_admin_password
  ```
  登录成功后会在 Cookie 中写入 `adminAuth=1`，以访问管理员相关接口与页面。
- 其他：`src/lib/config.ts` 中支持 `ADMIN_USER_IDS` 或 `ADMIN_USER_ID`（当前管理员接口主要基于上面的账密验证）。

### 持久化存储（生产可选）

本项目在生产环境支持持久化存储，优先使用 Vercel KV，其次使用 Vercel Blob，若均未配置则自动回退到本地 JSON 文件（`/data/*.json`）。

- 推荐使用 Vercel KV（读写）：
  ```env
  # Vercel KV 服务端调用所需变量（REST 方式）
  KV_REST_API_URL=your_kv_rest_api_url
  KV_REST_API_TOKEN=your_kv_rest_api_token
  ```
- 或使用 Vercel Blob（读写）：
  ```env
  # Vercel Blob 读写令牌（Serverless 函数中使用）
  BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
  ```

使用策略：
- 若配置了 KV（`KV_REST_API_URL`/`KV_URL` 等），则读写通过 KV；
- 否则若配置了 Blob（`BLOB_READ_WRITE_TOKEN` 等），则读写通过 Blob；
- 否则回退到本地 JSON 文件（开发/演示场景）。

环境变量的读取逻辑位于 `src/lib/storage.ts`，无需额外改动代码即可在不同环境间切换。

## 部署到 Vercel（推荐）

1. 在 Vercel 新建项目并导入此仓库。
2. 在项目的 Settings → Environment Variables 中设置：
   - 管理员登录：`ADMIN_USERNAME`、`ADMIN_PASSWORD`。
   - 持久化（二选一或均配置）：
     - KV：`KV_REST_API_URL`、`KV_REST_API_TOKEN`。
     - Blob：`BLOB_READ_WRITE_TOKEN`。
3. 直接部署。无需额外构建命令，Vercel 将自动执行 `build` 并产出 API 路由与页面。
4. 部署完成后即可使用持久化存储（若配置），未配置则按本地 JSON 逻辑运行（适合演示）。

## 数据模型（简化）

- `Artwork`：`{ id, userId, title?, dataUrl, createdAt, likesCount }`
- `User`：`{ id, name?, createdAt }`
- `Like`：`{ id, userId, artworkId, createdAt, date }`
- `Visit`：`{ id, userId, date }`

## API 一览（主要）

- 作品：
  - `POST /api/artworks/create` 提交新作品
  - `GET /api/artworks/random` 随机返回部分作品
  - `GET /api/artworks/search` 搜索作品
- 点赞：
  - `POST /api/like/toggle` 点赞或取消点赞
- 排行榜：
  - `GET /api/leaderboard` 获取排行榜数据
- 访问与用户：
  - `POST /api/track` 记录访问（由前端组件调用）
  - `GET /api/user` 获取当前用户信息（基于 Cookie `userId`）
- 管理员：
  - `POST /api/admin/login` 管理员登录（使用 `ADMIN_USERNAME`/`ADMIN_PASSWORD`）
  - `POST /api/admin/logout` 管理员登出
  - `GET /api/admin/status` 管理员状态
  - `GET /api/admin/visits` 每日访问用户数汇总
  - `GET /api/admin/artworks` 作品列表（需管理员权限）
  - `POST /api/admin/artworks/updateLikes` 更新点赞数
  - `POST /api/admin/artworks/updateInfo` 更新标题与作者信息
  - `POST /api/admin/artworks/delete` 删除作品
  - `GET /api/admin/artworks/stats` 每日新增作品数汇总（按 `createdAt` 聚合）

## 国际化（i18n）

- 语言集合：`zh-CN`、`zh-TW`、`en`、`fr`。
- 语言来源：
  - 服务端渲染时读取 Cookie `lang`；
  - 客户端可通过语言切换器设置语言（Cookie / LocalStorage）。

## 漂浮作品云与大小脉冲

- 组件：`src/components/ArtworkCloud.tsx`
- 效果：作品在漂浮时独立进行大小脉冲动画（`scale(0.5)` ↔ `scale(2)`），并为每个作品随机分配不同的脉冲周期，使视觉更自然。

## 开发提示

- 开发模式使用 Turbopack；如端口占用，Next 将自动切换端口。
- Cookies 在 Next.js 16 开发模式为异步 API，服务端代码需 `await cookies()`。
- 本项目为演示用途，本地 JSON 存储不适合生产环境。

## 版本发布

- 常用脚本：
  ```bash
  npm run dev      # 开发
  npm run build    # 构建
  npm start        # 生产启动
  ```
- Git 标记版本（示例 v1.0）：
  ```bash
  git add README.md
  git commit -m "docs: rewrite README for v1.0"
  git tag -a v1.0 -m "v1.0"
  ```

## 致谢

- 构建于 Next.js 16 与 React 19。
- 使用 Tailwind CSS 与 PostCSS 进行样式处理。
