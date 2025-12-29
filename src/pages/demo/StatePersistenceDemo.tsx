/**
 * =============================================================================
 * 状态持久化完整演示
 * =============================================================================
 *
 * 本文件演示如何将 React 组件状态保存为 JSON 并恢复
 * 适用场景：
 * - 页面刷新后恢复状态
 * - 保存用户草稿
 * - 时间旅行调试
 * - 会话恢复
 */

import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Space, Typography, Alert, Input, Form, message, Divider } from 'antd'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

/**
 * =============================================================================
 * 方案 1：手动保存/恢复状态
 * =============================================================================
 */
function ManualPersistence() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    age: 0,
  })

  // 导出状态为 JSON
  const exportState = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: formData,
    }

    const json = JSON.stringify(snapshot, null, 2)
    console.log('📸 状态快照:', snapshot)

    // 下载为文件
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `state-snapshot-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    message.success('状态已导出为 JSON 文件')
  }

  // 导入 JSON 恢复状态
  const importState = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const snapshot = JSON.parse(e.target?.result as string)
        setFormData(snapshot.data)
        message.success(`状态已恢复！保存时间: ${new Date(snapshot.timestamp).toLocaleString()}`)
      } catch (error) {
        message.error('JSON 格式错误')
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card title="方案 1：手动保存/恢复" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="姓名"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          placeholder="邮箱"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          type="number"
          placeholder="年龄"
          value={formData.age || ''}
          onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
        />
        <TextArea
          placeholder="个人简介"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
        />

        <Space>
          <Button type="primary" onClick={exportState}>
            💾 导出状态快照
          </Button>
          <Button>
            <label style={{ cursor: 'pointer' }}>
              📂 导入状态快照
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={importState}
              />
            </label>
          </Button>
        </Space>

        <Alert
          message="快照格式示例"
          description={
            <pre style={{ background: '#f5f5f5', padding: 8, margin: 0 }}>
{`{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "data": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "age": 25,
    "bio": "前端工程师"
  }
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
 * 方案 2：自动持久化到 LocalStorage
 * =============================================================================
 */

// 自定义 Hook：自动持久化到 localStorage
function usePersistedState<T>(key: string, initialValue: T) {
  // 初始化时从 localStorage 读取
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // 状态变化时自动保存到 localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }, [key, state])

  // 清除持久化数据
  const clearPersistedState = useCallback(() => {
    window.localStorage.removeItem(key)
    setState(initialValue)
  }, [key, initialValue])

  return [state, setState, clearPersistedState] as const
}

