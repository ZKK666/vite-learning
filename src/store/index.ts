/**
 * =============================================================================
 * Zustand 状态管理详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】为什么选择 Zustand 而不是 Redux？
 * 答：
 * 1. 更简单的 API，无需 Provider 包裹
 * 2. 更少的样板代码
 * 3. 内置 immer 支持
 * 4. 更好的 TypeScript 支持
 * 5. 体积更小（~1KB vs ~7KB）
 * 6. 没有中间件地狱
 *
 * 【面试题】Zustand 的工作原理？
 * 答：
 * 1. 基于发布订阅模式
 * 2. 组件订阅 store，状态变化时重新渲染
 * 3. 使用 Object.is 进行浅比较
 * 4. 支持选择器避免不必要的重渲染
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { UserInfo } from '@/types'

/**
 * =============================================================================
 * 用户状态
 * =============================================================================
 */

interface UserState {
  // 状态
  userInfo: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean

  // 操作
  setUserInfo: (info: UserInfo) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

/**
 * 【知识点】Zustand store 创建
 *
 * 【面试题】Zustand 中间件的作用？
 * 答：
 * - devtools: Redux DevTools 支持
 * - persist: 持久化到 localStorage
 * - immer: 支持可变式更新
 */
export const useUserStore = create<UserState>()(
  // 中间件组合（从右往左执行）
  devtools(
    persist(
      immer((set) => ({
        // 初始状态
        userInfo: null,
        token: null,
        isAuthenticated: false,
        loading: false,

        // 设置用户信息
        setUserInfo: (info) =>
          set((state) => {
            // 【知识点】immer 允许直接修改 state
            state.userInfo = info
            state.isAuthenticated = true
          }),

        // 设置 token
        setToken: (token) =>
          set((state) => {
            state.token = token
          }),

        // 登出
        logout: () =>
          set((state) => {
            state.userInfo = null
            state.token = null
            state.isAuthenticated = false
          }),

        // 设置加载状态
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),
      })),
      {
        // persist 配置
        name: 'user-storage', // localStorage key
        // 【实战经验】只持久化必要的数据
        partialize: (state) => ({
          token: state.token,
          userInfo: state.userInfo,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'UserStore', // DevTools 中显示的名称
      enabled: import.meta.env.DEV, // 只在开发环境启用
    }
  )
)

/**
 * =============================================================================
 * 全局应用状态
 * =============================================================================
 */

interface AppState {
  // 状态
  collapsed: boolean // 侧边栏收起状态
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  breadcrumbs: Array<{ title: string; path?: string }>

  // 操作
  toggleCollapsed: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'zh-CN' | 'en-US') => void
  setBreadcrumbs: (breadcrumbs: Array<{ title: string; path?: string }>) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        collapsed: false,
        theme: 'light',
        language: 'zh-CN',
        breadcrumbs: [],

        toggleCollapsed: () =>
          set((state) => ({ collapsed: !state.collapsed })),

        setTheme: (theme) => set({ theme }),

        setLanguage: (language) => set({ language }),

        setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          collapsed: state.collapsed,
          theme: state.theme,
          language: state.language,
        }),
      }
    ),
    {
      name: 'AppStore',
      enabled: import.meta.env.DEV,
    }
  )
)

/**
 * =============================================================================
 * 【扩展知识】Zustand 高级用法
 * =============================================================================
 */

/**
 * 【知识点】选择器模式
 * 避免不必要的重渲染
 *
 * 【面试题】如何优化 Zustand 性能？
 * 答：
 * 1. 使用选择器只订阅需要的状态
 * 2. 使用 shallow 比较对象/数组
 * 3. 拆分 store 避免单个 store 过大
 *
 * 示例：
 * const username = useUserStore(state => state.userInfo?.username)
 * const { userInfo, token } = useUserStore(
 *   state => ({ userInfo: state.userInfo, token: state.token }),
 *   shallow
 * )
 */

/**
 * 【知识点】在组件外访问 store
 * 用于在非 React 环境中（如 axios 拦截器）
 */
export const getUserToken = () => useUserStore.getState().token
export const getUserInfo = () => useUserStore.getState().userInfo
export const clearUserState = () => useUserStore.getState().logout()

/**
 * 【知识点】订阅状态变化
 * 类似 Redux 的 subscribe
 */
// useUserStore.subscribe(
//   (state) => state.token,
//   (token) => {
//     console.log('Token changed:', token)
//   }
// )

/**
 * 【实战经验】计算属性/派生状态
 * Zustand 没有内置的 computed，需要手动实现
 */
export const useIsAdmin = () =>
  useUserStore((state) => state.userInfo?.roles.includes('admin') ?? false)
