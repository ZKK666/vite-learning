/**
 * 【实战经验】前端权限管理方案
 *
 * 安全原则：
 * 1. 前端权限只控制 UI 展示，不能作为安全保障
 * 2. 真正的权限验证必须在后端接口层面
 * 3. 前端采用多层防护，提高篡改成本
 */

// ======================== 方案一：闭包 + Proxy 防护 ========================

/**
 * 使用闭包隐藏真实权限数据，通过 Proxy 拦截修改
 */
class PermissionManager {
  // 使用 # 私有字段（无法从外部访问）
  #permissions: Set<string> = new Set()
  #initialized = false

  /**
   * 初始化权限（只能调用一次）
   */
  init(permissions: string[]): void {
    if (this.#initialized) {
      console.warn('权限已初始化，不允许重复设置')
      return
    }
    this.#permissions = new Set(permissions)
    this.#initialized = true
    Object.freeze(this) // 冻结实例，防止添加新属性
  }

  /**
   * 检查是否有某个权限
   */
  has(permission: string): boolean {
    return this.#permissions.has(permission)
  }

  /**
   * 检查是否有多个权限中的任意一个
   */
  hasAny(permissions: string[]): boolean {
    return permissions.some(p => this.#permissions.has(p))
  }

  /**
   * 检查是否拥有所有权限
   */
  hasAll(permissions: string[]): boolean {
    return permissions.every(p => this.#permissions.has(p))
  }

  /**
   * 获取所有权限（返回冻结的数组副本）
   */
  getAll(): readonly string[] {
    return Object.freeze([...this.#permissions])
  }
}

// 创建单例实例
export const permissionManager = new PermissionManager()

// ======================== 方案二：Symbol + WeakMap 加密存储 ========================

const PERMISSION_KEY = Symbol('permissions')
const permissionStore = new WeakMap<object, Set<string>>()

export const securePermission = {
  /**
   * 初始化权限（使用 Symbol 和 WeakMap 双重隐藏）
   */
  init(permissions: string[]): void {
    const token = { [PERMISSION_KEY]: true }
    permissionStore.set(token, new Set(permissions))

    // 将 token 存储在闭包中，外部无法访问
    ;(window as any).__PERMISSION_TOKEN__ = Object.freeze(token)
  },

  /**
   * 检查权限
   */
  has(permission: string): boolean {
    const token = (window as any).__PERMISSION_TOKEN__
    if (!token) return false

    const permissions = permissionStore.get(token)
    return permissions?.has(permission) ?? false
  },

  /**
   * 检查多个权限
   */
  hasAny(permissions: string[]): boolean {
    return permissions.some(p => this.has(p))
  },

  hasAll(permissions: string[]): boolean {
    return permissions.every(p => this.has(p))
  }
}

// ======================== 方案三：加密存储 ========================

/**
 * 简单的异或加密（可替换为更强的加密算法）
 */
class EncryptedPermission {
  private readonly SECRET_KEY = Math.random().toString(36)
  private encryptedData = ''

  /**
   * 加密字符串
   */
  private encrypt(data: string): string {
    return btoa(
      data.split('').map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length))
      ).join('')
    )
  }

  /**
   * 解密字符串
   */
  private decrypt(encrypted: string): string {
    try {
      return atob(encrypted).split('').map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ this.SECRET_KEY.charCodeAt(i % this.SECRET_KEY.length))
      ).join('')
    } catch {
      return ''
    }
  }

  /**
   * 初始化权限
   */
  init(permissions: string[]): void {
    this.encryptedData = this.encrypt(JSON.stringify(permissions))
  }

  /**
   * 检查权限
   */
  has(permission: string): boolean {
    try {
      const permissions = JSON.parse(this.decrypt(this.encryptedData))
      return Array.isArray(permissions) && permissions.includes(permission)
    } catch {
      return false
    }
  }
}

export const encryptedPermission = new EncryptedPermission()

// ======================== 方案四：Object.defineProperty 不可重写（推荐）========================

/**
 * 创建真正不可篡改的权限对象
 * 使用 Object.defineProperty 防止整个属性被重写
 */
