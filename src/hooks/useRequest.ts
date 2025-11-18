/**
 * =============================================================================
 * 自定义请求 Hook 详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】为什么需要请求 Hook？
 * 答：
 * 1. 统一管理请求状态（loading、error、data）
 * 2. 自动处理组件卸载时的请求取消
 * 3. 支持缓存、重试、轮询等高级功能
 * 4. 减少重复代码
 *
 * 【面试题】如何防止在已卸载组件上 setState？
 * 答：
 * 1. 使用 useEffect 返回的清理函数
 * 2. 使用 AbortController 取消请求
 * 3. 使用 isMounted ref 标记
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface RequestOptions<T> {
  /** 是否手动触发，默认 false（自动执行） */
  manual?: boolean
  /** 默认数据 */
  defaultData?: T
  /** 依赖数组，变化时重新请求 */
  deps?: unknown[]
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 失败回调 */
  onError?: (error: Error) => void
  /** 请求前回调 */
  onBefore?: () => void
  /** 请求后回调 */
  onFinally?: () => void
  /** 缓存时间（毫秒） */
  cacheTime?: number
  /** 轮询间隔（毫秒） */
  pollingInterval?: number
  /** 防抖等待时间（毫秒） */
  debounceWait?: number
}

interface RequestResult<T, P extends unknown[]> {
  /** 响应数据 */
  data: T | undefined
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: Error | undefined
  /** 手动触发请求 */
  run: (...params: P) => Promise<T | undefined>
  /** 刷新（使用上次参数重新请求） */
  refresh: () => Promise<T | undefined>
  /** 修改数据 */
  mutate: (data: T | ((prev: T | undefined) => T)) => void
  /** 取消请求 */
  cancel: () => void
}

/**
 * 【知识点】自定义 Hook
 *
 * 【面试题】自定义 Hook 的规则？
 * 答：
 * 1. 函数名必须以 use 开头
 * 2. 内部可以调用其他 Hooks
 * 3. 遵循 Hooks 的调用规则（顶层调用、不能条件调用）
 */
export function useRequest<T, P extends unknown[] = []>(
  service: (...params: P) => Promise<T>,
  options: RequestOptions<T> = {}
): RequestResult<T, P> {
  const {
    manual = false,
    defaultData,
    deps = [],
    onSuccess,
    onError,
    onBefore,
    onFinally,
    pollingInterval,
  } = options

  // 状态
  const [data, setData] = useState<T | undefined>(defaultData)
  const [loading, setLoading] = useState(!manual)
  const [error, setError] = useState<Error | undefined>()

  // 存储最新的参数（用于 refresh）
  const paramsRef = useRef<P>()

  // 取消控制器
  const abortControllerRef = useRef<AbortController>()

  // 轮询定时器
  const pollingTimerRef = useRef<number>()

  /**
   * 【知识点】取消请求
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current)
    }
  }, [])

  /**
   * 【知识点】执行请求
   */
  const run = useCallback(
    async (...params: P): Promise<T | undefined> => {
      // 取消之前的请求
      cancel()

      // 保存参数
      paramsRef.current = params

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController()

      try {
        // 请求前回调
        onBefore?.()
        setLoading(true)
        setError(undefined)

        // 执行请求
        const result = await service(...params)

        // 检查是否已取消
        if (abortControllerRef.current.signal.aborted) {
          return
        }

        // 更新数据
        setData(result)

        // 成功回调
        onSuccess?.(result)

        // 设置轮询
        if (pollingInterval && pollingInterval > 0) {
          pollingTimerRef.current = window.setTimeout(() => {
            run(...params)
          }, pollingInterval)
        }

        return result
      } catch (err) {
        // 忽略取消错误
        if ((err as Error).name === 'AbortError') {
          return
        }

        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)

        // 错误回调
        onError?.(error)

        throw error
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false)
          onFinally?.()
        }
      }
    },
    [service, cancel, onBefore, onSuccess, onError, onFinally, pollingInterval]
  )

  /**
   * 【知识点】刷新请求
   */
  const refresh = useCallback(async () => {
    return run(...(paramsRef.current || ([] as unknown as P)))
  }, [run])

  /**
   * 【知识点】修改数据
   * 用于乐观更新
   */
  const mutate = useCallback((newData: T | ((prev: T | undefined) => T)) => {
    setData((prev) =>
      typeof newData === 'function'
        ? (newData as (prev: T | undefined) => T)(prev)
        : newData
    )
  }, [])

  /**
   * 【知识点】自动执行
   */
  useEffect(() => {
    if (!manual) {
      run(...([] as unknown as P))
    }
  }, [manual, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 【知识点】组件卸载时取消请求
   *
   * 【面试题】为什么要在 useEffect 返回清理函数？
   * 答：
   * 1. 防止内存泄漏
   * 2. 防止在已卸载组件上 setState
   * 3. 取消未完成的异步操作
   */
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return {
    data,
    loading,
    error,
    run,
    refresh,
    mutate,
    cancel,
  }
}

export default useRequest

/**
 * =============================================================================
 * 【扩展知识】ahooks useRequest
 * =============================================================================
 *
 * 实际项目推荐使用 ahooks 的 useRequest
 * 功能更完善：
 * 1. 缓存和 SWR
 * 2. 防抖节流
 * 3. 错误重试
 * 4. 聚焦/可见时重新请求
 * 5. 并行请求
 *
 * import { useRequest } from 'ahooks'
 *
 * const { data, loading, error, run } = useRequest(
 *   (id) => fetchUser(id),
 *   {
 *     manual: true,
 *     cacheKey: 'user-info',
 *     staleTime: 5000,
 *   }
 * )
 */
