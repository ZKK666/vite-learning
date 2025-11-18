# Vite 7 + React 18 学习项目

一个面向面试的 Vite 学习项目，包含大量面试知识点和实战经验。

## 项目特点

- **面试导向**：每个文件都包含详细的面试题注释
- **最佳实践**：采用企业级项目架构
- **学习友好**：代码注释详细，包含知识点说明

## 技术栈

- **构建工具**：Vite 7
- **前端框架**：React 18
- **类型系统**：TypeScript 5.6
- **状态管理**：Zustand 5
- **UI 组件库**：Ant Design 5
- **路由**：React Router 6
- **HTTP 客户端**：Axios
- **CSS 预处理**：Less + CSS Modules

## 项目结构

```
src/
├── api/          # API 请求封装
├── assets/       # 静态资源
├── components/   # 通用组件
├── hooks/        # 自定义 Hooks
├── layouts/      # 布局组件
├── pages/        # 页面组件
├── router/       # 路由配置
├── store/        # 状态管理
├── styles/       # 全局样式
├── types/        # 类型定义
├── utils/        # 工具函数
├── App.tsx       # 根组件
└── main.tsx      # 入口文件
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 打包分析
npm run build:analyze
```

## 学习路径

### 1. 基础配置（必看）

- `vite.config.ts` - Vite 配置详解
- `tsconfig.json` - TypeScript 配置
- `.env*` - 环境变量配置
- `eslint.config.js` - ESLint 配置

### 2. 项目架构

- `src/router/index.tsx` - 路由配置与懒加载
- `src/store/index.ts` - Zustand 状态管理
- `src/api/request.ts` - Axios 请求封装

### 3. 演示页面

- `/demo/vite-features` - Vite 核心特性演示
- `/demo/performance` - 性能优化策略演示

### 4. 面试知识点

- `docs/INTERVIEW_GUIDE.md` - 面试知识点总结

## 核心知识点

### Vite 相关

- 开发服务器原理
- 预构建机制
- HMR 热更新
- 插件系统
- 环境变量
- 代理配置
- 代码分割
- 打包优化

### React 相关

- React 18 新特性
- Hooks 使用规则
- 性能优化方法
- 错误边界
- 路由懒加载

### TypeScript 相关

- 类型系统配置
- 工具类型使用
- 泛型实践

### 工程化

- ESLint 9 新配置
- CSS Modules
- Less 变量与混合

## 面试高频考点

1. **Vite 为什么比 Webpack 快？**
2. **什么是预构建？**
3. **如何配置代理？**
4. **如何实现代码分割？**
5. **React 18 有哪些新特性？**
6. **如何优化 React 性能？**
7. **什么是 ErrorBoundary？**
8. **CSS Modules 的原理？**

详细答案见 `docs/INTERVIEW_GUIDE.md`

## 开发脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run dev:staging` | 以 staging 模式启动 |
| `npm run build` | 构建生产版本 |
| `npm run build:staging` | 构建 staging 版本 |
| `npm run build:analyze` | 构建并分析包体积 |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | 代码检查 |

## 项目特性演示

### 1. 静态资源处理

- 图片导入
- URL 导入
- Raw 导入
- public 目录

### 2. CSS 方案

- CSS Modules
- Less 预处理
- 全局变量

### 3. 性能优化

- 路由懒加载
- 代码分割
- Gzip/Brotli 压缩
- React.memo/useMemo/useCallback

## 注意事项

- 项目使用模拟数据，实际使用需要配置真实 API
- 登录账号：admin / 123456
- 推荐使用 Node.js 18+

## License

MIT
