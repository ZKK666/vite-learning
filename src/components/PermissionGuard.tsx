/**
 * 【实战经验】权限控制组件
 */

import { ReactNode } from 'react'
import { permissionManager } from '../utils/permission'

interface PermissionGuardProps {
  /** 需要的权限点 */
  permission?: string
  /** 需要的权限点列表（满足任意一个即可） */
  anyPermissions?: string[]
  /** 需要的权限点列表（必须全部满足） */
  allPermissions?: string[]
  /** 有权限时渲染的内容 */
  children: ReactNode
  /** 无权限时渲染的内容 */
  fallback?: ReactNode
}

/**
 * 权限守卫组件
 *
 * @example
 * ```tsx
 * // 单个权限
 * <PermissionGuard permission="user:delete">
 *   <button>删除用户</button>
 * </PermissionGuard>
 *
 * // 任意权限
 * <PermissionGuard anyPermissions={['user:edit', 'user:delete']}>
 *   <button>操作</button>
 * </PermissionGuard>
 *
 * // 所有权限
 * <PermissionGuard allPermissions={['user:edit', 'dept:view']}>
 *   <button>高级操作</button>
 * </PermissionGuard>
 *
 * // 带降级内容
 * <PermissionGuard permission="user:delete" fallback={<span>无权限</span>}>
 *   <button>删除</button>
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null
}: PermissionGuardProps) {
  let hasPermission = true

  if (permission) {
    hasPermission = permissionManager.has(permission)
  } else if (anyPermissions) {
    hasPermission = permissionManager.hasAny(anyPermissions)
  } else if (allPermissions) {
    hasPermission = permissionManager.hasAll(allPermissions)
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

/**
 * 权限 Hook
 */
export function usePermission() {
  return {
    has: (permission: string) => permissionManager.has(permission),
    hasAny: (permissions: string[]) => permissionManager.hasAny(permissions),
    hasAll: (permissions: string[]) => permissionManager.hasAll(permissions)
  }
}

/**
 * 使用示例组件
 */
export function UserManagementExample() {
  const { has } = usePermission()

  return (
    <div>
      <h2>用户管理</h2>

      {/* 方式1: 使用组件 */}
      <PermissionGuard permission="user:create">
        <button>新增用户</button>
      </PermissionGuard>

      <PermissionGuard permission="user:edit">
        <button>编辑用户</button>
      </PermissionGuard>

      <PermissionGuard permission="user:delete">
        <button>删除用户</button>
      </PermissionGuard>

      {/* 方式2: 使用 Hook */}
      {has('user:export') && (
        <button>导出用户</button>
      )}

      {/* 高级权限：需要同时拥有多个权限 */}
      <PermissionGuard allPermissions={['user:view', 'dept:view', 'role:view']}>
        <button>高级查询</button>
      </PermissionGuard>

      {/* 任意权限：拥有任意一个即可 */}
      <PermissionGuard anyPermissions={['user:edit', 'user:delete']}>
        <button>批量操作</button>
      </PermissionGuard>
    </div>
  )
}
