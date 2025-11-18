/**
 * 用户详情页面
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Button, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <Card
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
          用户详情
        </Space>
      }
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="用户ID">{id}</Descriptions.Item>
        <Descriptions.Item label="用户名">user{id}</Descriptions.Item>
        <Descriptions.Item label="邮箱">user{id}@example.com</Descriptions.Item>
        <Descriptions.Item label="状态">正常</Descriptions.Item>
        <Descriptions.Item label="角色">admin</Descriptions.Item>
        <Descriptions.Item label="创建时间">2024-01-01</Descriptions.Item>
      </Descriptions>
    </Card>
  )
}
