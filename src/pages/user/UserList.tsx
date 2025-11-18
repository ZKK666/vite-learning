/**
 * =============================================================================
 * 用户列表页面 - 表格示例
 * =============================================================================
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Card, Button, Space, Input, Tag, Modal, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

interface User {
  id: number
  username: string
  email: string
  status: 'active' | 'inactive'
  roles: string[]
  createTime: string
}

// 模拟数据
const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: i % 3 === 0 ? 'inactive' : 'active',
  roles: i % 2 === 0 ? ['admin'] : ['user'],
  createTime: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function UserList() {
  const navigate = useNavigate()
  const [loading] = useState(false)
  const [searchText, setSearchText] = useState('')

  // 过滤数据
  const filteredData = mockUsers.filter(
    user =>
      user.username.includes(searchText) ||
      user.email.includes(searchText)
  )

  // 删除确认
  const handleDelete = (_id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: () => {
        // 实际项目中这里会调用删除 API，传入 _id
        message.success('删除成功')
      },
    })
  }

  // 表格列配置
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <Space>
          {roles.map(role => (
            <Tag key={role} color="blue">{role}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/user/detail/${record.id}`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="用户列表"
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          新增用户
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索用户名或邮箱"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredData.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />
    </Card>
  )
}
