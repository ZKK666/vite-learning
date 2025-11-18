/**
 * =============================================================================
 * 仪表盘页面
 * =============================================================================
 */

import { Card, Row, Col, Statistic, Typography, Space, Tag } from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

import styles from './index.module.less'

const { Title, Paragraph, Text } = Typography

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Title level={3}>仪表盘</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={8846}
              prefix={<UserOutlined />}
              suffix={<Tag color="green">+12%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={1234}
              prefix={<ShoppingCartOutlined />}
              suffix={<Tag color="blue">+8%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={56789}
              prefix={<DollarOutlined />}
              precision={2}
              suffix={<Tag color="green">+23%</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="转化率"
              value={12.5}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 项目说明 */}
      <Card title="项目说明" style={{ marginTop: 16 }}>
        <Space direction="vertical" size="middle">
          <div>
            <Title level={5}>
              <ThunderboltOutlined /> Vite 7 + React 18 学习项目
            </Title>
            <Paragraph>
              本项目是一个面向面试的 Vite 学习项目，包含了大量面试知识点和实战经验。
            </Paragraph>
          </div>

          <div>
            <Text strong>主要学习内容：</Text>
            <ul>
              <li>Vite 核心原理和配置</li>
              <li>性能优化策略</li>
              <li>React 18 新特性</li>
              <li>TypeScript 最佳实践</li>
              <li>企业级项目架构</li>
            </ul>
          </div>

          <div>
            <Text strong>推荐学习路径：</Text>
            <ol>
              <li>阅读 <Text code>vite.config.ts</Text> 了解 Vite 配置</li>
              <li>查看 <Text code>src/router</Text> 了解路由配置</li>
              <li>查看 <Text code>src/store</Text> 了解状态管理</li>
              <li>访问【Vite 特性】页面学习核心概念</li>
              <li>访问【性能优化】页面学习优化策略</li>
            </ol>
          </div>
        </Space>
      </Card>
    </div>
  )
}
