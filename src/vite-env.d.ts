/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * =============================================================================
 * Vite 类型声明文件详解
 * =============================================================================
 *
 * 【面试题】.d.ts 文件的作用？
 * 答：
 * 1. 为 JavaScript 库提供类型声明
 * 2. 声明全局类型和模块
 * 3. 不会编译输出，只用于类型检查
 *
 * 【知识点】三斜线指令
 * /// <reference types="vite/client" />
 * 引入 Vite 客户端类型，提供：
 * - import.meta.env 类型
 * - 静态资源导入类型
 * - HMR API 类型
 */

/// <reference types="vite/client" />

/**
 * =============================================================================
 * 环境变量类型声明
 * =============================================================================
 *
 * 【面试题】如何为环境变量添加类型提示？
 * 答：扩展 ImportMetaEnv 接口
 *
 * 【实战经验】
 * 定义环境变量类型后，使用 import.meta.env.VITE_XXX 会有智能提示
 */
// 【知识点】使用 declare 扩展全局类型
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv {
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** 公共路径 */
  readonly VITE_PUBLIC_PATH: string
  /** API 基础地址 */
  readonly VITE_API_BASE_URL: string
  /** API 超时时间 */
  readonly VITE_API_TIMEOUT: string
  /** 是否使用 Mock */
  readonly VITE_USE_MOCK: string
  /** 是否启用 PWA */
  readonly VITE_USE_PWA: string
  /** 是否调试模式 */
  readonly VITE_DEBUG: string
  /** 是否压缩 */
  readonly VITE_COMPRESS: string
}

/**
 * =============================================================================
 * 静态资源模块声明
 * =============================================================================
 *
 * 【面试题】如何在 TypeScript 中导入图片等静态资源？
 * 答：需要声明模块类型
 *
 * 【知识点】Vite 内置了常见资源的类型声明
 * 这里可以添加自定义资源类型
 */

// SVG 作为组件导入（需要 vite-plugin-svgr 插件）
declare module '*.svg?react' {
  import type { FC, SVGProps } from 'react'
  const content: FC<SVGProps<SVGSVGElement>>
  export default content
}

// 【知识点】如果需要导入 .vue 文件（多框架项目）
// declare module '*.vue' {
//   import type { DefineComponent } from 'vue'
//   const component: DefineComponent<{}, {}, any>
//   export default component
// }

/**
 * =============================================================================
 * 全局类型声明
 * =============================================================================
 *
 * 【知识点】declare global
 * 用于声明全局变量和类型
 */
declare global {
  /** 构建时注入的应用版本 */
  const __APP_VERSION__: string
  /** 构建时间 */
  const __BUILD_TIME__: string

  /**
   * 【实战经验】扩展 Window 接口
   * 用于第三方库挂载的全局变量
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window {
    // 例如：百度统计
    // _hmt: any[]
    // 例如：自定义配置
    // __APP_CONFIG__: Record<string, unknown>

    /**
     * 【安全实践】权限管理
     * 注意：不要直接挂载权限数组，使用封装的权限管理器
     *
     * ❌ 不安全的做法：
     * __permissions__: string[]  // 可被用户在控制台直接修改
     *
     * ✅ 安全的做法：
     * 使用 Proxy 包装的只读权限对象
     */
    __permissions__?: {
      readonly has: (permission: string) => boolean
      readonly hasAny: (permissions: string[]) => boolean
      readonly hasAll: (permissions: string[]) => boolean
      readonly list: () => readonly string[]
    }
  }
}

/**
 * =============================================================================
 * 常用类型工具
 * =============================================================================
 *
 * 【面试题】TypeScript 常用工具类型有哪些？
 * 答：
 * - Partial<T>: 所有属性可选
 * - Required<T>: 所有属性必选
 * - Readonly<T>: 所有属性只读
 * - Pick<T, K>: 选取部分属性
 * - Omit<T, K>: 排除部分属性
 * - Record<K, V>: 键值对类型
 * - ReturnType<F>: 函数返回类型
 * - Parameters<F>: 函数参数类型
 */

// 导出空对象使文件成为模块
export {}
