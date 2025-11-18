/**
 * 菜单管理页面
 */

import { Card, Tree, Button, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export default function MenuManage() {
  const treeData = [
    {
      title: '仪表盘',
      key: 'dashboard',
    },
    {
      title: '用户管理',
      key: 'user',
      children: [
        { title: '用户列表', key: 'user-list' },
      ],
    },
    {
      title: '系统管理',
      key: 'system',
      children: [
        { title: '角色管理', key: 'role' },
        { title: '菜单管理', key: 'menu' },
      ],
    },
  ]

  return (
    <Card
      title="菜单管理"
      extra={<Button type="primary" icon={<PlusOutlined />}>新增菜单</Button>}
    >
      <Tree
        showLine
        defaultExpandAll
        treeData={treeData}
        titleRender={(node) => (
          <Space>
            {node.title}
            <Button type="link" size="small">编辑</Button>
            <Button type="link" size="small" danger>删除</Button>
          </Space>
        )}
      />
    </Card>
  )
}
