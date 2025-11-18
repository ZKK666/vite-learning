/**
 * =============================================================================
 * Vite 特性演示页面 - 面试重点
 * =============================================================================
 *
 * 本页面演示 Vite 7 的核心特性，帮助你理解和应对面试
 */

import { useState } from 'react'
import { Card, Tabs, Typography, Space, Tag, Alert, Divider, Button } from 'antd'
import { ThunderboltOutlined, FileImageOutlined, SettingOutlined } from '@ant-design/icons'

// 【知识点】静态资源导入方式演示
// 导入图片
import viteLogo from '@/assets/images/vite.svg'
// 导入 CSS Modules
import styles from './ViteFeatures.module.less'

const { Title, Paragraph, Text } = Typography

export default function ViteFeatures() {
  const [activeKey, setActiveKey] = useState('1')

  return (
    <div className={styles.container}>
      <Title level={2}>
        <ThunderboltOutlined /> Vite 7 核心特性演示
      </Title>

      <Alert
        message="面试提示"
        description="本页面涵盖 Vite 面试中最常被问到的知识点，请仔细阅读代码注释"
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
            label: '静态资源处理',
            children: <AssetHandlingDemo />,
          },
          {
            key: '2',
            label: '环境变量',
            children: <EnvVariablesDemo />,
          },
          {
            key: '3',
            label: 'HMR 热更新',
            children: <HMRDemo />,
          },
          {
            key: '4',
            label: '依赖预构建',
            children: <PreBundlingDemo />,
          },
          {
            key: '5',
            label: '插件系统',
            children: <PluginSystemDemo />,
          },
        ]}
      />
    </div>
  )
}

/**
 * =============================================================================
 * 静态资源处理演示
 * =============================================================================
 */
