# 项目上下文文档（PROJECT CONTEXT）

> 本文档用于描述项目的整体架构、目录结构、数据流与关键约定，供开发者与 AI 协作维护时参考。最后更新：2026-11-13。

---

## 1. 项目概览

- **项目名称**：Fangjun 作品集（UI-Portfolio）
- **类型**：纯静态作品集网站（无构建工具、无后端、无框架，原生 HTML/CSS/JS）
- **定位**：展示设计师的个人设计作品集，包含首页、作品集页、关于页
- **主题**：固定深色（`color-scheme: dark only`），禁止跟随系统浅色/深色
- **运行方式**：直接打开 HTML 或本地静态服务器（如 `python -m http.server`）
- **语言**：界面文案为简体中文（zh-CN）

## 2. 页面结构

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 | `index.html` | 品牌介绍、About Me、技能、Design Portfolio 精选作品、AI View、联系 |
| 作品集页 | `design.html` | Design Portfolio 全量作品列表，含左侧分类筛选 + 作品卡片网格 |
| 关于页 | `about.html` | 个人简介、技能条、经历等 |

三个页面共用同一套导航（首页 / 作品集 / 关于 / 联系），由 `assets/css/base.css` 提供全局样式。

## 3. 目录结构

```
UIPortfolio/
├── index.html          # 首页
├── design.html         # 作品集页
├── about.html          # 关于页
├── PROJECT_CONTEXT.md  # 本文档
├── assets/
│   ├── css/
│   │   ├── base.css        # 全局基础样式（导航、按钮、通用布局、启动动画）
│   │   ├── home.css        # 首页专属样式
│   │   ├── listing.css     # 作品集页样式（侧边栏、卡片、描述省略）
│   │   ├── about.css       # 关于页样式
│   │   └── modal.css       # 作品详情弹窗样式
│   ├── js/
│   │   ├── works-data.js   # ★ 作品数据（唯一数据源）
│   │   └── site.js         # 全局交互：启动动画/导航/滚动浮现/技能球/Lottie/筛选/弹窗
│   ├── vendor/
│   │   └── lottie.min.js   # Lottie 动画库（本地）
│   ├── img/                # 站点通用图片、favicon、logo、hero 背景
│   ├── works/              # ★ 作品资源目录（每个作品一个子目录 + 封面）
│   └── lottie/、social/、video/ 等（视站点内容而定）
└── .gitignore
```

## 4. 作品数据（核心）

### 4.1 数据文件
作品数据集中在 `assets/js/works-data.js`，通过全局变量 `window.WORKS_DATA` 暴露。结构为对象数组，每个作品对象字段：

```js
{
  id: 30,                        // 唯一 ID
  cover: "assets/works/24ifm-cover.png",  // 封面图（列表卡片用）
  title: "24iFM APP设计（物业管理APP）",   // 标题
  category: "UI设计",             // 分类名称
  date: "2026-11-01T00:00:00.000Z", // 创建日期
  description: "…",              // 描述（列表单行省略 + 弹窗完整展示）
  tech: ["…"],                   // 技术栈（弹窗不再展示，但数据保留）
  client: "外包单子",             // 客户（弹窗不再展示，但数据保留）
  project_url: "",               // 项目链接（为空则不显示）
  protected: false,              // 是否密码保护
  images: ["assets/works/24ifm/01.png", "…"]  // 详情图（按顺序展示）
}
```

### 4.2 当前作品清单（11 个）
| id | 标题 | 分类 | 封面 |
|----|------|------|------|
| 30 | 24iFM APP设计（物业管理APP） | UI设计 | 24ifm-cover.png |
| 31 | YY Circle APP设计（灵活就业平台） | UI设计 | yycircle-cover.png |
| 32 | YY Business APP设计（灵活用工管理平台） | UI设计 | yybusiness-cover.png |
| 33 | YY Pet设计（YY宠物） | UI设计 | yypet-cover.png |
| 34 | HongYe Group官网设计 | 网页设计 | hongye-cover.png |
| 35 | YYForce集团官网（原YYGH） | 网页设计 | yyforce-cover.png |
| 36 | YY Circle官网 | 网页设计 | yycircleweb-cover.png |
| 37 | Smart iClean管理系统 | 管理后台 | smarticlean-cover.png |
| 38 | Banner设计合集 | 平面设计 | banner-cover.png |
| 17 | 组件系统-插画组件库系统设计 | 品牌建设 | 16.png |
| 16 | 运营视觉设计合集 | 运营设计 | 17.png |

> 注：`id 30~38` 为外包新作品（分类在保留分类内），`id 16/17` 为较早公司项目（分类为品牌建设/运营设计，仅在「全部项目」下展示）。

### 4.3 分类与筛选
作品集页 `design.html` 侧边栏分类按钮只保留 5 个：

| 按钮 | data-category | 说明 |
|------|---------------|------|
| 全部项目 | `""` | 显示全部 11 个 |
| 网页设计 | `3` | 只筛 `data-category="web"` 的卡片 |
| UI/UX设计 | `ui` | 只筛 `data-category="ui"` 的卡片 |
| 管理后台 | `8` | 只筛 `data-category="admin"` 的卡片 |
| 平面设计 | `flat` | 只筛 `data-category="graphic"` 的卡片 |

