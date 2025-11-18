/**
 * =============================================================================
 * 全局类型定义 - 面试重点
 * =============================================================================
 *
 * 【实战经验】类型文件组织方式
 * 1. 全局通用类型放在 types/index.ts
 * 2. 模块专属类型放在模块目录下（如 api/user/types.ts）
 * 3. 使用 index.ts 统一导出
 */

/**
 * =============================================================================
 * API 响应类型
 * =============================================================================
 */

/**
 * 【面试题】如何设计统一的 API 响应类型？
 * 答：使用泛型定义通用响应结构
 */
export interface ApiResponse<T = unknown> {
  /** 业务状态码 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
  /** 是否成功 */
  success: boolean
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[]
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总数量 */
  total: number
  /** 总页数 */
  totalPages: number
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * =============================================================================
 * 用户相关类型
 * =============================================================================
 */

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  nickname?: string
  roles: string[]
  permissions: string[]
  createTime: string
  updateTime: string
}

/**
 * 登录参数
 */
export interface LoginParams {
  username: string
  password: string
  captcha?: string
  remember?: boolean
}

/**
 * 登录响应
 */
export interface LoginResult {
  token: string
  refreshToken: string
  expiresIn: number
  userInfo: UserInfo
}

/**
 * =============================================================================
 * 路由相关类型
 * =============================================================================
 */

/**
 * 【实战经验】路由元信息类型
 * 用于定义路由的额外属性，如权限、标题等
 */
export interface RouteMeta {
  /** 页面标题 */
  title: string
  /** 图标 */
  icon?: string
  /** 是否需要登录 */
  requiresAuth?: boolean
  /** 所需角色 */
  roles?: string[]
  /** 所需权限 */
  permissions?: string[]
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean
  /** 是否缓存页面 */
  keepAlive?: boolean
  /** 排序 */
  order?: number
}

/**
 * 菜单项类型
 */
export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  children?: MenuItem[]
  path?: string
  meta?: RouteMeta
}

/**
 * =============================================================================
 * 表格相关类型
 * =============================================================================
 */

/**
 * 表格列配置（扩展 Ant Design）
 */
export interface TableColumn<T = unknown> {
  title: string
  dataIndex: keyof T | string
  key?: string
  width?: number | string
  fixed?: 'left' | 'right'
  sorter?: boolean
  render?: (value: unknown, record: T, index: number) => React.ReactNode
}

/**
 * =============================================================================
 * 表单相关类型
 * =============================================================================
 */

/**
 * 【面试题】如何设计表单状态类型？
 * 答：区分查看、编辑、新增三种状态
 */
export type FormMode = 'view' | 'edit' | 'create'

/**
 * 选项类型（下拉框、单选、多选等）
 */
export interface SelectOption<V = string | number> {
  label: string
  value: V
  disabled?: boolean
  children?: SelectOption<V>[]
}

/**
 * =============================================================================
 * 工具类型
 * =============================================================================
 */

/**
 * 【知识点】Nullable 工具类型
 * 使类型可以为 null
 */
export type Nullable<T> = T | null

/**
 * 【知识点】Recordable 工具类型
 * 任意键值对对象
 */
export type Recordable<T = unknown> = Record<string, T>

/**
 * 【知识点】DeepPartial 工具类型
 * 递归使所有属性可选
 *
 * 【面试题】如何实现 DeepPartial？
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 【知识点】ValueOf 工具类型
 * 获取对象值的联合类型
 */
export type ValueOf<T> = T[keyof T]

/**
 * 【知识点】AsyncReturnType 工具类型
 * 获取异步函数的返回类型
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never

/**
 * =============================================================================
 * 组件 Props 通用类型
 * =============================================================================
 */

/**
 * 【实战经验】基础组件 Props
 * 包含常用的通用属性
 */
export interface BaseComponentProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/**
 * 【知识点】带 ref 的组件 Props
 */
export type PropsWithRef<P, E extends HTMLElement = HTMLElement> = P & {
  ref?: React.Ref<E>
}
