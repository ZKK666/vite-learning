/**
 * =============================================================================
 * 认证页面布局
 * =============================================================================
 *
 * 【知识点】认证页面通常使用独立布局
 * - 不需要侧边栏和顶部导航
 * - 简洁的居中布局
 * - 背景装饰
 */

import { Outlet } from 'react-router-dom'
import styles from './AuthLayout.module.less'

export default function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      {/* 背景装饰 */}
      <div className={styles.background}>
        <div className={styles.shape1} />
        <div className={styles.shape2} />
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* Logo 和标题 */}
        <div className={styles.header}>
          <h1 className={styles.title}>Vite Admin</h1>
          <p className={styles.subtitle}>React 18 + Vite 7 企业级后台管理系统</p>
        </div>

        {/* 登录/注册表单 */}
        <div className={styles.formContainer}>
          <Outlet />
        </div>

        {/* 页脚 */}
        <div className={styles.footer}>
          <p>&copy; 2024 Vite Admin. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
