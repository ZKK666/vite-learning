/**
 * =============================================================================
 * 应用入口文件详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】React 18 的新特性有哪些？
 * 答：
 * 1. 并发渲染（Concurrent Rendering）
 * 2. 自动批处理（Automatic Batching）
 * 3. Transitions API
 * 4. Suspense 改进
 * 5. 新的 Hooks（useId, useDeferredValue, useTransition 等）
 *
 * 【面试题】createRoot vs render 的区别？
 * 答：
 * - React 17: ReactDOM.render(element, container)
 * - React 18: ReactDOM.createRoot(container).render(element)
 * createRoot 启用 React 18 的所有新特性，包括并发模式
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 【知识点】全局样式导入
// 在入口文件导入全局样式，确保最先加载
import './styles/global.less'

/**
 * 【面试题】StrictMode 的作用？
 * 答：
 * 1. 识别不安全的生命周期方法
 * 2. 检测过时的 API 使用
 * 3. 检测副作用（开发模式会渲染两次）
 * 4. 检测过时的 context API
 *
 * 注意：StrictMode 只在开发模式下有效，不影响生产构建
 */

/**
 * 【知识点】类型断言
 * document.getElementById 返回 HTMLElement | null
 * 我们确定 'root' 元素存在，使用 ! 断言非空
 */
const rootElement = document.getElementById('root')!

/**
 * 【面试题】为什么需要检查 rootElement？
 * 答：
 * 防御性编程，即使我们知道元素存在，
 * 也要处理可能的异常情况，提高应用健壮性
 */
if (!rootElement) {
  throw new Error(
    '找不到根元素！请确保 index.html 中存在 id="root" 的元素'
  )
}

// 创建根节点并渲染应用
const root = createRoot(rootElement)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

/**
 * =============================================================================
 * 【扩展知识】生产环境性能监控
 * =============================================================================
 *
 * 【实战经验】集成 Web Vitals 监控
 *
 * import { onCLS, onFID, onLCP } from 'web-vitals'
 *
 * if (import.meta.env.PROD) {
 *   onCLS(console.log)  // 累积布局偏移
 *   onFID(console.log)  // 首次输入延迟
 *   onLCP(console.log)  // 最大内容绘制
 * }
 *
 * 【面试题】什么是 Core Web Vitals？
 * 答：Google 定义的网页性能核心指标
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 */

/**
 * =============================================================================
 * 【扩展知识】错误边界降级处理
 * =============================================================================
 *
 * 如果需要在 React 外部捕获渲染错误：
 *
 * try {
 *   root.render(<App />)
 * } catch (error) {
 *   // 降级到简单的错误提示
 *   rootElement.innerHTML = '<h1>应用加载失败</h1>'
 *   console.error(error)
 * }
 */