function AutoPersistence() {
  const [formData, setFormData, clearFormData] = usePersistedState('auto-form-data', {
    username: '',
    password: '',
    rememberMe: false,
  })

  return (
    <Card title="方案 2：自动持久化（LocalStorage）" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="✨ 自动保存"
          description="输入内容会自动保存到 LocalStorage，刷新页面后状态保留！"
          type="success"
        />

        <Input
          placeholder="用户名"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <Input.Password
          placeholder="密码"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <Space>
          <Button type="primary" onClick={() => message.success('状态已自动保存！')}>
            查看自动保存状态
          </Button>
          <Button danger onClick={() => {
            clearFormData()
            message.success('已清除持久化数据')
          }}>
            清除保存的数据
          </Button>
        </Space>

        <Alert
          message="实现原理"
          description={
            <pre style={{ background: '#f5f5f5', padding: 8, margin: 0, fontSize: 12 }}>
{`function usePersistedState(key, initialValue) {
  // 1. 初始化时从 localStorage 读取
  const [state, setState] = useState(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })

  // 2. 状态变化时自动保存
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
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
 * 方案 3：完整页面状态快照
 * =============================================================================
 */

interface PageState {
  counter: number
  todos: Array<{ id: number; text: string; completed: boolean }>
  userInput: string
  settings: {
    theme: string
    notifications: boolean
  }
}

function FullPageSnapshot() {
  const [pageState, setPageState] = useState<PageState>({
    counter: 0,
    todos: [],
    userInput: '',
    settings: {
      theme: 'light',
      notifications: true,
    },
  })

  const [snapshotHistory, setSnapshotHistory] = useState<Array<{
    id: number
    timestamp: string
    state: PageState
  }>>([])

  // 创建快照
  const createSnapshot = () => {
    const snapshot = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      state: structuredClone(pageState), // 深拷贝
    }

    setSnapshotHistory([snapshot, ...snapshotHistory])
    message.success(`快照已创建 (共 ${snapshotHistory.length + 1} 个)`)
  }

  // 恢复快照
  const restoreSnapshot = (snapshot: typeof snapshotHistory[0]) => {
    setPageState(structuredClone(snapshot.state))
    message.success(`已恢复到 ${new Date(snapshot.timestamp).toLocaleString()}`)
  }

  // 导出所有快照
  const exportAllSnapshots = () => {
    const data = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      currentState: pageState,
      history: snapshotHistory,
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-snapshots-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card title="方案 3：完整页面状态快照（时间旅行）" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 模拟页面状态 */}
        <div>
          <Title level={5}>计数器: {pageState.counter}</Title>
          <Space>
            <Button onClick={() => setPageState({ ...pageState, counter: pageState.counter + 1 })}>
              +1
            </Button>
            <Button onClick={() => setPageState({ ...pageState, counter: pageState.counter - 1 })}>
              -1
            </Button>
          </Space>
        </div>

        <Input
          placeholder="输入一些文字"
          value={pageState.userInput}
          onChange={(e) => setPageState({ ...pageState, userInput: e.target.value })}
        />

        <Divider />

        {/* 快照控制 */}
        <Space>
          <Button type="primary" onClick={createSnapshot}>
            📸 创建快照
          </Button>
          <Button onClick={exportAllSnapshots}>
            💾 导出所有快照
          </Button>
          <Button danger onClick={() => setSnapshotHistory([])}>
            清空历史
          </Button>
        </Space>

        {/* 快照历史 */}
        {snapshotHistory.length > 0 && (
          <div>
            <Title level={5}>快照历史 ({snapshotHistory.length})</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              {snapshotHistory.slice(0, 5).map((snapshot) => (
                <Card key={snapshot.id} size="small" style={{ background: '#f9f9f9' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text strong>
                      {new Date(snapshot.timestamp).toLocaleString()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      计数器: {snapshot.state.counter} | 输入: "{snapshot.state.userInput}"
                    </Text>
                    <Button size="small" onClick={() => restoreSnapshot(snapshot)}>
                      ⏮️ 恢复此快照
                    </Button>
                  </Space>
                </Card>
              ))}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 主组件
 * =============================================================================
 */
export default function StatePersistenceDemo() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>💾 React 状态持久化完整方案</Title>

      <Alert
        message="核心概念"
        description={
          <div>
            <p><strong>状态序列化：</strong>将 React state 转换为可存储的 JSON 格式</p>
            <p><strong>状态反序列化：</strong>从 JSON 恢复到 React state</p>
            <p><strong>应用场景：</strong>页面刷新恢复、草稿保存、时间旅行调试、会话恢复</p>
          </div>
        }
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <ManualPersistence />
        <AutoPersistence />
        <FullPageSnapshot />
      </Space>

      <Divider />

      <Card title="📚 技术总结" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Title level={4}>1. 序列化注意事项</Title>
            <ul>
              <li>✅ 可序列化：字符串、数字、布尔值、数组、普通对象</li>
              <li>❌ 不可序列化：函数、Date、Set、Map、循环引用</li>
              <li>💡 解决方案：使用 replacer/reviver 函数自定义序列化</li>
            </ul>
          </div>

          <div>
            <Title level={4}>2. 存储方案对比</Title>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
{`┌──────────────┬─────────┬──────────┬──────────┐
│ 方案         │ 容量    │ 生命周期 │ 适用场景 │
├──────────────┼─────────┼──────────┼──────────┤
│ localStorage │ 5-10MB  │ 永久     │ 长期保存 │
│ sessionStorage│ 5-10MB │ 会话     │ 临时数据 │
│ IndexedDB    │ 无限制  │ 永久     │ 大量数据 │
│ Cookie       │ 4KB     │ 可设置   │ 少量数据 │
└──────────────┴─────────┴──────────┴──────────┘`}
            </pre>
          </div>

          <div>
            <Title level={4}>3. 最佳实践</Title>
            <Paragraph>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
{`// ✅ 推荐：版本化快照
const snapshot = {
  version: '1.0',           // 版本号，用于迁移
  timestamp: Date.now(),    // 时间戳
  data: state,              // 实际数据
  metadata: { ... }         // 元数据
}

// ✅ 推荐：错误处理
try {
  const data = JSON.parse(localStorage.getItem('key'))
  setState(data)
} catch (error) {
  // 降级到默认值
  setState(defaultValue)
}

// ✅ 推荐：深拷贝避免引用
const snapshot = structuredClone(state) // 现代浏览器
// 或
const snapshot = JSON.parse(JSON.stringify(state))

// ❌ 避免：直接保存整个组件树
// React 内部状态和引用无法序列化`}
              </pre>
            </Paragraph>
          </div>

          <div>
            <Title level={4}>4. 生产级方案</Title>
            <ul>
              <li><strong>Redux Persist:</strong> Redux 状态持久化</li>
              <li><strong>Zustand persist middleware:</strong> 轻量级状态管理 + 持久化</li>
              <li><strong>Jotai atomWithStorage:</strong> 原子化状态 + 自动持久化</li>
              <li><strong>TanStack Query:</strong> 服务端状态缓存</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  )
}
