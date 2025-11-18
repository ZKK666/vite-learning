/**
 * =============================================================================
 * 性能优化演示页面 - 面试重点
 * =============================================================================
 *
 * 本页面演示 Vite 项目的性能优化策略
 */

import { useState, useCallback, useMemo, memo, lazy, Suspense, startTransition } from 'react'
import { Card, Tabs, Typography, Space, Alert, Divider, Button, Input, Spin } from 'antd'
import { RocketOutlined } from '@ant-design/icons'

import styles from './PerformanceDemo.module.less'

const { Title, Paragraph, Text } = Typography

export default function PerformanceDemo() {
  const [activeKey, setActiveKey] = useState('1')

  return (
    <div className={styles.container}>
      <Title level={2}>
        <RocketOutlined /> 性能优化策略演示
      </Title>

      <Alert
        message="面试高频考点"
        description="性能优化是前端面试必考内容，请重点掌握本页面的知识点"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
        items={[
          {
            key: '1',
            label: '代码分割',
            children: <CodeSplittingDemo />,
          },
          {
            key: '2',
            label: 'React 性能优化',
            children: <ReactOptimizationDemo />,
          },
          {
            key: '3',
            label: '打包优化',
            children: <BuildOptimizationDemo />,
          },
          {
            key: '4',
            label: '运行时优化',
            children: <RuntimeOptimizationDemo />,
          },
        ]}
      />
    </div>
  )
}

/**
 * =============================================================================
 * 代码分割演示
 * =============================================================================
 */
function CodeSplittingDemo() {
  const [showLazyComponent, setShowLazyComponent] = useState(false)

  // 【知识点】动态导入
  const HeavyComponent = lazy(() => import('./HeavyComponent'))

  return (
    <Card title="代码分割 (Code Splitting)">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】什么是代码分割？有哪些实现方式？
         * 答：
         * 定义：将代码拆分成多个 bundle，按需加载
         *
         * 实现方式：
         * 1. 入口点分割（多入口）
         * 2. 动态导入（import()）
         * 3. React.lazy + Suspense
         * 4. manualChunks 配置
         */}
        <Title level={4}>1. 路由级别分割</Title>
        <Paragraph>
          <pre className={styles.codeBlock}>
{`// 路由懒加载
const Dashboard = lazy(() => import('@/pages/dashboard'))

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>`}
          </pre>
        </Paragraph>

        <Divider />

        <Title level={4}>2. 组件级别分割演示</Title>
        <Button
          type="primary"
          onClick={() => setShowLazyComponent(!showLazyComponent)}
        >
          {showLazyComponent ? '隐藏' : '加载'} 重型组件
        </Button>

        {showLazyComponent && (
          <Suspense fallback={<Spin tip="加载组件中..." />}>
            <HeavyComponent />
          </Suspense>
        )}

        <Divider />

        <Alert
          message="【面试重点】manualChunks 配置"
          description={
            <pre className={styles.codeBlock}>
{`// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // 第三方库分离
        'react-vendor': ['react', 'react-dom'],
        'antd-vendor': ['antd'],
        // 按业务模块分离
        'utils': ['lodash-es', 'dayjs']
      }
    }
  }
}`}
            </pre>
          }
          type="warning"
        />

        <Divider />

        <Alert
          message="【最佳实践】分割策略"
          description={
            <ul>
              <li>1. 路由级别：每个路由一个 chunk</li>
              <li>2. 大型第三方库单独 chunk</li>
              <li>3. 公共依赖提取（splitVendorChunkPlugin）</li>
              <li>4. 避免过度分割导致请求过多</li>
            </ul>
          }
          type="info"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * React 性能优化演示
 * =============================================================================
 */
function ReactOptimizationDemo() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  // 【知识点】useMemo 缓存计算结果
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...')
    return count * 2
  }, [count])

  // 【知识点】useCallback 缓存函数
  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  return (
    <Card title="React 性能优化">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】React 性能优化的方法？
         * 答：
         * 1. React.memo - 组件记忆化
         * 2. useMemo - 计算结果缓存
         * 3. useCallback - 函数缓存
         * 4. 合理拆分组件
         * 5. 使用 key
         * 6. 虚拟列表
         * 7. 懒加载
         */}
        <Title level={4}>1. React.memo 演示</Title>

        <div className={styles.demoBox}>
          <Input
            placeholder="输入内容不会导致 ExpensiveList 重渲染"
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <MemoizedExpensiveList count={count} />
          <Button onClick={handleClick}>增加 Count</Button>
        </div>

        <Divider />

        <Title level={4}>2. useMemo & useCallback</Title>
        <Paragraph>
          <Text strong>Expensive Value: {expensiveValue}</Text>
          <br />
          （只有 count 变化时才会重新计算）
        </Paragraph>

        <Divider />

        <Alert
          message="【面试重点】何时使用 memo/useMemo/useCallback？"
          description={
            <div>
              <p><strong>React.memo：</strong></p>
              <p>- 组件渲染成本高</p>
              <p>- 父组件频繁更新但 props 不变</p>
              <br />
              <p><strong>useMemo：</strong></p>
              <p>- 计算成本高的值</p>
              <p>- 作为其他 Hook 的依赖</p>
              <p>- 作为 memo 组件的 props</p>
              <br />
              <p><strong>useCallback：</strong></p>
              <p>- 函数作为 memo 组件的 props</p>
              <p>- 函数作为 useEffect 的依赖</p>
            </div>
          }
          type="warning"
        />

        <Divider />

        <Title level={4}>3. React 18 startTransition</Title>
        <TransitionDemo />
      </Space>
    </Card>
  )
}

