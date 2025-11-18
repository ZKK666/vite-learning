/**
 * =============================================================================
 * React Router 配置详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】React Router v6 的新特性？
 * 答：
 * 1. 使用 Routes 替代 Switch
 * 2. 使用 element 替代 component/render
 * 3. 使用 useNavigate 替代 useHistory
 * 4. 相对路径和嵌套路由改进
 * 5. Outlet 组件用于嵌套路由
 * 6. useRoutes 配置式路由
 *
 * 【面试题】hash 路由和 history 路由的区别？
 * 答：
 * - Hash: URL 带 #，兼容性好，不需要服务器配置
 * - History: URL 美观，需要服务器配置支持（所有路径返回 index.html）
 */

import { lazy, Suspense, type ReactNode } from 'react'
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom'

// 【知识点】路由懒加载
// 使用 React.lazy 配合 Suspense 实现代码分割
import PageLoading from '@/components/PageLoading'
import BasicLayout from '@/layouts/BasicLayout'
import AuthLayout from '@/layouts/AuthLayout'

/**
 * 【面试题】如何实现路由懒加载？
 * 答：
 * 1. 使用 React.lazy 动态导入组件
 * 2. 使用 Suspense 包裹，提供 fallback 加载状态
 * 3. Vite 会自动进行代码分割
 *
 * 【知识点】动态导入的魔法注释
 * webpackChunkName 在 Vite 中不需要
 * Vite 默认使用文件路径生成 chunk 名
 */

// 懒加载包装函数
const lazyLoad = (importFn: () => Promise<{ default: React.ComponentType }>) => {
  const LazyComponent = lazy(importFn)
  return (
    <Suspense fallback={<PageLoading />}>
      <LazyComponent />
    </Suspense>
  )
}

// =============================================================================
// 页面组件懒加载
// =============================================================================

// 认证相关页面
const Login = () => lazyLoad(() => import('@/pages/auth/Login'))
const Register = () => lazyLoad(() => import('@/pages/auth/Register'))

// 主要功能页面
const Dashboard = () => lazyLoad(() => import('@/pages/dashboard'))
const UserList = () => lazyLoad(() => import('@/pages/user/UserList'))
const UserDetail = () => lazyLoad(() => import('@/pages/user/UserDetail'))
const RoleManage = () => lazyLoad(() => import('@/pages/system/RoleManage'))
const MenuManage = () => lazyLoad(() => import('@/pages/system/MenuManage'))

// 演示页面
const ViteFeatures = () => lazyLoad(() => import('@/pages/demo/ViteFeatures'))
const PerformanceDemo = () => lazyLoad(() => import('@/pages/demo/PerformanceDemo'))

// 错误页面
const NotFound = () => lazyLoad(() => import('@/pages/error/NotFound'))
const Forbidden = () => lazyLoad(() => import('@/pages/error/Forbidden'))
const ServerError = () => lazyLoad(() => import('@/pages/error/ServerError'))

/**
 * =============================================================================
 * 路由配置
 * =============================================================================
 *
 * 【面试题】如何组织大型项目的路由？
 * 答：
 * 1. 按功能模块拆分路由配置
 * 2. 使用路由元信息（meta）存储额外信息
 * 3. 实现路由守卫处理权限
 * 4. 使用嵌套路由共享布局
 */

export const routes: RouteObject[] = [
  {
    // 【知识点】根路径重定向
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  {
    // 【知识点】认证相关页面不需要登录
    // 使用独立的 AuthLayout
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },

  {
    /**
     * 【知识点】主布局路由
     * 所有需要登录的页面都嵌套在这里
     *
     * 【面试题】什么是路由嵌套？Outlet 的作用？
     * 答：
     * - 嵌套路由：子路由渲染在父路由的 Outlet 位置
     * - Outlet：父路由中渲染子路由的占位符
     * - 用于共享布局、导航、侧边栏等
     */
    element: <BasicLayout />,
    children: [
      // 仪表盘
      {
        path: '/dashboard',
        element: <Dashboard />,
        /**
         * 【知识点】handle 路由元数据
         * v6 中使用 handle 替代以前的 meta
         * 配合 useMatches 获取
         */
        handle: {
          title: '仪表盘',
          icon: 'DashboardOutlined',
          requiresAuth: true,
        },
      },

      // 用户管理模块
      {
        path: '/user',
        children: [
          {
            index: true, // 【知识点】index 路由，默认子路由
            element: <Navigate to="/user/list" replace />,
          },
          {
            path: 'list',
            element: <UserList />,
            handle: {
              title: '用户列表',
              icon: 'UserOutlined',
              requiresAuth: true,
            },
          },
          {
            /**
             * 【知识点】动态路由参数
             * :id 表示参数，通过 useParams 获取
             */
            path: 'detail/:id',
            element: <UserDetail />,
            handle: {
              title: '用户详情',
              hideInMenu: true,
              requiresAuth: true,
            },
          },
        ],
      },

      // 系统管理模块
      {
        path: '/system',
        children: [
          {
            index: true,
            element: <Navigate to="/system/role" replace />,
          },
          {
            path: 'role',
            element: <RoleManage />,
            handle: {
              title: '角色管理',
              icon: 'TeamOutlined',
              requiresAuth: true,
              roles: ['admin'], // 【知识点】角色权限控制
            },
          },
          {
            path: 'menu',
            element: <MenuManage />,
            handle: {
              title: '菜单管理',
              icon: 'MenuOutlined',
              requiresAuth: true,
              roles: ['admin'],
            },
          },
        ],
      },

      // 演示模块 - Vite 特性和性能优化
      {
        path: '/demo',
        children: [
          {
            index: true,
            element: <Navigate to="/demo/vite-features" replace />,
          },
          {
            path: 'vite-features',
            element: <ViteFeatures />,
            handle: {
              title: 'Vite 特性演示',
              icon: 'ThunderboltOutlined',
            },
          },
          {
            path: 'performance',
            element: <PerformanceDemo />,
            handle: {
              title: '性能优化演示',
              icon: 'RocketOutlined',
            },
          },
        ],
      },
    ],
  },

  // 错误页面
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '/500',
    element: <ServerError />,
  },
  {
    /**
     * 【知识点】通配符路由
     * * 匹配所有未匹配的路径
     * 必须放在最后
     */
    path: '*',
    element: <NotFound />,
  },
]

/**
 * 【面试题】createBrowserRouter 和 BrowserRouter 的区别？
 * 答：
 * - createBrowserRouter: Data API，支持 loader、action
 * - BrowserRouter: 传统方式，使用 useEffect 获取数据
 *
 * 推荐使用 createBrowserRouter，更好的数据获取体验
 */
const router = createBrowserRouter(routes)

export default router

/**
 * =============================================================================
 * 【扩展知识】路由守卫实现
 * =============================================================================
 *
 * React Router 没有 Vue Router 那样的导航守卫
 * 需要自己实现：
 *
 * 方式一：高阶组件包装
 * const PrivateRoute = ({ children }) => {
 *   const { isAuthenticated } = useAuth()
 *   return isAuthenticated ? children : <Navigate to="/login" />
 * }
 *
 * 方式二：使用 loader 函数
 * {
 *   path: '/protected',
 *   loader: async () => {
 *     const user = await checkAuth()
 *     if (!user) throw redirect('/login')
 *     return user
 *   }
 * }
 */
