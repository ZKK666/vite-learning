/**
 * =============================================================================
 * HMR 状态保留完整演示
 * =============================================================================
 *
 * 本文件演示各种场景下 React Fast Refresh 的状态保留能力
 */

import { useState, useEffect, useReducer, useRef } from 'react'
import { Card, Button, Space, Typography, Alert, Divider, Input } from 'antd'

const { Title, Text, Paragraph } = Typography

/**
 * =============================================================================
 * 场景 1：基础状态保留
 * =============================================================================
 *
 * ✅ 修改 JSX、样式、组件逻辑时，状态会保留
 *
 * 试试看：
 * 1. 点击按钮增加计数
 * 2. 修改下面的文字内容或按钮文字
 * 3. 保存文件，观察计数是否保留
 */
function BasicStatePreservation() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  return (
    <Card title="场景 1：基础状态保留" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={4}>计数器：{count}</Title>
          <Button
            type="primary"
            onClick={() => setCount(count + 1)}
          >
            增加计数（试着修改这段文字）
          </Button>
        </div>

        <div>
          <Input
            placeholder="输入一些文字，然后修改代码试试"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Text type="secondary">当前输入：{text}</Text>
        </div>

        <Alert
          message="✅ 状态保留的条件"
          description="修改 JSX 结构、文本、样式时，useState 的状态会保留"
          type="success"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 场景 2：多个 Hooks 状态
 * =============================================================================
 *
 * ✅ 所有 Hooks 的状态都会保留
 */
function MultipleHooksState() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('张三')
  const timerRef = useRef<number>(0)

  // 使用 useReducer
  const [state, dispatch] = useReducer(
    (state: { clicks: number }, action: { type: string }) => {
      switch (action.type) {
        case 'increment':
          return { clicks: state.clicks + 1 }
        default:
          return state
      }
    },
    { clicks: 0 }
  )

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      console.log('Timer running...')
    }, 5000)

    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <Card title="场景 2：多个 Hooks 状态" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>useState 计数: {count}</Text>
          <Button onClick={() => setCount(count + 1)} style={{ marginLeft: 8 }}>+1</Button>
        </div>

        <div>
          <Text>useState 名称: {name}</Text>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: 200, marginLeft: 8 }}
          />
        </div>

        <div>
          <Text>useReducer 点击次数: {state.clicks}</Text>
          <Button onClick={() => dispatch({ type: 'increment' })} style={{ marginLeft: 8 }}>
            点击
          </Button>
        </div>

        <Alert
          message="✅ 所有 Hooks 状态都会保留"
          description="useState、useReducer、useRef 等所有 Hooks 的状态在 HMR 时都会保留"
          type="success"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 场景 3：状态会丢失的情况
 * =============================================================================
 *
 * ❌ 以下操作会导致状态丢失：
 * 1. 修改组件名称
 * 2. 改变导出方式（default export ↔ named export）
 * 3. 组件函数签名变化（如添加/删除 props）
 */
function StateWillLost() {
  const [count, setCount] = useState(0)

  return (
    <Card title="场景 3：状态会丢失的情况" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={4}>计数：{count}</Title>
          <Button type="primary" onClick={() => setCount(count + 1)}>
            增加计数
          </Button>
        </div>

        <Alert
          message="❌ 这些操作会丢失状态"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>修改组件函数名 (StateWillLost → StateWillLost2)</li>
              <li>改变导出方式 (export default ↔ export function)</li>
              <li>添加或修改组件 Props 类型</li>
              <li>将函数组件改为类组件</li>
            </ul>
          }
          type="error"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 场景 4：自定义 HMR API
 * =============================================================================
 *
 * 使用 import.meta.hot API 手动控制 HMR 行为
 */
function CustomHMRDemo() {
  const [data, setData] = useState('初始数据')
  const [hmrCount, setHmrCount] = useState(0)

  // 自定义 HMR 处理
  if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
      console.log('🔥 HMR triggered!', newModule)
      setHmrCount(prev => prev + 1)
    })

    // 模块即将被替换时的回调
    import.meta.hot.dispose((data) => {
      console.log('♻️ Module disposing...', data)
    })
  }

  return (
    <Card title="场景 4：自定义 HMR API" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>数据: {data}</Text>
          <Input
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{ width: 300, marginLeft: 8 }}
          />
        </div>

        <div>
          <Text type="warning">HMR 触发次数: {hmrCount}</Text>
        </div>

        <Alert
          message="💡 import.meta.hot API"
          description={
            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
{`if (import.meta.hot) {
  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    // 处理更新逻辑
  })

  // 接受依赖更新
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 处理依赖更新
  })

  // 清理副作用
  import.meta.hot.dispose((data) => {
    // 保存需要持久化的数据
    data.someValue = xxx
  })

  // 模块失效时
  import.meta.hot.invalidate()
}`}
            </pre>
          }
          type="info"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 主组件
 * =============================================================================
 */
export default function HMRStateDemo() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🔥 Vite HMR 状态保留完整演示</Title>

      <Alert
        message="实验指南"
        description={
          <div>
            <p><strong>如何测试：</strong></p>
            <ol>
              <li>在各个组件中增加计数或输入内容</li>
              <li>修改代码（文字、样式、逻辑等）</li>
              <li>保存文件，观察状态是否保留</li>
            </ol>
            <p><strong>关键点：</strong>React Fast Refresh 会自动保留函数组件的 Hooks 状态</p>
          </div>
        }
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <BasicStatePreservation />
        <MultipleHooksState />
        <StateWillLost />
        <CustomHMRDemo />
      </Space>

      <Divider />

      <Card title="📚 HMR 原理总结" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={4}>1. Vite HMR 工作流程</Title>
            <Paragraph>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
{`1. 文件变化 (chokidar 监听)
   ↓
2. 模块图分析 (确定受影响的模块)
   ↓
3. HMR 边界确定 (找到 accept 的模块)
   ↓
4. WebSocket 推送更新通知
   ↓
5. 浏览器请求新模块 (基于 ESM)
   ↓
6. 执行模块替换和回调`}
              </pre>
            </Paragraph>
          </div>

          <div>
            <Title level={4}>2. React Fast Refresh 原理</Title>
            <Paragraph>
              <ul>
                <li><strong>组件注册：</strong>每个组件都被注册到全局注册表</li>
                <li><strong>状态保存：</strong>更新前保存当前组件的 Hooks 状态</li>
                <li><strong>组件更新：</strong>使用新代码重新渲染组件</li>
                <li><strong>状态恢复：</strong>将保存的状态恢复到新组件中</li>
              </ul>
            </Paragraph>
          </div>

          <div>
            <Title level={4}>3. 关键配置</Title>
            <Paragraph>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
{`// vite.config.ts
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    react({
      // 启用 Fast Refresh (默认开启)
      fastRefresh: true,

      // Babel 配置
      babel: {
        plugins: [
          // React Fast Refresh Babel 插件自动添加
        ]
      }
    })
  ],

  server: {
    // HMR 配置
    hmr: {
      overlay: true, // 错误覆盖层
      // port: 24678 // 自定义 HMR 端口
    }
  }
}`}
              </pre>
            </Paragraph>
          </div>
        </Space>
      </Card>
    </div>
  )
}