// 【知识点】使用 memo 包裹组件
interface ExpensiveListProps {
  count: number
}

const ExpensiveList = ({ count }: ExpensiveListProps) => {
  console.log('ExpensiveList rendered')

  // 模拟昂贵的渲染
  const _items = Array.from({ length: count }, (_, i) => `Item ${i + 1}`)

  return (
    <div className={styles.listBox}>
      <Text type="secondary">渲染了 {count} 个项目（生成了 {_items.length} 项）</Text>
    </div>
  )
}

const MemoizedExpensiveList = memo(ExpensiveList)

// startTransition 演示
function TransitionDemo() {
  const [isPending, setIsPending] = useState(false)
  const [list, setList] = useState<string[]>([])

  const handleClick = () => {
    setIsPending(true)
    // 【知识点】startTransition 标记非紧急更新
    startTransition(() => {
      const newList = Array.from({ length: 10000 }, (_, i) => `Item ${i}`)
      setList(newList)
      setIsPending(false)
    })
  }

  // 显示列表长度以使用 list 变量
  const listLength = list.length

  return (
    <div>
      <Button onClick={handleClick} loading={isPending}>
        加载 10000 条数据
      </Button>
      <Paragraph>
        <Text type="secondary">
          使用 startTransition 不会阻塞用户交互
          {listLength > 0 && `（已加载 ${listLength} 条）`}
        </Text>
      </Paragraph>
    </div>
  )
}

/**
 * =============================================================================
 * 打包优化演示
 * =============================================================================
 */
function BuildOptimizationDemo() {
  return (
    <Card title="打包优化">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>1. Tree Shaking</Title>
        <Alert
          message="【面试题】什么是 Tree Shaking？"
          description={
            <div>
              <p>定义：移除 JavaScript 中未使用的代码</p>
              <p>原理：基于 ES Module 的静态结构分析</p>
              <br />
              <p><strong>生效条件：</strong></p>
              <ul>
                <li>使用 ES Module（import/export）</li>
                <li>包的 package.json 设置 sideEffects</li>
                <li>不要使用 import * as xxx</li>
              </ul>
            </div>
          }
          type="info"
        />

        <Divider />

        <Title level={4}>2. 压缩配置</Title>
        <pre className={styles.codeBlock}>
{`// vite.config.ts
build: {
  // 使用 esbuild 压缩（默认，更快）
  minify: 'esbuild',

  // 或使用 terser（压缩率更高）
  // minify: 'terser',
  // terserOptions: {
  //   compress: {
  //     drop_console: true, // 移除 console
  //     drop_debugger: true // 移除 debugger
  //   }
  // }
}`}
        </pre>

        <Divider />

        <Title level={4}>3. 资源压缩</Title>
        <pre className={styles.codeBlock}>
{`// vite-plugin-compression
import compression from 'vite-plugin-compression'

plugins: [
  compression({
    algorithm: 'gzip',
    threshold: 10240, // 10KB
  }),
  compression({
    algorithm: 'brotliCompress',
    ext: '.br',
  })
]`}
        </pre>

        <Divider />

        <Alert
          message="【面试重点】打包分析"
          description={
            <div>
              <p>使用 rollup-plugin-visualizer 分析打包结果：</p>
              <p><Text code>npm run build:analyze</Text></p>
              <br />
              <p>关注点：</p>
              <ul>
                <li>大型依赖是否可以替换</li>
                <li>是否有重复打包</li>
                <li>代码分割是否合理</li>
              </ul>
            </div>
          }
          type="warning"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 运行时优化演示
 * =============================================================================
 */
function RuntimeOptimizationDemo() {
  return (
    <Card title="运行时优化">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>1. 预加载策略</Title>
        <pre className={styles.codeBlock}>
{`<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="/fonts/custom.woff2" as="font">

<!-- 预获取下一页资源 -->
<link rel="prefetch" href="/next-page.js">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com">`}
        </pre>

        <Divider />

        <Title level={4}>2. 缓存策略</Title>
        <Alert
          message="【面试重点】HTTP 缓存配置"
          description={
            <div>
              <p><strong>Vite 构建产物：</strong></p>
              <p>- 带 hash 的资源：强缓存 1 年</p>
              <p>- index.html：协商缓存</p>
              <br />
              <p><strong>Nginx 配置示例：</strong></p>
              <pre className={styles.codeBlockSmall}>
{`location /assets {
  add_header Cache-Control "public, max-age=31536000";
}
location / {
  add_header Cache-Control "no-cache";
}`}
              </pre>
            </div>
          }
          type="info"
        />

        <Divider />

        <Title level={4}>3. 图片优化</Title>
        <ul>
          <li>使用 WebP/AVIF 格式</li>
          <li>响应式图片（srcset）</li>
          <li>懒加载（loading="lazy"）</li>
          <li>CDN 加速</li>
          <li>图片压缩（vite-plugin-imagemin）</li>
        </ul>

        <Divider />

        <Alert
          message="【面试重点】性能指标"
          description={
            <div>
              <p><strong>Core Web Vitals：</strong></p>
              <ul>
                <li>LCP (Largest Contentful Paint) &lt; 2.5s</li>
                <li>FID (First Input Delay) &lt; 100ms</li>
                <li>CLS (Cumulative Layout Shift) &lt; 0.1</li>
              </ul>
              <br />
              <p><strong>优化建议：</strong></p>
              <ul>
                <li>LCP：优化最大内容元素加载</li>
                <li>FID：减少主线程阻塞</li>
                <li>CLS：为图片设置尺寸</li>
              </ul>
            </div>
          }
          type="warning"
        />
      </Space>
    </Card>
  )
}
