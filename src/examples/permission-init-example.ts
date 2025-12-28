/**
 * 【实战案例】权限系统初始化示例
 *
 * 这个文件展示如何在实际项目中初始化和使用权限系统
 */

import { permissionManager, createSecurePermissions } from '../utils/permission'

// ======================== 1. 应用启动时初始化权限 ========================

/**
 * 模拟从后端获取用户权限
 */
async function fetchUserPermissions(): Promise<string[]> {
  // 实际项目中，这里会调用真实的后端接口
  const response = await fetch('/api/user/permissions', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (!response.ok) {
    throw new Error('获取权限失败')
  }

  const data = await response.json()
  return data.permissions || []
}

/**
 * 初始化权限系统（在 main.tsx 中调用）
 *
 * 推荐方案：只使用 permissionManager，不暴露到 window
 */
export async function initPermissionSystem() {
  try {
    // 1. 从后端获取权限列表
    const permissions = await fetchUserPermissions()

    console.log('📋 用户权限:', permissions)

    // 2. 初始化权限管理器（推荐方式）
    permissionManager.init(permissions)

    console.log('✅ 权限系统初始化成功')

    // 3. 验证权限是否正确初始化
    console.log('📝 权限验证示例:')
    console.log('  - 是否有 user:view 权限:', permissionManager.has('user:view'))
    console.log('  - 是否有 user:delete 权限:', permissionManager.has('user:delete'))

    return true
  } catch (error) {
    console.error('❌ 权限初始化失败:', error)
    // 初始化失败时，可以设置默认权限或跳转到登录页
    return false
  }
}

/**
 * 初始化权限系统（如果需要挂载到 window 用于调试）
 *
 * ⚠️ 注意：这会使用 Object.defineProperty 防止整个属性被重写
 */
export async function initPermissionSystemWithWindow() {
  try {
    // 1. 从后端获取权限列表
    const permissions = await fetchUserPermissions()

    console.log('📋 用户权限:', permissions)

    // 2. 初始化权限管理器
    permissionManager.init(permissions)

    // 3. 使用 Object.defineProperty 挂载到 window（防止被重写）
    createSecurePermissions(permissions) // 内部已使用 defineProperty

    console.log('✅ 权限系统初始化成功（已挂载到 window.__permissions__）')

    // 4. 验证权限是否正确初始化
    console.log('📝 权限验证示例:')
    console.log('  - window.__permissions__.has("user:view"):', window.__permissions__?.has('user:view'))
    console.log('  - window.__permissions__.has("user:delete"):', window.__permissions__?.has('user:delete'))

    // 5. 测试安全性
    console.log('\n🔒 安全测试:')

    // 测试 1: 尝试修改权限方法
    try {
      // @ts-expect-error 测试修改权限方法
      window.__permissions__.has = () => true
      console.log('  ⚠️ 测试1失败: 权限方法被修改')
    } catch (error) {
      console.log('  ✅ 测试1通过: 权限方法修改被阻止')
    }

    // 测试 2: 尝试重写整个对象（关键测试！）
    const originalPermissions = window.__permissions__
    // @ts-expect-error 测试重写对象
    window.__permissions__ = { has: () => true, hasAny: () => true, hasAll: () => true }

    if (window.__permissions__ === originalPermissions) {
      console.log('  ✅ 测试2通过: window.__permissions__ 无法被重写')
    } else {
      console.log('  ⚠️ 测试2失败: window.__permissions__ 被重写')
    }

    // 测试 3: 尝试删除属性
    const beforeDelete = window.__permissions__
    delete (window as any).__permissions__
    if (window.__permissions__ === beforeDelete) {
      console.log('  ✅ 测试3通过: window.__permissions__ 无法被删除')
    } else {
      console.log('  ⚠️ 测试3失败: window.__permissions__ 被删除')
    }

    return true
  } catch (error) {
    console.error('❌ 权限初始化失败:', error)
    return false
  }
}

// ======================== 2. 实际使用示例 ========================

/**
 * 示例：删除用户
 */
export async function deleteUserExample(userId: string) {
  // 前端判断（仅用于 UI 控制）
  if (!permissionManager.has('user:delete')) {
    console.warn('⚠️ 前端检测：无删除权限')
    // 在实际应用中，这里可能不会执行，因为按钮已被隐藏
    return
  }

  try {
    // 调用后端接口（后端会再次验证权限）
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.status === 403) {
      // 后端返回无权限
      console.error('❌ 后端验证：无删除权限')
      alert('您没有权限执行此操作')
      return
    }

    if (!response.ok) {
      throw new Error('删除失败')
    }

    console.log('✅ 删除成功')
    alert('删除成功')
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('操作失败，请稍后重试')
  }
}

