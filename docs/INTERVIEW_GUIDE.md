# Vite 面试知识点总结

本文档总结了项目中涉及的所有面试重点，帮助你快速准备面试。

## 一、Vite 核心原理

### 1. Vite 为什么比 Webpack 快？

**答案：**

1. **开发环境**：利用浏览器原生 ESM，无需打包，按需编译
2. **预构建**：使用 esbuild（Go 语言编写）预构建依赖，比 JS 快 10-100 倍
3. **HMR**：基于 ESM 的 HMR，只需精确失活编辑的模块
4. **生产构建**：使用 Rollup，tree-shaking 更彻底

**代码位置：** `vite.config.ts` 文件顶部注释

### 2. Vite 的工作原理

**开发时：**
- 启动一个 dev server，拦截浏览器的 ESM 请求
- 按需编译返回，不需要预打包

**构建时：**
- 使用 Rollup 进行打包
- 输出高度优化的静态资源

### 3. 什么是预构建？

**答案：**
1. 将 CommonJS/UMD 转换为 ESM
2. 将多个模块合并，减少请求数（如 lodash-es 有 600+ 模块）
3. 使用 esbuild 执行，速度极快

**缓存位置：** `node_modules/.vite`

**重新构建条件：**
- package.json 的 dependencies 变化
- lockfile 变化
- vite.config.js 变化

**代码位置：** `vite.config.ts` -> `optimizeDeps`

---

## 二、Vite 配置

### 1. 如何配置路径别名？

**答案：**

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  }
}

// tsconfig.json
"paths": {
  "@/*": ["src/*"]
}
```

两者需要保持同步：
- Vite alias：运行时模块解析
- tsconfig paths：IDE 智能提示

**代码位置：** `vite.config.ts` -> `resolve.alias`

### 2. 环境变量的使用

**加载顺序：**
1. `.env` - 所有环境
2. `.env.local` - 所有环境，被 git 忽略
3. `.env.[mode]` - 特定模式
4. `.env.[mode].local` - 特定模式，被 git 忽略

**安全注意：** 只有 `VITE_` 前缀的变量才会暴露到客户端

**代码位置：** `.env*` 文件

### 3. 代理配置

**答案：**

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

**原理：** 服务器转发请求，不受浏览器同源策略限制

**代码位置：** `vite.config.ts` -> `server.proxy`

---

## 三、性能优化

### 1. 代码分割策略

**答案：**

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'antd-vendor': ['antd']
      }
    }
  }
}
```

**最佳实践：**
- 路由级别分割
- 大型第三方库单独 chunk
- 公共依赖提取

**代码位置：** `vite.config.ts` -> `build.rollupOptions`

### 2. Tree Shaking

**生效条件：**
- 使用 ES Module（import/export）
- 包的 package.json 设置 sideEffects
- 不要使用 `import * as xxx`

### 3. 压缩配置

```typescript
build: {
  minify: 'esbuild', // 默认，更快
  // minify: 'terser', // 压缩率更高
}
```

**esbuild vs terser：**
- esbuild：速度快（Go 语言），压缩率略低
- terser：速度慢（JS 语言），压缩率高

**代码位置：** `vite.config.ts` -> `build.minify`

---

## 四、React 相关

### 1. React 18 新特性

1. 并发渲染（Concurrent Rendering）
2. 自动批处理（Automatic Batching）
3. Transitions API
4. Suspense 改进
5. 新的 Hooks

**代码位置：** `src/main.tsx`

### 2. React Hooks 规则

1. 只在顶层调用 Hooks
2. 只在 React 函数组件或自定义 Hook 中调用

**代码位置：** `eslint.config.js` -> `react-hooks`

### 3. React 性能优化

1. `React.memo` - 组件记忆化
2. `useMemo` - 计算结果缓存
3. `useCallback` - 函数缓存
4. 合理拆分组件
5. 虚拟列表
6. 懒加载

**代码位置：** `src/pages/demo/PerformanceDemo.tsx`

### 4. ErrorBoundary

