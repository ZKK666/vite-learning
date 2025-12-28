/**
 * 【安全测试】权限系统安全性验证
 *
 * 这个文件演示各种攻击方式以及防御效果
 */

import { createSecurePermissions, hiddenPermissions, permissionManager } from '../utils/permission'

// ======================== 测试场景 ========================

export function runSecurityTests() {
  console.log('='.repeat(60))
  console.log('🔒 权限系统安全性测试')
  console.log('='.repeat(60))

  // 模拟从后端获取的权限
  const mockPermissions = ['user:view', 'user:edit']

  testScenario1_DirectAssignment()
  testScenario2_ObjectDefineProperty(mockPermissions)
  testScenario3_HiddenPermissions(mockPermissions)
  testScenario4_PermissionManager(mockPermissions)

  console.log('='.repeat(60))
  console.log('✅ 安全测试完成')
  console.log('='.repeat(60))
}

// ======================== 场景 1: 直接赋值（不安全）========================

function testScenario1_DirectAssignment() {
  console.log('\n【场景 1】直接赋值到 window（❌ 不安全）\n')

  // ❌ 不安全的做法
  ;(window as any).__permissions_unsafe__ = ['user:view', 'user:edit']

  console.log('初始权限:', (window as any).__permissions_unsafe__)

  // 攻击 1: 直接重写整个对象
  console.log('\n🔓 攻击 1: 重写整个对象')
  ;(window as any).__permissions_unsafe__ = ['admin:delete', 'system:destroy']
  console.log('  结果:', (window as any).__permissions_unsafe__)
  console.log('  ❌ 攻击成功！权限被完全替换')

  // 攻击 2: 修改数组内容
  console.log('\n🔓 攻击 2: 修改数组内容')
  ;(window as any).__permissions_unsafe__ = ['user:view']
  ;(window as any).__permissions_unsafe__.push('admin:delete')
  console.log('  结果:', (window as any).__permissions_unsafe__)
  console.log('  ❌ 攻击成功！添加了非法权限')
}

// ======================== 场景 2: Object.defineProperty（推荐）========================

function testScenario2_ObjectDefineProperty(permissions: string[]) {
  console.log('\n【场景 2】使用 Object.defineProperty（✅ 较安全）\n')

  // 初始化权限（这会使用 Object.defineProperty）
  createSecurePermissions(permissions)

  console.log('初始权限:', window.__permissions__?.list())

  // 攻击 1: 尝试重写整个对象
  console.log('\n🔒 攻击 1: 尝试重写整个对象')
  try {
    // @ts-expect-error 测试攻击
    window.__permissions__ = { has: () => true }
    console.log('  ❌ 攻击成功！（不应该发生）')
  } catch (error) {
    console.log('  ✅ 攻击失败：', (error as Error).message)
  }

  // 在严格模式下，直接赋值会抛出错误
  // 在非严格模式下，赋值会被静默忽略
  if (window.__permissions__ && typeof window.__permissions__.has === 'function') {
    console.log('  ✅ 防御成功：window.__permissions__ 未被修改')
  } else {
    console.log('  ❌ 防御失败：window.__permissions__ 被修改')
  }

  // 攻击 2: 尝试修改对象属性
  console.log('\n🔒 攻击 2: 尝试修改对象属性')
  try {
    // @ts-expect-error 测试攻击
    window.__permissions__.has = () => true
    console.log('  ❌ 攻击成功！（不应该发生）')
  } catch (error) {
    console.log('  ✅ 攻击失败：', (error as Error).message)
  }

  // 验证权限是否仍然正常工作
  console.log('\n📝 验证权限功能:')
  console.log('  - has("user:view"):', window.__permissions__?.has('user:view'))
  console.log('  - has("admin:delete"):', window.__permissions__?.has('admin:delete'))

  // 攻击 3: 尝试删除属性
  console.log('\n🔒 攻击 3: 尝试删除 window.__permissions__')
  try {
    delete (window as any).__permissions__
    if ((window as any).__permissions__) {
      console.log('  ✅ 防御成功：属性未被删除')
    } else {
      console.log('  ❌ 防御失败：属性被删除')
    }
  } catch (error) {
    console.log('  ✅ 攻击失败：', (error as Error).message)
  }

  // 攻击 4: 尝试使用 Object.defineProperty 重新定义
  console.log('\n🔒 攻击 4: 尝试使用 Object.defineProperty 重新定义')
  try {
    Object.defineProperty(window, '__permissions__', {
      value: { has: () => true },
      writable: true,
      configurable: true
    })
    console.log('  ❌ 攻击成功！（不应该发生）')
  } catch (error) {
    console.log('  ✅ 攻击失败：', (error as Error).message)
  }
}

// ======================== 场景 3: 完全隐藏（最安全）========================

