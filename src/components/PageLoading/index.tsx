/**
 * =============================================================================
 * 页面加载组件
 * =============================================================================
 *
 * 【知识点】用于路由懒加载时的 Suspense fallback
 *
 * 【面试题】如何优化首屏加载体验？
 * 答：
 * 1. 使用骨架屏或 loading 动画
 * 2. 预加载关键资源
 * 3. 代码分割，减小主包体积
 * 4. 服务端渲染（SSR）
 */

import { Spin } from 'antd'

interface PageLoadingProps {
  tip?: string
}

export default function PageLoading({ tip = '加载中...' }: PageLoadingProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '200px',
      }}
    >
      <Spin size="large" tip={tip} />
    </div>
  )
}