**能捕获：**
- 渲染期间的错误
- 生命周期方法中的错误
- 子组件构造函数中的错误

**不能捕获：**
- 事件处理函数中的错误
- 异步代码中的错误
- 服务端渲染错误

**代码位置：** `src/components/ErrorBoundary`

---

## 五、TypeScript 相关

### 1. 严格模式包含哪些检查？

- `strictNullChecks`：严格的 null/undefined 检查
- `strictFunctionTypes`：严格的函数类型检查
- `noImplicitAny`：禁止隐式 any
- `noImplicitThis`：禁止隐式 this

**代码位置：** `tsconfig.json` -> `compilerOptions.strict`

### 2. 常用工具类型

- `Partial<T>`：所有属性可选
- `Required<T>`：所有属性必选
- `Readonly<T>`：所有属性只读
- `Pick<T, K>`：选取部分属性
- `Omit<T, K>`：排除部分属性
- `Record<K, V>`：键值对类型

**代码位置：** `src/types/index.ts`

---

## 六、状态管理

### 1. Zustand vs Redux

**Zustand 优势：**
1. 更简单的 API，无需 Provider
2. 更少的样板代码
3. 内置 immer 支持
4. 体积更小（~1KB vs ~7KB）

**代码位置：** `src/store/index.ts`

### 2. Zustand 性能优化

1. 使用选择器只订阅需要的状态
2. 使用 shallow 比较对象/数组
3. 拆分 store

---

## 七、路由相关

### 1. React Router v6 新特性

1. 使用 Routes 替代 Switch
2. 使用 element 替代 component/render
3. 使用 useNavigate 替代 useHistory
4. 相对路径和嵌套路由改进

**代码位置：** `src/router/index.tsx`

### 2. 路由懒加载

```typescript
const Dashboard = lazy(() => import('@/pages/dashboard'))

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

## 八、CSS 相关

### 1. CSS Modules 原理

**作用：** 解决 CSS 全局作用域问题，实现样式模块化

**原理：**
1. 编译时将类名转换为唯一的哈希值
2. 导出类名映射对象
3. 在 JS 中引用映射对象

**代码位置：** `src/layouts/BasicLayout.module.less`

### 2. CSS 预处理器

**Less、Sass、Stylus 区别：**
- Less：变量 @，较简单
- Sass/SCSS：变量 $，功能强大
- Stylus：语法灵活

**代码位置：** `src/styles/variables.less`

---

## 九、工程化

### 1. ESLint Flat Config

ESLint 9+ 使用扁平配置：
- 使用 ESM 格式
- 配置数组而非对象
- 更好的类型推断

**代码位置：** `eslint.config.js`

### 2. Git Hooks

使用 husky + lint-staged 在提交前检查代码

**代码位置：** `package.json` -> `lint-staged`

---

## 十、常见面试题速查

| 问题 | 文件位置 |
|------|----------|
| Vite 为什么快？ | vite.config.ts |
| 如何配置代理？ | vite.config.ts -> server.proxy |
| 环境变量如何使用？ | .env* 文件 |
| 如何代码分割？ | vite.config.ts -> build.rollupOptions |
| React 18 新特性？ | src/main.tsx |
| Hooks 规则？ | eslint.config.js |
| 性能优化方法？ | src/pages/demo/PerformanceDemo.tsx |
| 错误边界原理？ | src/components/ErrorBoundary |
| TypeScript 工具类型？ | src/types/index.ts |
| Zustand 原理？ | src/store/index.ts |
| 路由懒加载？ | src/router/index.tsx |
| CSS Modules 原理？ | src/layouts/*.module.less |

---

## 学习建议

1. **先看配置文件**：`vite.config.ts`、`tsconfig.json`、`eslint.config.js`
2. **理解项目结构**：看 `src/router`、`src/store`
3. **学习演示页面**：访问 `/demo/vite-features` 和 `/demo/performance`
4. **阅读代码注释**：每个文件都有详细的面试题注释
5. **动手实践**：修改配置，观察效果

祝面试顺利！
