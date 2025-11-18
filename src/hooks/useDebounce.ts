/**
 * =============================================================================
 * 防抖 Hook 详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】防抖和节流的区别？
 * 答：
 * 防抖（Debounce）：
 * - 等待一段时间后执行
 * - 如果在等待期间再次触发，重新计时
 * - 适用场景：搜索框输入、窗口 resize
 *
 * 节流（Throttle）：
 * - 在一段时间内只执行一次
 * - 适用场景：滚动事件、鼠标移动
 *
 * 【面试题】如何实现防抖？
 * 答：使用 setTimeout 和 clearTimeout
 */

import { useState, useEffect, useRef } from 'react'

/**
 * 值防抖 Hook
 * 返回防抖后的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清理函数：清除上一次的定时器
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 函数防抖 Hook
 * 返回防抖后的函数
 */
export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 300
): {
  run: T
  cancel: () => void
  flush: () => void
} {
  const timerRef = useRef<number>()
  const fnRef = useRef(fn)

  // 保持 fn 引用最新
  fnRef.current = fn

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }

  const flush = () => {
    if (timerRef.current) {
      cancel()
      fnRef.current()
    }
  }

  const run = ((...args) => {
    cancel()
    timerRef.current = window.setTimeout(() => {
      fnRef.current(...args)
    }, delay)
  }) as T

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [])

  return {
    run,
    cancel,
    flush,
  }
}

export default useDebounce

/**
 * =============================================================================
 * 使用示例
 * =============================================================================
 *
 * 示例 1：搜索框防抖
 *
 * const [searchValue, setSearchValue] = useState('')
 * const debouncedSearch = useDebounce(searchValue, 500)
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     fetchSearchResults(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 *
 * 示例 2：函数防抖
 *
 * const { run: handleSearch } = useDebounceFn((value) => {
 *   console.log('Searching:', value)
 * }, 500)
 */