export function createSecurePermissions(permissions: string[]) {
  const permissionSet = new Set(permissions)

  // 创建权限对象
  const permissionObj = Object.freeze({
    has: (permission: string) => permissionSet.has(permission),
    hasAny: (perms: string[]) => perms.some(p => permissionSet.has(p)),
    hasAll: (perms: string[]) => perms.every(p => permissionSet.has(p)),
    list: () => Object.freeze([...permissionSet])
  })

  // 使用 Proxy 拦截对象本身的修改
  const proxy = new Proxy(permissionObj, {
    set() {
      console.warn('⚠️ 禁止修改权限对象属性')
      return false
    },
    deleteProperty() {
      console.warn('⚠️ 禁止删除权限属性')
      return false
    },
    defineProperty() {
      console.warn('⚠️ 禁止定义新属性')
      return false
    },
    setPrototypeOf() {
      console.warn('⚠️ 禁止修改原型')
      return false
    }
  })

  // 🔒 关键：使用 Object.defineProperty 定义为不可配置、不可写
  Object.defineProperty(window, '__permissions__', {
    value: proxy,
    writable: false,       // 不可写（不能重新赋值）
    configurable: false,   // 不可配置（不能删除或修改属性描述符）
    enumerable: true       // 可枚举
  })

  return proxy
}

// ======================== 方案五：完全隐藏（最安全）========================

/**
 * 不暴露到 window，只通过模块导出使用
 * 这是最安全的方式，因为完全不给用户修改的机会
 */
const hiddenPermissions = (() => {
  let permissionSet = new Set<string>()
  let initialized = false

  return {
    init(permissions: string[]) {
      if (initialized) {
        console.warn('权限已初始化')
        return
      }
      permissionSet = new Set(permissions)
      initialized = true
    },
    has(permission: string): boolean {
      return permissionSet.has(permission)
    },
    hasAny(permissions: string[]): boolean {
      return permissions.some(p => permissionSet.has(p))
    },
    hasAll(permissions: string[]): boolean {
      return permissions.every(p => permissionSet.has(p))
    },
    getAll(): readonly string[] {
      return Object.freeze([...permissionSet])
    }
  }
})()

// 完全不暴露到 window，只能通过导入使用
export { hiddenPermissions }

// ======================== React Hook 集成 ========================

/**
 * React Hook 示例
 */
export function usePermission() {
  return {
    hasPermission: (permission: string) => permissionManager.has(permission),
    hasAnyPermission: (permissions: string[]) => permissionManager.hasAny(permissions),
    hasAllPermissions: (permissions: string[]) => permissionManager.hasAll(permissions)
  }
}

// ======================== 使用示例 ========================

/**
 * 初始化示例（在应用启动时调用）
 */
export async function initPermissions() {
  try {
    // 从后端获取权限
    const response = await fetch('/api/user/permissions')
    const { permissions } = await response.json()

    // 方案一：使用 PermissionManager
    permissionManager.init(permissions)

    // 方案二：使用 Symbol + WeakMap
    // securePermission.init(permissions)

    // 方案三：使用加密存储
    // encryptedPermission.init(permissions)

    // 方案四：使用 Proxy（推荐）
    const securePerms = createSecurePermissions(permissions)
    ;(window as any).__permissions__ = securePerms

  } catch (error) {
    console.error('权限初始化失败:', error)
  }
}

// ======================== 防御性编程建议 ========================

/**
 * 【重要】后端接口必须验证权限
 *
 * 前端示例：
 * ```typescript
 * // ❌ 错误做法：只在前端判断
 * if (hasPermission('user:delete')) {
 *   await deleteUser(userId) // 后端不验证权限
 * }
 *
 * // ✅ 正确做法：前端控制UI，后端验证权限
 * if (hasPermission('user:delete')) {
 *   // 前端只控制按钮是否显示
 *   showDeleteButton()
 * }
 *
 * // 后端接口仍然会验证权限
 * await deleteUser(userId) // 后端会返回 403 如果无权限
 * ```
 *
 * 后端示例（Node.js）：
 * ```typescript
 * app.delete('/api/user/:id', async (req, res) => {
 *   // 必须验证权限
 *   if (!req.user.hasPermission('user:delete')) {
 *     return res.status(403).json({ error: '无权限' })
 *   }
 *   // 执行删除操作
 * })
 * ```
 */
