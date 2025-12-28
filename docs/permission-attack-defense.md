# 前端权限攻击与防御详解

## 🎯 你发现的漏洞

```typescript
// 即使使用 Proxy 保护了权限对象
const securePerms = createSecurePermissions(['user:view', 'user:edit'])
window.__permissions__ = securePerms

// ❌ 但用户仍然可以直接重写整个对象！
window.__permissions__ = {
  has: () => true,
  hasAny: () => true,
  hasAll: () => true
}

// 现在用户拥有所有权限！
window.__permissions__.has('admin:delete') // true 💥
```

**你说得对！** 这是一个严重的安全漏洞。

## 🔒 正确的防御方案

### 方案对比

| 攻击方式 | 直接赋值 | Proxy | Object.defineProperty | 完全隐藏 |
|---------|---------|-------|---------------------|---------|
| `window.__permissions__ = { has: () => true }` | ❌ 可以 | ❌ 可以 | ✅ **不可以** | ✅ **不可以** |
| `window.__permissions__.has = () => true` | ❌ 可以 | ✅ 不可以 | ✅ 不可以 | ✅ 不可以 |
| `delete window.__permissions__` | ❌ 可以 | ❌ 可以 | ✅ **不可以** | ✅ **不可以** |
| 通过控制台访问 | ❌ 可以 | ❌ 可以 | ❌ 可以 | ✅ **不可以** |

### 方案 1: Object.defineProperty（推荐，如需挂载到 window）

```typescript
export function createSecurePermissions(permissions: string[]) {
  const permissionSet = new Set(permissions)

  const permissionObj = Object.freeze({
    has: (permission: string) => permissionSet.has(permission),
    hasAny: (perms: string[]) => perms.some(p => permissionSet.has(p)),
    hasAll: (perms: string[]) => perms.every(p => permissionSet.has(p)),
    list: () => Object.freeze([...permissionSet])
  })

  const proxy = new Proxy(permissionObj, {
    set() {
      console.warn('⚠️ 禁止修改权限对象属性')
      return false
    },
    deleteProperty() {
      console.warn('⚠️ 禁止删除权限属性')
      return false
    }
  })

  // 🔒 关键：使用 Object.defineProperty 防止整个属性被重写
  Object.defineProperty(window, '__permissions__', {
    value: proxy,
    writable: false,       // ✅ 不可写（不能重新赋值）
    configurable: false,   // ✅ 不可配置（不能删除或修改描述符）
    enumerable: true
  })

  return proxy
}
```

**防御效果测试：**

```javascript
// ✅ 尝试重写 - 静默失败（非严格模式）或抛出错误（严格模式）
window.__permissions__ = { has: () => true }
console.log(window.__permissions__.has('admin:delete')) // false（防御成功）

// ✅ 尝试删除 - 失败
delete window.__permissions__
console.log(window.__permissions__) // 仍然存在（防御成功）

// ✅ 尝试重新定义 - 抛出错误
Object.defineProperty(window, '__permissions__', {
  value: { has: () => true }
})
// TypeError: Cannot redefine property: __permissions__
```

### 方案 2: 完全隐藏（最安全，推荐）

**不暴露到 window，只通过模块导出使用：**

```typescript
// permission.ts
const hiddenPermissions = (() => {
  let permissionSet = new Set<string>()

  return {
    init(permissions: string[]) {
      permissionSet = new Set(permissions)
    },
    has(permission: string): boolean {
      return permissionSet.has(permission)
    },
    hasAny(permissions: string[]): boolean {
      return permissions.some(p => permissionSet.has(p))
    },
    hasAll(permissions: string[]): boolean {
      return permissions.every(p => permissionSet.has(p))
    }
  }
})()

export { hiddenPermissions }
```

**使用方式：**

```typescript
// ✅ 只能通过导入使用
import { hiddenPermissions } from './utils/permission'

hiddenPermissions.has('user:view')

// ❌ 无法从 window 访问
console.log(window.__permissions__) // undefined

// ❌ 无法在控制台篡改
// 用户无法访问到 permissionSet 变量（封装在闭包中）
```

### 方案 3: PermissionManager 类（推荐）

```typescript
class PermissionManager {
  // 使用 # 私有字段（真正的私有）
  #permissions: Set<string> = new Set()
  #initialized = false

  init(permissions: string[]): void {
    if (this.#initialized) {
      console.warn('权限已初始化，不允许重复设置')
      return
    }
    this.#permissions = new Set(permissions)
    this.#initialized = true
    Object.freeze(this) // 冻结实例
  }

  has(permission: string): boolean {
    return this.#permissions.has(permission)
  }

  hasAny(permissions: string[]): boolean {
    return permissions.some(p => this.#permissions.has(p))
  }

  hasAll(permissions: string[]): boolean {
    return permissions.every(p => this.#permissions.has(p))
  }
}

export const permissionManager = new PermissionManager()
```

