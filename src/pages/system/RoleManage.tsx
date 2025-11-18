/**
 * 角色管理页面
 */

import { Card, Table, Button, Space, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function RoleManage() {
  const columns = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色标识', dataIndex: 'code' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button type="link">编辑</Button>
          <Button type="link">权限</Button>
          <Button type="link" danger>删除</Button>
        </Space>
      ),
    },
  ]

  const data = [
    { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', status: 1 },
    { id: 2, name: '普通用户', code: 'user', description: '基础权限', status: 1 },
    { id: 3, name: '访客', code: 'guest', description: '只读权限', status: 0 },
  ]

  return (
    <Card
      title="角色管理"
      extra={<Button type="primary" icon={<PlusOutlined />}>新增角色</Button>}
    >
      <Table columns={columns} dataSource={data} rowKey="id" />
    </Card>
  )
}