/**
 * 示例：批量操作（需要多个权限）
 */
export async function batchOperationExample(userIds: string[]) {
  // 检查是否拥有所有必需的权限
  const requiredPermissions = ['user:view', 'user:edit', 'user:delete']

  if (!permissionManager.hasAll(requiredPermissions)) {
    const missingPermissions = requiredPermissions.filter(
      p => !permissionManager.has(p)
    )
    console.warn('⚠️ 缺少权限:', missingPermissions)
    alert(`您缺少以下权限：${missingPermissions.join(', ')}`)
    return
  }

  // 执行批量操作
  console.log('执行批量操作...')
}

/**
 * 示例：权限刷新（用户角色变更后）
 */
export async function refreshPermissions() {
  try {
    const permissions = await fetchUserPermissions()

    // 重新初始化权限（注意：permissionManager.init 只允许调用一次）
    // 在实际项目中，你可能需要修改 PermissionManager 类，添加 reset 方法

    // 临时方案：重新创建 window.__permissions__
    window.__permissions__ = createSecurePermissions(permissions)

    console.log('✅ 权限已刷新')
  } catch (error) {
    console.error('❌ 权限刷新失败:', error)
  }
}

// ======================== 3. 调试工具 ========================

/**
 * 开发环境下的权限调试工具
 */
export const permissionDebugger = {
  /**
   * 查看当前所有权限
   */
  listAll() {
    const permissions = permissionManager.getAll()
    console.table(permissions.map(p => ({ permission: p })))
  },

  /**
   * 检查单个权限
   */
  check(permission: string) {
    const has = permissionManager.has(permission)
    console.log(`权限 "${permission}": ${has ? '✅ 有' : '❌ 无'}`)
    return has
  },

  /**
   * 检查多个权限
   */
  checkMultiple(permissions: string[]) {
    console.log('权限检查结果:')
    permissions.forEach(p => {
      this.check(p)
    })
  },

  /**
   * 测试权限篡改保护
   */
  testSecurity() {
    console.log('🔒 安全测试开始...\n')

    const tests = [
      {
        name: '尝试修改权限方法',
        test: () => {
          // @ts-expect-error 测试修改
          window.__permissions__.has = () => true
        }
      },
      {
        name: '尝试删除权限属性',
        test: () => {
          // @ts-expect-error 测试删除
          delete window.__permissions__.has
        }
      },
      {
        name: '尝试添加新方法',
        test: () => {
          // @ts-expect-error 测试添加
          window.__permissions__.hackMethod = () => true
        }
      }
    ]

    tests.forEach(({ name, test }) => {
      try {
        test()
        console.log(`❌ ${name}: 失败（未被阻止）`)
      } catch (error) {
        console.log(`✅ ${name}: 成功阻止`)
      }
    })

    console.log('\n🔒 安全测试完成')
  }
}

// ======================== 4. 在开发环境下暴露调试工具 ========================

if (import.meta.env.DEV) {
  // @ts-expect-error 开发工具
  window.__permissionDebugger__ = permissionDebugger

  console.log(`
    🛠️ 权限调试工具已加载
    使用方法：
    - window.__permissionDebugger__.listAll()          // 查看所有权限
    - window.__permissionDebugger__.check('user:view') // 检查单个权限
    - window.__permissionDebugger__.testSecurity()     // 测试安全性
  `)
}

// ======================== 5. React 18 集成示例 ========================

/**
 * 在 main.tsx 中的使用示例
 */
/*
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initPermissionSystem } from './examples/permission-init-example'

async function bootstrap() {
  // 1. 初始化权限系统
  const permissionReady = await initPermissionSystem()

  if (!permissionReady) {
    // 权限初始化失败，跳转到登录页
    window.location.href = '/login'
    return
  }

  // 2. 渲染应用
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

bootstrap()
*/
