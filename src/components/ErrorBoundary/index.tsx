/**
 * =============================================================================
 * 错误边界组件详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】什么是错误边界？如何实现？
 * 答：
 * - 错误边界是 React 组件，可以捕获子组件树中的 JavaScript 错误
 * - 必须使用类组件实现（函数组件不支持 getDerivedStateFromError）
 * - 使用 static getDerivedStateFromError 更新 state
 * - 使用 componentDidCatch 记录错误信息
 *
 * 【面试题】错误边界能捕获哪些错误？
 * 答：
 * 能捕获：
 * - 渲染期间的错误
 * - 生命周期方法中的错误
 * - 子组件构造函数中的错误
 *
 * 不能捕获：
 * - 事件处理函数中的错误
 * - 异步代码中的错误
 * - 服务端渲染错误
 * - 错误边界自身的错误
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Button, Result } from 'antd'

interface Props {
  children: ReactNode
  /**
   * 【知识点】自定义 fallback
   * 可以传入自定义的错误展示组件
   */
  fallback?: ReactNode
  /**
   * 【知识点】错误回调
   * 用于上报错误到监控系统
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  /**
   * 【知识点】static getDerivedStateFromError
   *
   * 在渲染阶段调用，用于更新 state
   * 不允许有副作用
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state，下次渲染时显示降级 UI
    return {
      hasError: true,
      error,
    }
  }

  /**
   * 【知识点】componentDidCatch
   *
   * 在提交阶段调用，可以有副作用
   * 用于记录错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 更新错误信息
    this.setState({ errorInfo })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 【实战经验】上报错误到监控系统
    // 如 Sentry、阿里云 ARMS 等
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 示例：上报到 Sentry
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, {
    //     extra: { componentStack: errorInfo.componentStack }
    //   })
    // }
  }

  /**
   * 【知识点】重置错误状态
   * 允许用户尝试重新渲染
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  /**
   * 【知识点】刷新页面
   */
  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // 如果提供了自定义 fallback，使用自定义的
      if (fallback) {
        return fallback
      }

      // 默认的错误展示 UI
      return (
        <div style={{ padding: '50px' }}>
          <Result
            status="error"
            title="页面出错了"
            subTitle="抱歉，页面发生了一些错误，请尝试刷新页面"
            extra={[
              <Button key="reset" onClick={this.handleReset}>
                重试
              </Button>,
              <Button key="reload" type="primary" onClick={this.handleReload}>
                刷新页面
              </Button>,
            ]}
          >
            {/* 【知识点】开发环境显示详细错误信息 */}
            {import.meta.env.DEV && (
              <div style={{ textAlign: 'left', marginTop: '20px' }}>
                <h4>错误信息：</h4>
                <pre style={{
                  background: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}>
                  {error?.toString()}
                  {errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      )
    }

    return children
  }
}

/**
 * =============================================================================
 * 【扩展知识】react-error-boundary 库
 * =============================================================================
 *
 * 社区提供了更强大的错误边界库：
 *
 * import { ErrorBoundary } from 'react-error-boundary'
 *
 * <ErrorBoundary
 *   FallbackComponent={ErrorFallback}
 *   onError={logError}
 *   onReset={() => {
 *     // 重置应用状态
 *   }}
 * >
 *   <App />
 * </ErrorBoundary>
 *
 * 优点：
 * 1. 支持函数组件 fallback
 * 2. 更好的重置机制
 * 3. useErrorHandler hook
 */
