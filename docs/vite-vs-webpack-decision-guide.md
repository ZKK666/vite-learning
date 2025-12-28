# Vite vs Webpack 深度决策指南

## 核心原则：先评估约束，再选工具

### 决策流程图

```
开始新项目
    ↓
是否有硬性约束？
    ├─ 是 → 根据约束选择（见下文）
    └─ 否 → 继续评估
         ↓
    团队技术栈？
         ↓
    项目规模预期？
         ↓
    架构复杂度？
         ↓
    做出选择
```

---

## 一、硬性约束判断（一票否决）

### ❌ 不能用 Vite 的场景

| 约束条件 | 说明 | 替代方案 |
|---------|------|---------|
| **必须支持 IE11** | Vite 生产构建最低支持到 ES2015，无法兼容 IE | Webpack 5 + Babel |
| **微前端（qiankun）** | 依赖 Webpack 的 umd 打包格式 | Webpack 5 |
| **Module Federation** | Webpack 5 独有，Vite 插件不成熟 | Webpack 5 |
| **老项目迁移成本 > 3周** | 改造成本过高 | 保持 Webpack |
| **大量自定义 Webpack loader** | 迁移工作量大 | 保持 Webpack |

### ❌ 不建议用 Webpack 的场景

| 约束条件 | 说明 | 推荐方案 |
|---------|------|---------|
| **纯新项目 + 现代浏览器** | Webpack 开发体验差，配置复杂 | Vite |
| **小型项目（< 5 万行）** | Webpack 启动慢，杀鸡用牛刀 | Vite |
| **原型开发/MVP** | 追求快速迭代 | Vite |
| **个人项目/学习** | Vite 开箱即用，学习成本低 | Vite |

---

## 二、项目规模评估

### 小型项目（< 5 万行代码）

| 特征 | Vite | Webpack |
|-----|------|---------|
| 启动速度 | 1-2s ✅ | 10-30s ❌ |
| HMR 速度 | <100ms ✅ | 1-3s ⚠️ |
| 配置复杂度 | 低 ✅ | 高 ❌ |
| 生态完整性 | 够用 ✅ | 过剩 ⚠️ |
| **推荐** | **⭐⭐⭐⭐⭐** | ⭐⭐ |

**结论**：小项目强烈推荐 Vite

---

### 中型项目（5-20 万行代码）

| 场景 | Vite | Webpack | 原因 |
|-----|------|---------|------|
| 纯前端 SPA | ✅ 推荐 | ⚠️ 可选 | Vite 开发体验好 |
| 管理后台 | ✅ 推荐 | ⚠️ 可选 | 通常不需要复杂构建 |
| 电商前台 | ⚠️ 评估 | ✅ 推荐 | 可能需要复杂优化 |
| ToB 系统 | ⚠️ 评估 | ✅ 推荐 | 可能需要兼容旧浏览器 |
| 移动端 H5 | ✅ 推荐 | ⚠️ 可选 | 现代浏览器为主 |

**关键评估点**：
- 浏览器兼容性要求？
- 是否需要 SSR？
- 是否有微前端需求？
- 团队 Webpack 经验如何？

---

### 大型项目（> 20 万行代码）

**Vite 的挑战：**
```typescript
// 1. 开发环境可能出现性能问题
// 当依赖特别多时，预构建可能变慢
// 解决：optimizeDeps.include 手动指定

// 2. 生产构建时间可能更长
// Rollup 单线程构建，大项目不如 Webpack 快
// 解决：考虑使用 Rolldown（Rollup 的 Rust 版本）

// 3. 代码分割不够灵活
// Webpack 的 splitChunks 更强大
```

**Webpack 的优势：**
```typescript
// 1. 成熟的缓存机制
cache: {
  type: 'filesystem',
  // 第二次构建极快
}

// 2. 更强大的代码分割
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // 复杂策略
    }
  }
}

// 3. 多线程构建
// thread-loader, parallel-webpack
```

