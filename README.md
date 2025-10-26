# 海豹跑团 (GoodTRPG) - 多人实时掷骰网站

一个支持多人实时互动的在线掷骰网站，使用 Next.js + Supabase 构建。

## ✨ 功能特性

- 🎲 **多种骰子类型** - 支持 d4, d6, d8, d10, d12, d20, d100
- 👥 **多人实时同步** - 基于 Supabase Realtime 的实时数据同步
- 🎨 **现代 UI 设计** - 玻璃拟态风格，响应式布局
- 🚀 **无需注册** - 匿名使用，昵称保存在本地
- 📱 **移动端友好** - 完美适配手机、平板、桌面

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, 玻璃拟态设计
- **后端**: Supabase (PostgreSQL + Realtime)
- **部署**: Vercel (推荐)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd GoodDice
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中运行 `supabase-setup.sql` 脚本
3. 复制项目 URL 和 anon key

### 4. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
海豹跑团/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── not-found.tsx      # 404 页面
│   └── room/[roomId]/     # 房间页面
├── lib/                   # 工具库
│   ├── supabase.ts        # Supabase 配置
│   └── utils.ts           # 工具函数
├── supabase-setup.sql     # 数据库设置脚本
└── README.md
```

## 🎮 使用说明

### 创建房间
1. 在首页输入昵称
2. 点击"创建新房间"
3. 系统生成 6 位房间码
4. 分享房间码给朋友

### 加入房间
1. 在首页输入昵称
2. 输入 6 位房间码
3. 点击"加入房间"

### 掷骰子
1. 选择骰子类型（d4-d100）
2. 设置骰子数量（1-10）
3. 点击"掷骰"按钮
4. 结果实时同步给房间内所有用户

## 🎨 设计特色

- **玻璃拟态风格** - 使用 `backdrop-blur` 和半透明效果
- **渐变色彩** - 紫色到蓝色的渐变主题
- **动画效果** - 掷骰动画、淡入效果
- **响应式设计** - 适配各种屏幕尺寸

## 🔧 自定义配置

### 修改骰子类型
在 `app/room/[roomId]/page.tsx` 中修改 `DICE_TYPES` 数组：

```typescript
const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] // 添加或删除骰子类型
```

### 修改样式主题
在 `tailwind.config.js` 中自定义颜色：

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* 你的颜色配置 */ }
    }
  }
}
```

## 📦 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 自动部署完成

### 其他平台

项目支持任何支持 Next.js 的平台：
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🎯 路线图

- [ ] 音效支持
- [ ] 骰子动画效果
- [ ] 房间管理功能
- [ ] 用户头像
- [ ] 暗色/亮色主题切换
- [ ] 移动端 PWA 支持

---

**海豹跑团 v1.0** - 与朋友一起掷骰子 🎲
