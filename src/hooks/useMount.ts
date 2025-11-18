/**
 * =============================================================================
 * 挂载/卸载 Hook
 * =============================================================================
 */

import { useEffect } from 'react'

/**
 * 组件挂载时执行
 */
export function useMount(fn: () => void) {
  useEffect(() => {
    fn()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useMount