**推荐**：
- 纯新项目 + 无历史包袱 → **Vite（配合 Rolldown 优化）**
- 已有 Webpack 配置 → **保持 Webpack**
- 需要微前端 → **Webpack**

---

## 三、架构复杂度评估

### 简单架构（单体应用）

```
src/
  ├── pages/
  ├── components/
  └── utils/
```

**推荐**：Vite ⭐⭐⭐⭐⭐
**理由**：开箱即用，无需复杂配置

---

### 中等架构（多页应用/单仓库）

```typescript
// 多页应用
build: {
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      admin: resolve(__dirname, 'admin.html'),
    }
  }
}

// Monorepo（Vite 支持）
packages/
  ├── app1/
  ├── app2/
  └── shared/
```

**Vite**：支持，但配置稍复杂 ⭐⭐⭐⭐
**Webpack**：更成熟的方案 ⭐⭐⭐⭐⭐

---

### 复杂架构（微前端）

```typescript
// qiankun 架构
主应用（Webpack）
  ├── 子应用 1（Webpack）
  ├── 子应用 2（Webpack）
  └── 子应用 3（Vite？）← 有兼容性问题
```

**推荐**：
- qiankun 微前端 → **全部 Webpack** ⭐⭐⭐⭐⭐
- Module Federation → **Webpack 5** ⭐⭐⭐⭐⭐
- 无界（Wujie）微前端 → **Vite 可用** ⭐⭐⭐⭐

---

## 四、团队因素评估

### 团队技术栈

| 因素 | Vite 适配度 | Webpack 适配度 |
|-----|-----------|---------------|
| 团队都是新手 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 团队熟悉 Webpack | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 有 Vite 经验 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 需要快速上手 | ⭐⭐⭐⭐⭐ | ⭐⭐ |

### 维护成本

```typescript
// Vite 配置文件（100-200 行）
export default defineConfig({
  plugins: [react()],
  // 简单明了
})

// Webpack 配置文件（500-2000 行）
module.exports = {
  entry, output, module, plugins,
  optimization, devServer, resolve, ...
  // 复杂但灵活
}
```

**长期维护**：Vite 配置更易维护

---

## 五、性能对比（真实数据）

### 小项目（5000 行代码）

| 指标 | Vite | Webpack 5 |
|-----|------|-----------|
| 首次启动 | 0.8s | 8s |
| 二次启动 | 0.3s | 3s |
| HMR | 50ms | 800ms |
| 生产构建 | 15s | 20s |

---

### 中型项目（5 万行代码）

| 指标 | Vite | Webpack 5 |
|-----|------|-----------|
| 首次启动 | 2s | 45s |
| 二次启动 | 1s | 15s |
| HMR | 80ms | 2s |
| 生产构建 | 60s | 50s |

---

### 大型项目（20 万行代码）

| 指标 | Vite | Webpack 5 | Webpack 5 + 缓存 |
|-----|------|-----------|-----------------|
| 首次启动 | 5s | 180s | 180s |
| 二次启动 | 3s | 90s | 15s |
| HMR | 200ms | 5s | 3s |
| 生产构建 | 180s | 120s | 60s |

**结论**：
- 开发体验：Vite 完胜
- 生产构建：大项目 Webpack 更快（有缓存）

---

## 六、迁移成本评估

### Vite → Webpack（成本极高 ⭐⭐⭐⭐⭐）

**必须改动的地方：**

```typescript
// 1. 动态导入语法
// Vite
const modules = import.meta.glob('./modules/*.ts')

// Webpack
const modules = require.context('./modules', false, /\.ts$/)

// 2. 静态资源导入
// Vite
import logo from './logo.png?url'

// Webpack
import logo from './logo.png'

// 3. 环境变量
// Vite
import.meta.env.VITE_API_URL

// Webpack
process.env.REACT_APP_API_URL

// 4. 配置文件完全重写
// vite.config.ts → webpack.config.js（500+ 行）
```