function AssetHandlingDemo() {
  return (
    <Card title="静态资源处理">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】Vite 如何处理静态资源？
         * 答：
         * 1. 小于 assetsInlineLimit (4KB) 的资源内联为 base64
         * 2. 大于阈值的资源复制到 dist/assets
         * 3. 文件名添加 hash，便于缓存
         * 4. 支持 URL 导入、Raw 导入、Worker 导入
         */}
        <div>
          <Title level={4}>1. 图片导入方式</Title>
          <Paragraph>
            <Text code>import viteLogo from '@/assets/images/vite.svg'</Text>
          </Paragraph>
          <img src={viteLogo} alt="Vite Logo" width={100} />
        </div>

        <Divider />

        <div>
          <Title level={4}>2. URL 导入</Title>
          <Paragraph>
            <Text code>{`import imgUrl from './img.png'`}</Text>
            <br />
            返回解析后的 URL 字符串
          </Paragraph>
        </div>

        <Divider />

        <div>
          <Title level={4}>3. Raw 导入</Title>
          <Paragraph>
            <Text code>{`import txt from './file.txt?raw'`}</Text>
            <br />
            返回文件内容字符串
          </Paragraph>
        </div>

        <Divider />

        <div>
          <Title level={4}>4. Worker 导入</Title>
          <Paragraph>
            <Text code>{`import Worker from './worker.js?worker'`}</Text>
            <br />
            导入为 Web Worker
          </Paragraph>
        </div>

        <Divider />

        <div>
          <Title level={4}>5. public 目录</Title>
          <Paragraph>
            <ul>
              <li>不会被 Vite 处理</li>
              <li>必须使用绝对路径引用：<Text code>/favicon.ico</Text></li>
              <li>适合：favicon、robots.txt、不需要处理的资源</li>
            </ul>
          </Paragraph>
        </div>

        <Alert
          message="【面试重点】assetsInlineLimit 配置"
          description={
            <div>
              <p>默认值：4096 (4KB)</p>
              <p>小于此值的资源会被内联为 base64</p>
              <p>优点：减少 HTTP 请求</p>
              <p>缺点：增加 JS 包体积</p>
              <p>建议：根据项目情况调整，通常 4-10KB</p>
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
 * 环境变量演示
 * =============================================================================
 */
function EnvVariablesDemo() {
  return (
    <Card title="环境变量">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】Vite 环境变量的使用方式？
         * 答：
         * 1. 使用 import.meta.env 访问
         * 2. 只有 VITE_ 前缀的变量才会暴露
         * 3. 支持 .env、.env.local、.env.[mode] 文件
         */}
        <Title level={4}>当前环境变量</Title>

        <div className={styles.envList}>
          <div className={styles.envItem}>
            <Text strong>MODE：</Text>
            <Tag color="blue">{import.meta.env.MODE}</Tag>
          </div>
          <div className={styles.envItem}>
            <Text strong>DEV：</Text>
            <Tag color={import.meta.env.DEV ? 'green' : 'red'}>
              {String(import.meta.env.DEV)}
            </Tag>
          </div>
          <div className={styles.envItem}>
            <Text strong>PROD：</Text>
            <Tag color={import.meta.env.PROD ? 'green' : 'red'}>
              {String(import.meta.env.PROD)}
            </Tag>
          </div>
          <div className={styles.envItem}>
            <Text strong>BASE_URL：</Text>
            <Text code>{import.meta.env.BASE_URL}</Text>
          </div>
          <div className={styles.envItem}>
            <Text strong>VITE_APP_TITLE：</Text>
            <Text code>{import.meta.env.VITE_APP_TITLE}</Text>
          </div>
          <div className={styles.envItem}>
            <Text strong>VITE_API_BASE_URL：</Text>
            <Text code>{import.meta.env.VITE_API_BASE_URL}</Text>
          </div>
        </div>

        <Divider />

        <Alert
          message="【面试重点】环境变量加载顺序"
          description={
            <ol>
              <li>.env - 所有环境加载</li>
              <li>.env.local - 所有环境加载，被 git 忽略</li>
              <li>.env.[mode] - 特定模式加载</li>
              <li>.env.[mode].local - 特定模式加载，被 git 忽略</li>
            </ol>
          }
          type="info"
        />

        <Divider />

        <Alert
          message="【面试重点】安全注意事项"
          description={
            <div>
              <p>1. 只有 VITE_ 前缀的变量才会暴露到客户端</p>
              <p>2. 敏感信息（如密钥）不要使用 VITE_ 前缀</p>
              <p>3. 在 vite.config.ts 中可以访问所有环境变量</p>
            </div>
          }
          type="error"
        />
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * HMR 热更新演示
 * =============================================================================
 */
function HMRDemo() {
  const [count, setCount] = useState(0)

  return (
    <Card title="HMR 热模块替换">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】Vite HMR 的原理？
         * 答：
         * 1. Vite Dev Server 监听文件变化
         * 2. 确定受影响的模块边界
         * 3. 通过 WebSocket 通知浏览器
         * 4. 浏览器请求更新的模块
         * 5. 执行模块的 accept 回调
         */}
        <Title level={4}>HMR 状态保持演示</Title>
        <Paragraph>
          修改此文件的代码，观察以下计数器是否保持状态
        </Paragraph>

        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{count}</div>
          <Button type="primary" onClick={() => setCount(count + 1)}>
            增加计数
          </Button>
        </div>

        <Divider />

        <Alert
          message="【面试重点】HMR 原理"
          description={
            <div>
              <p><strong>Vite vs Webpack HMR 区别：</strong></p>
              <p>Webpack：编译整个 bundle，然后 HMR</p>
              <p>Vite：基于 ESM，只需要精确失活编辑的模块</p>
              <br />
              <p><strong>React Fast Refresh：</strong></p>
              <p>1. 只有函数组件和 Hooks 支持</p>
              <p>2. 保持组件状态</p>
              <p>3. 语法错误会自动恢复</p>
            </div>
          }
          type="info"
        />

        <Divider />

        <Title level={4}>手动 HMR API</Title>
        <Paragraph>
          <Text code>
{`if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 处理更新
  })
}`}
          </Text>
        </Paragraph>
      </Space>
    </Card>
  )
}

/**
 * =============================================================================
 * 依赖预构建演示
 * =============================================================================
 */
function PreBundlingDemo() {
  return (
    <Card title="依赖预构建">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】什么是 Vite 的预构建？为什么需要？
         * 答：
         * 1. 将 CommonJS/UMD 依赖转换为 ESM
         * 2. 将多个内部模块合并为单个模块（减少请求）
         * 3. 使用 esbuild 执行，速度极快
         *
         * 原因：
         * - 浏览器只支持 ESM
         * - 有些库有很多小模块（如 lodash-es）
         */}
        <Title level={4}>预构建的作用</Title>

        <Alert
          message="1. CommonJS 转 ESM"
          description="将 node_modules 中的 CommonJS 依赖转换为 ESM 格式"
          type="info"
        />

        <Alert
          message="2. 合并模块"
          description="将多个内部模块合并为单个模块，减少 HTTP 请求。例如 lodash-es 有 600+ 模块，合并后只需 1 个请求"
          type="info"
        />

        <Divider />

        <Title level={4}>预构建缓存</Title>
        <Paragraph>
          缓存位置：<Text code>node_modules/.vite</Text>
        </Paragraph>
        <Paragraph>
          重新构建条件：
          <ul>
            <li>package.json 的 dependencies 变化</li>
            <li>lockfile 变化</li>
            <li>vite.config.js 中相关配置变化</li>
          </ul>
        </Paragraph>

        <Divider />

        <Alert
          message="【面试重点】optimizeDeps 配置"
          description={
            <div>
              <p><strong>include：</strong>强制预构建</p>
              <p>- 动态导入的依赖</p>
              <p>- 未被检测到的依赖</p>
              <br />
              <p><strong>exclude：</strong>排除预构建</p>
              <p>- 已经是 ESM 的包</p>
              <p>- 需要运行时处理的包</p>
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
 * 插件系统演示
 * =============================================================================
 */
function PluginSystemDemo() {
  return (
    <Card title="插件系统">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/**
         * 【面试题】Vite 插件系统的特点？
         * 答：
         * 1. 兼容 Rollup 插件
         * 2. 扩展了 Vite 特有的钩子
         * 3. 支持条件应用（apply）
         * 4. 支持执行顺序控制（enforce）
         */}
        <Title level={4}>插件钩子执行顺序</Title>

        <div className={styles.hookList}>
          <Tag color="blue">1. config</Tag>
          <Tag color="blue">2. configResolved</Tag>
          <Tag color="green">3. configureServer (dev)</Tag>
          <Tag color="blue">4. transformIndexHtml</Tag>
          <Tag color="blue">5. resolveId</Tag>
          <Tag color="blue">6. load</Tag>
          <Tag color="blue">7. transform</Tag>
          <Tag color="orange">8. buildEnd (build)</Tag>
          <Tag color="orange">9. closeBundle (build)</Tag>
        </div>

        <Divider />

        <Title level={4}>自定义插件示例</Title>
        <Paragraph>
          <pre className={styles.codeBlock}>
{`// vite.config.ts
{
  name: 'my-plugin',

  // 只在特定命令执行
  apply: 'build', // or 'serve'

  // 执行顺序
  enforce: 'pre', // or 'post'

  // 修改配置
  config(config, { command, mode }) {
    return { ... }
  },

  // 转换代码
  transform(code, id) {
    if (id.endsWith('.vue')) {
      return { code: transformed }
    }
  },

  // 配置开发服务器
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // 自定义中间件
      next()
    })
  }
}`}
          </pre>
        </Paragraph>

        <Divider />

        <Alert
          message="【面试重点】常用 Vite 插件"
          description={
            <ul>
              <li>@vitejs/plugin-react - React 支持</li>
              <li>vite-plugin-compression - Gzip/Brotli 压缩</li>
              <li>vite-plugin-pwa - PWA 支持</li>
              <li>rollup-plugin-visualizer - 打包分析</li>
              <li>vite-plugin-svg-icons - SVG 雪碧图</li>
              <li>unplugin-auto-import - 自动导入</li>
            </ul>
          }
          type="info"
        />
      </Space>
    </Card>
  )
}