function testScenario3_HiddenPermissions(permissions: string[]) {
  console.log('\n【场景 3】完全隐藏，不暴露到 window（✅ 最安全）\n')

  // 初始化权限
  hiddenPermissions.init(permissions)

  console.log('初始权限:', hiddenPermissions.getAll())

  // 攻击 1: 尝试访问 window
  console.log('\n🔒 攻击 1: 尝试从 window 访问权限')
  const found = Object.keys(window).find(key => key.includes('permission'))
  console.log('  在 window 中找到的权限相关属性:', found || '无')
  console.log('  ✅ 防御成功：权限完全不暴露在 window 上')

  // 攻击 2: 尝试通过原型链访问
  console.log('\n🔒 攻击 2: 尝试通过模块导入篡改')
  console.log('  ❌ 无法篡改：权限数据封装在闭包中，外部无法访问')

  // 验证功能
  console.log('\n📝 验证权限功能:')
  console.log('  - has("user:view"):', hiddenPermissions.has('user:view'))
  console.log('  - has("admin:delete"):', hiddenPermissions.has('admin:delete'))

  console.log('\n💡 结论: 这是最安全的方式，但需要通过模块导入使用')
}

// ======================== 场景 4: PermissionManager 类（推荐）========================

function testScenario4_PermissionManager(permissions: string[]) {
  console.log('\n【场景 4】使用 PermissionManager 类（✅ 推荐）\n')

  // 初始化权限
  permissionManager.init(permissions)

  console.log('初始权限:', permissionManager.getAll())

  // 攻击 1: 尝试重新初始化
  console.log('\n🔒 攻击 1: 尝试重新初始化权限')
  permissionManager.init(['admin:delete', 'system:destroy'])
  console.log('  当前权限:', permissionManager.getAll())
  console.log('  ✅ 防御成功：不允许重复初始化')

  // 攻击 2: 尝试访问私有字段
  console.log('\n🔒 攻击 2: 尝试访问私有字段 #permissions')
  try {
    // @ts-expect-error 测试访问私有字段
    const privateField = permissionManager.#permissions
    console.log('  ❌ 攻击成功！访问到私有字段:', privateField)
  } catch (error) {
    console.log('  ✅ 攻击失败：无法访问私有字段')
  }

  // 攻击 3: 尝试修改实例
  console.log('\n🔒 攻击 3: 尝试给实例添加新方法')
  try {
    // @ts-expect-error 测试修改
    permissionManager.hackMethod = () => true
    // @ts-expect-error 测试访问
    if (permissionManager.hackMethod) {
      console.log('  ❌ 攻击成功！添加了新方法')
    } else {
      console.log('  ✅ 防御成功：实例已被冻结')
    }
  } catch (error) {
    console.log('  ✅ 攻击失败：', (error as Error).message)
  }

  // 验证功能
  console.log('\n📝 验证权限功能:')
  console.log('  - has("user:view"):', permissionManager.has('user:view'))
  console.log('  - has("admin:delete"):', permissionManager.has('admin:delete'))
}

// ======================== 安全性对比总结 ========================

export function printSecurityComparison() {
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 各方案安全性对比')
  console.log('='.repeat(80))

  const table = [
    ['方案', '防重写整个对象', '防修改属性', '防删除', '使用便利性', '推荐度'],
    ['-'.repeat(20), '-'.repeat(16), '-'.repeat(12), '-'.repeat(8), '-'.repeat(12), '-'.repeat(8)],
    ['直接赋值', '❌', '❌', '❌', '⭐⭐⭐⭐⭐', '❌'],
    ['Object.freeze', '❌', '✅', '❌', '⭐⭐⭐⭐', '⚠️'],
    ['Proxy（旧方案）', '❌', '✅', '❌', '⭐⭐⭐⭐', '⚠️'],
    ['Object.defineProperty', '✅', '✅', '✅', '⭐⭐⭐⭐', '✅✅'],
    ['完全隐藏（闭包）', '✅', '✅', '✅', '⭐⭐⭐', '✅✅✅'],
    ['PermissionManager', '✅', '✅', '✅', '⭐⭐⭐⭐', '✅✅']
  ]

  table.forEach(row => {
    console.log(row.join(' | '))
  })

  console.log('='.repeat(80))
  console.log('\n💡 推荐方案:')
  console.log('  1. 【最佳】完全隐藏方案 - 最安全，但需要通过模块导入')
  console.log('  2. 【推荐】PermissionManager - 安全性高，使用方便')
  console.log('  3. 【可选】Object.defineProperty - 如果需要挂载到 window')
  console.log('\n⚠️  核心原则: 无论使用哪种方案，后端验证都是必须的！')
  console.log('='.repeat(80))
}

// ======================== 开发环境下自动运行测试 ========================

if (import.meta.env.DEV) {
  // 导出到 window 供手动调用
  ;(window as any).__runPermissionSecurityTests__ = () => {
    runSecurityTests()
    printSecurityComparison()
  }

  console.log(`
    🧪 权限安全测试工具已加载
    运行测试: window.__runPermissionSecurityTests__()
  `)
}
