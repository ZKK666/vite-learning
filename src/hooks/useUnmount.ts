/**
 * 组件卸载时执行
 */

import { useEffect, useRef } from 'react'

export function useUnmount(fn: () => void) {
  // 使用 ref 保持 fn 引用最新
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => {
    return () => {
      fnRef.current()
    }
  }, [])
}

export default useUnmount
