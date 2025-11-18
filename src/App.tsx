/**
 * =============================================================================
 * 应用根组件详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】React 应用的组件层级应该如何设计？
 * 答：
 * 1. App（根组件）：全局 Provider、错误边界
 * 2. Layout（布局组件）：导航、侧边栏、页脚
 * 3. Page（页面组件）：具体业务页面
 * 4. Component（功能组件）：可复用的 UI 组件
 */

import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

import router from '@/router'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useAppStore } from '@/store'

// 设置 dayjs 语言
dayjs.locale('zh-cn')

/**
 * 【知识点】App 组件的职责
 * 1. 配置全局 Provider
 * 2. 设置主题
 * 3. 配置国际化
 * 4. 错误边界
 */
function App() {
  // 从 store 获取主题配置
  const theme = useAppStore((state) => state.theme)

  return (
    /**
     * 【面试题】ErrorBoundary 的作用和原理？
     * 答：
     * 作用：捕获子组件渲染错误，显示降级 UI
     * 原理：类组件的 static getDerivedStateFromError 和 componentDidCatch
     *
     * 注意：ErrorBoundary 无法捕获：
     * 1. 事件处理函数中的错误
     * 2. 异步代码（setTimeout、请求）
     * 3. 服务端渲染
     * 4. ErrorBoundary 自身的错误
     */
    <ErrorBoundary>
      {/**
       * 【知识点】ConfigProvider
       * Ant Design 的全局配置组件
       * - locale: 国际化
       * - theme: 主题配置
       * - componentSize: 全局组件尺寸
       */}
      <ConfigProvider
        locale={zhCN}
        theme={{
          /**
           * 【知识点】Ant Design 5 的 CSS-in-JS 主题系统
           *
           * 【面试题】Ant Design 5 的主题实现方式？
           * 答：
           * - v4 及以前：Less 变量
           * - v5：CSS-in-JS，使用 token 系统
           *
           * 优点：
           * 1. 运行时切换主题
           * 2. 更好的 Tree Shaking
           * 3. 支持组件级别定制
           */
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
          },
          // 【知识点】算法配置
          // darkAlgorithm 暗色主题
          // compactAlgorithm 紧凑主题
          algorithm: theme === 'dark'
            ? undefined // 这里应该导入 theme.darkAlgorithm
            : undefined,
        }}
      >
        {/**
         * 【知识点】AntdApp 组件
         * Ant Design 5.1+ 新增
         * 提供静态方法的上下文（message、notification、modal）
         *
         * 【面试题】为什么 message.success() 没有样式？
         * 答：需要在 AntdApp 组件内部使用
         * 或使用 App.useApp() hook
         */}
        <AntdApp>
          {/**
           * 【知识点】RouterProvider
           * React Router v6.4+ 的 Data Router
           * 支持 loader、action 等数据 API
           */}
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  )
}

export default App

/**
 * =============================================================================
 * 【扩展知识】全局状态 Provider 组织方式
 * =============================================================================
 *
 * 方式一：嵌套 Provider（简单项目）
 * <ErrorBoundary>
 *   <ConfigProvider>
 *     <AuthProvider>
 *       <RouterProvider />
 *     </AuthProvider>
 *   </ConfigProvider>
 * </ErrorBoundary>
 *
 * 方式二：组合 Provider（复杂项目）
 * const composeProviders = (...providers) => ({ children }) =>
 *   providers.reduceRight(
 *     (acc, Provider) => <Provider>{acc}</Provider>,
 *     children
 *   )
 *
 * const Providers = composeProviders(
 *   ErrorBoundary,
 *   ConfigProvider,
 *   AuthProvider
 * )
 *
 * <Providers>
 *   <RouterProvider />
 * </Providers>
 */