**防御效果：**

```javascript
// ✅ 无法重新初始化
permissionManager.init(['user:view'])
permissionManager.init(['admin:delete']) // 警告：权限已初始化

// ✅ 无法访问私有字段
permissionManager.#permissions // SyntaxError: Private field '#permissions'
                                // must be declared in an enclosing class

// ✅ 无法添加新方法
permissionManager.hackMethod = () => true // 失败（实例已冻结）
```

## 🧪 安全性测试

运行以下测试验证各方案的安全性：

```typescript
import { runSecurityTests, printSecurityComparison } from './examples/permission-security-test'

// 在浏览器控制台运行
window.__runPermissionSecurityTests__()
```

测试结果：

```
==========================================================
🔒 权限系统安全性测试
==========================================================

【场景 1】直接赋值到 window（❌ 不安全）
  ❌ 攻击成功！权限被完全替换

【场景 2】使用 Object.defineProperty（✅ 较安全）
  ✅ 防御成功：window.__permissions__ 未被修改
  ✅ 防御成功：属性未被删除
  ✅ 攻击失败：Cannot redefine property

【场景 3】完全隐藏（✅ 最安全）
  ✅ 防御成功：权限完全不暴露在 window 上

【场景 4】使用 PermissionManager 类（✅ 推荐）
  ✅ 防御成功：不允许重复初始化
  ✅ 攻击失败：无法访问私有字段
==========================================================
```

## 📊 方案推荐

### 1️⃣ 最佳方案：完全隐藏 + PermissionManager

```typescript
// 初始化
import { permissionManager } from './utils/permission'

async function initApp() {
  const permissions = await fetch('/api/user/permissions').then(r => r.json())
  permissionManager.init(permissions)
}

// 使用
import { permissionManager } from './utils/permission'

function UserManagement() {
  const canDelete = permissionManager.has('user:delete')

  return (
    <>
      {canDelete && <button>删除</button>}
    </>
  )
}
```

**优点：**
- ✅ 无法从 window 访问
- ✅ 无法篡改权限数据（私有字段）
- ✅ 无法重新初始化
- ✅ 使用方便（通过导入）

**缺点：**
- ⚠️ 必须通过导入使用，不能在控制台直接访问（这其实是优点）

### 2️⃣ 次选方案：Object.defineProperty

如果确实需要挂载到 window（比如要在控制台调试）：

```typescript
createSecurePermissions(permissions) // 自动挂载到 window.__permissions__
```

**优点：**
- ✅ 防止整个对象被重写
- ✅ 防止属性被删除
- ✅ 防止属性被修改
- ✅ 可以在控制台访问（调试方便）

**缺点：**
- ⚠️ 仍然暴露在 window 上（虽然不可修改）

## 🚨 核心原则（再次强调）

无论使用哪种方案，都要记住：

```
┌─────────────────────────────────────────────────┐
│  前端权限控制 = 用户体验优化                     │
│  前端权限控制 ≠ 安全防护                        │
│                                                 │
│  真正的安全 = 后端接口权限验证 ⭐⭐⭐            │
└─────────────────────────────────────────────────┘
```

### 为什么后端验证是必须的？

即使使用了上述所有防御措施，黑客仍然可以：

1. **修改浏览器源码** - 修改 Chrome/Firefox 源码绕过所有前端限制
2. **使用 curl/Postman** - 直接调用 API，完全绕过前端
3. **修改网络请求** - 使用 Burp Suite 等工具修改请求
4. **反编译代码** - 解析混淆后的 JS 代码

**因此：**

```typescript
// ❌ 错误的安全观念
if (hasPermission('user:delete')) {
  // 前端检查通过，后端不验证
  await deleteUser(userId) // 危险！
}

// ✅ 正确的安全观念
if (hasPermission('user:delete')) {
  // 前端只控制按钮是否显示
  showDeleteButton()
}

// 无论前端是否检查，后端必须验证
app.delete('/api/users/:id', authenticate, requirePermission('user:delete'), ...)
```

## 🎓 实战建议

1. **开发环境** - 使用 `PermissionManager` 或 `hiddenPermissions`，不暴露到 window
2. **调试需要** - 使用 `Object.defineProperty` 方案，可在控制台访问但不可修改
3. **生产环境** - 确保后端所有接口都有权限验证
4. **代码混淆** - 使用 Terser 等工具混淆前端代码（增加逆向成本）
5. **日志监控** - 记录所有权限拒绝的操作，及时发现异常

## 总结

感谢你发现了这个漏洞！这个问题展示了前端安全的核心挑战：

> **前端代码完全运行在用户的浏览器中，用户对其拥有完全控制权。**

因此，真正的安全防护必须在后端，前端只是第一道防线（用户体验优化），而不是最后一道防线。