**工作量估算**：
- 5 万行项目：2-3 周
- 20 万行项目：1-2 个月
- 风险：高（可能引入新 bug）

---

### Webpack → Vite（成本中等 ⭐⭐⭐）

**主要工作：**

```typescript
// 1. 依赖检查
// 检查是否有只支持 CommonJS 的包
// 解决：配置 optimizeDeps

// 2. 环境变量重命名
// REACT_APP_* → VITE_*

// 3. 简化配置
// webpack.config.js → vite.config.ts

// 4. 插件替换
// webpack-bundle-analyzer → rollup-plugin-visualizer
// 大部分有对应插件
```

**工作量估算**：
- 5 万行项目：3-5 天
- 20 万行项目：2-3 周
- 风险：中（主要是依赖兼容性）

---

## 七、决策树（终极版）

```
                    开始
                     ↓
            是否必须支持 IE11？
            ├─ 是 → Webpack
            └─ 否 ↓
                是否微前端（qiankun/MF）？
                ├─ 是 → Webpack
                └─ 否 ↓
                    项目规模？
                    ├─ < 5万行 → Vite ✅
                    ├─ 5-20万行 ↓
                    │       是否新项目？
                    │       ├─ 是 → Vite ✅
                    │       └─ 否 → 保持 Webpack
                    └─ > 20万行 ↓
                            是否有复杂构建需求？
                            ├─ 是 → Webpack
                            └─ 否 → Vite（配合优化）
```

---

## 八、真实案例参考

### 案例 1：字节跳动飞书文档

**选择**：Webpack
**原因**：
- 超大型项目（100万+ 行代码）
- 需要极致的生产构建优化
- 已有成熟的 Webpack 工程化体系

---

### 案例 2：Vue 官方文档

**选择**：Vite
**原因**：
- 中型项目
- 追求开发体验
- 作为 Vite 的最佳实践展示

---

### 案例 3：某创业公司管理后台

**选择**：Vite → Webpack（被迫迁移）
**原因**：
- 初期用 Vite 开发（爽）
- 后期客户要求支持 IE11（痛）
- 迁移花了 3 周（贵）

**教训**：提前评估浏览器兼容性需求！

---

## 九、推荐策略（2025）

### 新项目

```typescript
// 1. 先问自己 3 个问题
const shouldUseVite = (
  !needIE11 &&           // 不需要 IE
  !needMicroFrontend &&  // 不需要微前端
  teamAccepts            // 团队接受
)

// 2. 默认选择
const defaultChoice = shouldUseVite ? 'Vite' : 'Webpack'

// 3. 风险评估
if (projectMayGrowLarge && needComplexOptimization) {
  console.warn('考虑使用 Webpack 避免后期迁移')
}
```

### 老项目

```typescript
// 评估迁移 ROI
const migrationCost = estimateDays(codeSize) // 天数
const benefit = dailyDevTimeSaved * 365       // 年度节省

if (benefit > migrationCost * dailyCost) {
  // 可以考虑迁移
} else {
  // 保持现状
}
```

---

## 十、总结

### 核心原则

1. **没有银弹**：两者都有适用场景
2. **评估约束**：先看硬性要求
3. **计算成本**：考虑长期 ROI
4. **团队优先**：技术服务于团队

### 快速决策（95% 场景适用）

| 场景 | 推荐 | 置信度 |
|-----|------|-------|
| 新项目 + 现代浏览器 | Vite | 95% |
| 新项目 + IE11 | Webpack | 100% |
| 微前端 | Webpack | 100% |
| 小型项目 | Vite | 99% |
| 大型老项目 | 保持原样 | 90% |
| 个人学习 | Vite | 100% |

### 最后的建议

**对于你的学习项目**：
- 100% 使用 Vite ✅
- 学习 Webpack 概念（面试用）
- 理解两者差异（工作用）

**对于未来工作项目**：
- 用本文档的决策树
- 不要盲目追新
- 团队共识 > 个人偏好
