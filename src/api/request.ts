/**
 * =============================================================================
 * Axios 请求封装详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】为什么要封装 Axios？
 * 答：
 * 1. 统一配置（baseURL、timeout、headers）
 * 2. 统一错误处理
 * 3. 请求/响应拦截（token 注入、数据转换）
 * 4. 重试机制、取消请求
 * 5. loading 状态管理
 *
 * 【面试题】Axios 拦截器的执行顺序？
 * 答：
 * 请求：后添加的先执行（栈结构）
 * 响应：先添加的先执行（队列结构）
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { message } from 'antd'
import { getUserToken, clearUserState } from '@/store'
import type { ApiResponse } from '@/types'

/**
 * =============================================================================
 * 请求配置
 * =============================================================================
 */

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  // 【知识点】从环境变量读取配置
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * =============================================================================
 * 请求拦截器
 * =============================================================================
 *
 * 【面试题】请求拦截器可以做什么？
 * 答：
 * 1. 添加 token 等认证信息
 * 2. 添加时间戳防缓存
 * 3. 参数序列化
 * 4. loading 状态开始
 * 5. 请求日志
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 store 获取 token
    const token = getUserToken()
    if (token) {
      // 【知识点】Bearer Token 认证
      config.headers.Authorization = `Bearer ${token}`
    }

    // 【实战经验】添加时间戳防止 GET 请求缓存
    if (config.method?.toUpperCase() === 'GET') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }

    // 【实战经验】开发环境打印请求日志
    if (import.meta.env.DEV) {
      console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`, config)
    }

    return config
  },
  (error) => {
    console.error('[Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * =============================================================================
 * 响应拦截器
 * =============================================================================
 *
 * 【面试题】响应拦截器可以做什么？
 * 答：
 * 1. 数据转换（取出 data）
 * 2. 错误处理（HTTP 错误、业务错误）
 * 3. token 过期处理
 * 4. loading 状态结束
 * 5. 响应日志
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    // 【实战经验】开发环境打印响应日志
    if (import.meta.env.DEV) {
      console.log(`[Response] ${response.config.url}`, data)
    }

    // 【知识点】业务错误处理
    // 不同后端可能有不同的约定
    if (data.code !== 0 && data.code !== 200) {
      // 显示错误消息
      message.error(data.message || '请求失败')

      // 特定错误码处理
      if (data.code === 401) {
        // token 过期，清除用户状态，跳转登录
        handleUnauthorized()
      }

      return Promise.reject(new Error(data.message || '请求失败'))
    }

    // 【知识点】直接返回业务数据
    // 这样调用处不需要再 .data
    return data.data as unknown as AxiosResponse
  },
  (error) => {
    /**
     * 【面试题】如何处理 HTTP 错误？
     * 答：根据状态码分类处理
     */
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          message.error(data.message || '请求参数错误')
          break
        case 401:
          handleUnauthorized()
          break
        case 403:
          message.error('没有权限访问')
          // 跳转到 403 页面
          window.location.href = '/403'
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(`请求失败: ${status}`)
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      if (error.code === 'ECONNABORTED') {
        message.error('请求超时，请稍后重试')
      } else {
        message.error('网络错误，请检查网络连接')
      }
    } else {
      message.error('请求配置错误')
    }

    // 开发环境打印错误
    if (import.meta.env.DEV) {
      console.error('[Response Error]', error)
    }

    return Promise.reject(error)
  }
)

/**
 * 处理未授权
 */
function handleUnauthorized() {
  message.error('登录已过期，请重新登录')
  clearUserState()
  // 保存当前路径，登录后跳回
  const currentPath = window.location.pathname
  window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
}

/**
 * =============================================================================
 * 请求方法封装
 * =============================================================================
 */

/**
 * 【知识点】泛型请求方法
 * T: 响应数据类型
 * D: 请求数据类型
 */

export function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return service.get(url, { params, ...config })
}

export function post<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  return service.post(url, data, config)
}

export function put<T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  return service.put(url, data, config)
}

export function del<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  return service.delete(url, config)
}

/**
 * =============================================================================
 * 【扩展知识】高级功能
 * =============================================================================
 */

/**
 * 【知识点】取消请求
 *
 * 【面试题】如何取消 Axios 请求？
 * 答：使用 AbortController（推荐）或 CancelToken（已废弃）
 *
 * 使用示例：
 * const controller = new AbortController()
 * get('/api/data', {}, { signal: controller.signal })
 * controller.abort() // 取消请求
 */

/**
 * 【知识点】并发请求
 *
 * 示例：
 * const [user, posts] = await Promise.all([
 *   get('/api/user'),
 *   get('/api/posts')
 * ])
 */

/**
 * 【实战经验】请求重试
 * 可以使用 axios-retry 插件或自定义实现
 */
// import axiosRetry from 'axios-retry'
// axiosRetry(service, { retries: 3 })

/**
 * 【实战经验】请求去重
 * 相同请求在 pending 时不重复发送
 */
// const pendingMap = new Map()
// 在请求拦截器中检查并存储
// 在响应拦截器中删除

export default service
