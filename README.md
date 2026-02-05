# 祺生园 - 智能膳食餐谱系统 🥗

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

**祺生园 (QiShengYuan)** 是一款专为特殊饮食需求人群（如管饲、吞咽困难患者）设计的智能营养流食排程系统。它能根据月度预算和营养需求，自动生成科学、可视化的周餐谱方案。

## ✨ 核心功能

### 1. 多模式排程策略
支持两种核心饮食模式的自动生成：
- **管饲餐 (Tube Feeding)**：每日 **6 餐**（3正餐 + 3加餐），严格控制流食与水的配比。
- **吞咽困难餐 (Dysphagia)**：每日 **3 餐**，针对不同时段调整流食/粉剂浓度（如午餐大份量，早晚小份量）。

### 2. 智能算法
- **预算控制**：基于用户输入的月度预算（如 ¥750），动态计算每日成本。
- **口味随机化**：算法确保每日流食口味不重复，保证一周内的口味多样性。
- **营养均衡**：自动计算热量、蛋白质、脂肪、碳水的摄入比例。

### 3. 可视化看板
- **周度概览**：直观展示一周的饮食安排、总花费及营养达标情况。
- **交互图表**：
  - 📈 **成本趋势图**：查看每日资金消耗波动。
  - 📊 **热量柱状图**：监控每日能量摄入稳定性。
  - 🍩 **营养环形图**：宏观营养素（蛋/脂/碳）占比分析。

### 4. 详情与导出
- **单日详情**：精确到每分钟的用餐时间轴。
- **Excel 导出**：一键生成详细的 `.xlsx` 采购清单与喂食执行表。

---

## 🛠️ 技术栈

- **核心框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS (配合自定义动画)
- **数据处理**: XLSX (Excel 导出)
- **图标库**: 原生 SVG (无额外图标库依赖，轻量化)
- **部署**: Vercel (零配置自动化部署)

---

## 🚀 快速开始

### 1. 环境准备
确保您的电脑已安装 [Node.js](https://nodejs.org/) (推荐 v18+)。

### 2. 安装依赖
```bash
npm install
# 或者
yarn install
```

### 3. 本地开发
启动开发服务器：
```bash
npm run dev
```
浏览器访问 `http://localhost:5173` 即可看到效果。

### 4. 构建打包
生成生产环境代码（位于 `dist` 目录）：
```bash
npm run build
```

### 5. 本地预览打包结果
```bash
npm run preview
```

---

## ☁️ 部署指南 (Vercel)

本项目已针对 Vercel 进行了优化（包含 `vercel.json` 配置），部署非常简单：

1. 将代码上传至您的 **GitHub** 仓库。
2. 登录 [Vercel](https://vercel.com/) 并选择 **Add New -> Project**。
3. 导入您的 GitHub 仓库。
4. **Framework Preset** 选择 `Vite`。
5. 点击 **Deploy**。

> **注意**：项目根目录已包含 `vercel.json`，用于解决单页应用 (SPA) 在刷新时可能出现的 404 问题。

---

## 📂 项目结构

```
.
├── index.html          # 入口 HTML
├── vercel.json         # Vercel 路由配置
├── src/
│   ├── App.tsx         # 主应用组件 (路由与状态管理)
│   ├── types.ts        # TypeScript 类型定义 (产品、餐谱结构)
│   ├── constants.ts    # 核心数据 (产品库、价格、营养参数)
│   ├── index.tsx       # React 渲染入口
│   └── utils/
│       └── calculation.ts # 核心算法 (排程生成、营养计算、成本核算)
└── ...配置文件
```

---

## 📝 业务规则说明

### 产品库 (`constants.ts`)
系统内置了两类核心产品数据：
- **流食包 (Liquid)**：如咖喱牛肉、浓汤鸡肉等，包含具体的价格和营养素数据。
- **粉剂 (Powder)**：常规型与纤维型，作为基础营养补充。

### 配比逻辑
- **管饲模式**：固定 50g 粉 + 50g 流食 / 餐（正餐）。
- **吞咽困难模式**：
  - 早/晚餐：75g 粉 + 70g 流食。
  - 午餐：100g 粉 + 100g 流食（大份量）。

---

## 📄 许可证

MIT License. 供学习与个人使用。
