/**
 * =============================================================================
 * 基础布局组件详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】如何设计后台管理系统的布局？
 * 答：
 * 1. 顶部导航栏（Header）：logo、全局操作、用户信息
 * 2. 侧边栏（Sider）：菜单导航
 * 3. 内容区（Content）：页面内容
 * 4. 面包屑：当前位置导航
 *
 * 【知识点】布局组件应该做什么？
 * 1. 处理整体布局结构
 * 2. 实现导航菜单
 * 3. 处理权限控制
 * 4. 管理页面状态（如侧边栏折叠）
 */

import { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation, useMatches } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Breadcrumb, Button, theme } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

import { useUserStore, useAppStore } from '@/store'
import styles from './BasicLayout.module.less'

const { Header, Sider, Content } = Layout

/**
 * 【知识点】菜单配置
 * 实际项目中通常从后端获取，这里简化为静态配置
 */
const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/user',
    icon: <UserOutlined />,
    label: '用户管理',
    children: [
      { key: '/user/list', label: '用户列表' },
    ],
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/role', label: '角色管理' },
      { key: '/system/menu', label: '菜单管理' },
    ],
  },
  {
    key: '/demo',
    icon: <ThunderboltOutlined />,
    label: '功能演示',
    children: [
      { key: '/demo/vite-features', label: 'Vite 特性' },
      { key: '/demo/performance', label: '性能优化' },
    ],
  },
]

export default function BasicLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const matches = useMatches()

  // 从 store 获取状态
  const { userInfo, logout } = useUserStore()
  const { collapsed, toggleCollapsed } = useAppStore()

  // Ant Design 主题 token
  const { token } = theme.useToken()

  // 当前选中的菜单和展开的菜单
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [openKeys, setOpenKeys] = useState<string[]>([])

  /**
   * 【知识点】根据路由同步菜单状态
   *
   * 【面试题】useEffect 的依赖数组应该怎么写？
   * 答：
   * 1. 包含所有在 effect 中使用的响应式值
   * 2. 使用 ESLint 规则 react-hooks/exhaustive-deps
   * 3. 不要撒谎：不要为了避免执行而省略依赖
   */
  useEffect(() => {
    // 设置选中的菜单项
    setSelectedKeys([location.pathname])

    // 展开父级菜单
    const pathParts = location.pathname.split('/').filter(Boolean)
    if (pathParts.length > 1) {
      setOpenKeys([`/${pathParts[0]}`])
    }
  }, [location.pathname])

  /**
   * 【知识点】生成面包屑数据
   * 使用 useMatches 获取路由匹配信息
   */
  const breadcrumbItems = matches
    .filter((match) => match.handle?.title)
    .map((match) => ({
      title: match.handle?.title as string,
      href: match.pathname,
    }))

  // 菜单点击处理
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout className={styles.layout}>
      {/**
       * 【知识点】Sider 侧边栏
       *
       * 【面试题】如何实现侧边栏折叠动画？
       * 答：
       * 1. Ant Design Sider 内置 collapsible 属性
       * 2. 使用 CSS transition 或 framer-motion
       */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={220}
        className={styles.sider}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <ThunderboltOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          {!collapsed && <span className={styles.logoText}>Vite Admin</span>}
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          onClick={handleMenuClick}
          items={menuItems}
          className={styles.menu}
        />
      </Sider>

      <Layout>
        {/* 顶部导航 */}
        <Header className={styles.header}>
          {/* 折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            className={styles.trigger}
          />

          {/* 面包屑 */}
          <Breadcrumb
            items={breadcrumbItems}
            className={styles.breadcrumb}
          />

          {/* 右侧操作区 */}
          <div className={styles.rightContent}>
            {/* 用户信息下拉菜单 */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userInfo}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={userInfo?.avatar}
                />
                <span className={styles.username}>
                  {userInfo?.nickname || userInfo?.username || 'Admin'}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content className={styles.content}>
          {/**
           * 【面试题】Outlet 的作用？
           * 答：
           * - 渲染当前路由匹配的子路由组件
           * - 类似 Vue Router 的 <router-view>
           * - 实现嵌套布局的关键
           */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

/**
 * =============================================================================
 * 【扩展知识】布局优化
 * =============================================================================
 *
 * 【实战经验】Keep-Alive 页面缓存
 * React 没有内置 Keep-Alive，需要：
 * 1. 使用 react-activation 库
 * 2. 手动实现（状态提升、缓存组件实例）
 *
 * 【实战经验】多标签页
 * 1. 使用 store 管理标签页列表
 * 2. 配合 Keep-Alive 实现页面缓存
 * 3. 需要处理标签页的增删改
 */