**筛选逻辑**：`design.html` 中每张卡片带 `data-category` 属性（`web`/`ui`/`admin`/`graphic`/`11`/`10`）；`site.js` 的 `initListingFilter()` 监听侧边栏点击，按 `data-category` 匹配显隐卡片，并同步更新标题与「共 N 个作品」计数。

> ⚠️ 注意：侧边栏按钮的 `data-category`（`3`/`ui`/`8`/`flat`）与作品卡片的 `data-category`（`web`/`ui`/`admin`/`graphic`/`11`/`10`）**不是同一套值**。按钮值用于判断是否为空筛选，卡片值用于实际匹配。新增作品时需同时保证卡片 `data-category` 与 `works-data.js` 中 `category` 对应。
> 分类值约定：UI设计 → `ui`，网页设计 → `web`，管理后台 → `admin`，平面设计 → `graphic`；品牌建设 → `11`，运营设计 → `10`（后两者无侧边栏按钮，仅全部项目可见）。

## 5. 页面数据流

```
works-data.js (window.WORKS_DATA)
      │
      ├── design.html ── 卡片静态硬编码（封面/标题/描述 + data-category）
      │         │
      │         └── site.js initListingFilter() ── 分类筛选显隐
      │
      └── site.js initWorkModal() ── 点击卡片 → byTitle 匹配 → 弹窗展示完整详情
```

- **作品集卡片**：`design.html` 中卡片是**硬编码 HTML**（非 JS 渲染），因此新增/修改作品需要**同时改** `design.html` 的卡片和 `works-data.js` 的数据。
- **详情弹窗**：由 `site.js` 的 `initWorkModal()` 动态构建，通过卡片内 `.work-name` 文本匹配 `WORKS_DATA` 中同名作品，展示 title / category / description / images。
- **弹窗字段**：当前仅展示标题、分类标签、描述、图片列表。`tech`（技术栈）、`date`、`client` 数据仍保留在 `WORKS_DATA` 中但**不再展示**。

## 6. 首页 Design Portfolio 精选

`index.html` 的 Design Portfolio 模块展示 6 张作品卡片，**与作品集页前 6 个作品同步**（按作品集顺序）：

1. 24iFM APP设计（物业管理APP）— UI设计
2. YY Circle APP设计（灵活就业平台）— UI设计
3. YY Business APP设计（灵活用工管理平台）— UI设计
4. YY Pet设计（YY宠物）— UI设计
5. HongYe Group官网设计 — 网页设计
6. YYForce集团官网（原YYGH）— 网页设计

卡片同样硬编码在 `index.html`，点击「Design View →」跳转 `design.html`。

> ⚠️ 首页卡片是**静态硬编码**，不会随 `works-data.js` 自动更新。若调整作品集前 6 个作品，需手动同步 `index.html` 的对应卡片。

## 7. 图片资源约定

- 每个作品在 `assets/works/<目录名>/` 下存放详情图，命名 `01.png`、`02.png`…（按展示顺序）。
- 每个作品一个封面图：`assets/works/<目录名>-cover.png`（列表卡片 + 首页精选用）。
- 首页 About Me 的 24iFM 卡片使用首页专用图 `assets/img/about-24ifm.png`（仅首页，不影响作品集封面）。
- 已清理所有未使用旧资源（删除 246 个文件 / 71.5MB），`assets/works/` 现仅保留在用作品资源。

## 8. 关键交互说明（site.js）

- **启动动画** `initBootSplash`：进度条 0→100% 后淡出 `#boot-splash`，移除 `boot-splash-active`。
- **导航** `initNav`：移动端菜单开合，☰/✕ 切换。
- **滚动浮现** `initReveal`：`.scroll-reveal` 元素进入视口加 `is-revealed`；支持 `prefers-reduced-motion` 与降级。
- **3D 技能球** `initSkillSphere`：纯 JS Fibonacci 球面分布 + 自转/拖拽，标签池含 Figma/PS/AI 等。
- **Lottie** `initLottie`：`[data-lottie]` 元素加载 JSON 动画，依赖 `lottie.min.js`。
- **技能条** `initSkillBars`：关于页 `.progress-fill` 进入视口填充宽度。
- **分类筛选** `initListingFilter`：见 §4.3。
- **作品弹窗** `initWorkModal`：见 §5。

## 9. Git 与部署

- 仓库：远程 `origin`（GitHub），分支 `main`。
- **推送注意**：本环境沙箱默认代理会拦截 `github.com`。需用本机 Clash 混合端口推送：
  `git -c http.proxy=http://127.0.0.1:7897 -c http.version=HTTP/1.1 push origin main`
- `.gitignore` 已忽略 `.workbuddy/` 与 `.trae-html-share-packages/`。
- 静态站点可直接托管（无构建），或经 Trae deployment 插件发布。

## 10. 常见维护任务速查

| 任务 | 涉及文件 |
|------|----------|
| 新增/修改作品 | `assets/js/works-data.js` + `design.html`（卡片） |
| 新增后同步首页精选 | `index.html`（Design Portfolio 卡片） |
| 修改作品描述/图片 | `works-data.js`（数据）+ `assets/works/<目录>/`（图片） |
| 调整分类 | `design.html`（按钮 + 卡片 `data-category`）+ `works-data.js`（category） |
| 修改弹窗展示字段 | `assets/js/site.js`（fillModal） |
| 样式调整 | 对应 `assets/css/*.css` |
