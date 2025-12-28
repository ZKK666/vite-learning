# 前端权限安全最佳实践指南

## 🚨 核心原则

> **前端权限控制 ≠ 安全防护**

前端权限控制的本质：
- ✅ **提升用户体验** - 隐藏用户无权访问的菜单/按钮
- ✅ **减少误操作** - 避免用户点击无权限的功能
- ❌ **不能作为安全保障** - 前端代码可被任意修改

## 🔒 安全防护的正确姿势

### 1. 后端必须验证权限（最重要）

```typescript
// ❌ 错误示例：只在前端判断
// 前端
if (hasPermission('user:delete')) {
  await axios.delete('/api/users/123') // 后端不验证权限 ⚠️
}

// ✅ 正确示例：前端控制UI，后端验证权限
// 前端
if (hasPermission('user:delete')) {
  // 前端只控制按钮是否显示
  showDeleteButton()
}

// 用户点击删除时，无论前端是否判断，都会调用接口
await axios.delete('/api/users/123')

// 后端（必须验证）
app.delete('/api/users/:id', (req, res) => {
  // ✅ 后端必须验证权限
  if (!req.user.permissions.includes('user:delete')) {
    return res.status(403).json({ error: '无权限操作' })
  }
  // 执行删除
})
```

### 2. 前端多层防护策略

虽然前端无法做到绝对安全，但可以提高篡改成本：

#### 方案对比

| 方案 | 安全性 | 性能 | 复杂度 | 推荐度 |
|------|--------|------|--------|--------|
| 直接挂载到 `window` | ⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ❌ |
| `Object.freeze()` 冻结 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⚠️ |
| 闭包 + 私有字段 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ✅ |
| Symbol + WeakMap | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ |
| Proxy 拦截器 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ✅✅ |
| 加密存储 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ |

#### 推荐方案：Proxy 拦截器

```typescript
// 使用 Proxy 创建不可篡改的权限对象
const permissions = createSecurePermissions(['user:view', 'user:edit'])

// ✅ 允许的操作
permissions.has('user:view') // true
permissions.hasAny(['user:view', 'user:delete']) // true

// ❌ 阻止的操作
permissions.has = () => true // 警告：禁止修改权限对象
delete permissions.has // 警告：禁止删除权限属性
permissions.newMethod = () => {} // 警告：禁止定义新属性
```

## 📝 实战场景处理

### 场景1: 菜单权限控制

```typescript
// routes.ts
const routes = [
  {
    path: '/users',
    component: UserManagement,
    // 配置所需权限
    meta: { permission: 'user:view' }
  },
  {
    path: '/settings',
    component: Settings,
    meta: { permissions: ['system:config', 'system:edit'] } // 需要所有权限
  }
]

// 路由守卫
router.beforeEach((to, from, next) => {
  const { permission, permissions } = to.meta

  // 前端判断（只控制跳转）
  if (permission && !permissionManager.has(permission)) {
    return next('/403')
  }

  if (permissions && !permissionManager.hasAll(permissions)) {
    return next('/403')
  }

  next()
})

// ⚠️ 注意：后端接口仍需验证权限
```

### 场景2: 按钮权限控制

```tsx
// 使用组件
<PermissionGuard permission="user:delete">
  <button onClick={handleDelete}>删除</button>
</PermissionGuard>

// 使用 Hook
const { has } = usePermission()
{has('user:delete') && (
  <button onClick={handleDelete}>删除</button>
)}
```

### 场景3: 动态表格操作列

```tsx
const columns = [
  { title: '姓名', dataIndex: 'name' },
  { title: '年龄', dataIndex: 'age' },
  {
    title: '操作',
    render: (record) => (
      <>
        <PermissionGuard permission="user:edit">
          <a onClick={() => handleEdit(record)}>编辑</a>
        </PermissionGuard>
        <PermissionGuard permission="user:delete">
          <a onClick={() => handleDelete(record)}>删除</a>
        </PermissionGuard>
      </>
    )
  }
]
```

### 场景4: API 请求权限验证

```typescript
// 前端发起请求（不管有没有权限都可以发送）
async function deleteUser(userId: string) {
  try {
    await axios.delete(`/api/users/${userId}`)
    message.success('删除成功')
  } catch (error) {
    // 后端返回 403 时的处理
    if (error.response?.status === 403) {
      message.error('无权限操作')
      // 可选：刷新权限列表
      await refreshPermissions()
    }
  }
}
```

## 🛡️ 防御策略总结

### 三道防线

```
┌─────────────────────────────────────────────────────────┐
│  第一道防线：前端 UI 控制（用户体验）                    │
│  - 隐藏无权限的菜单/按钮                                 │
│  - 使用 Proxy/闭包等技术提高篡改成本                     │
│  - 路由守卫阻止未授权访问                                │
├─────────────────────────────────────────────────────────┤
│  第二道防线：前端请求拦截（额外防护）                    │
│  - 请求拦截器中检查权限                                  │
│  - 添加权限相关的请求头                                  │
│  - 对 403 响应进行统一处理                               │
├─────────────────────────────────────────────────────────┤
│  第三道防线：后端接口验证（核心安全）⭐⭐⭐               │
│  - 所有接口必须验证权限                                  │
│  - 验证失败返回 403 状态码                               │
│  - 记录未授权访问日志                                    │
└─────────────────────────────────────────────────────────┘
```

### 关键要点

1. ✅ **后端验证是唯一的安全保障**
2. ✅ 前端控制只是提升用户体验
3. ✅ 使用多层防护提高篡改成本
4. ✅ 权限数据不要直接暴露在 `window` 上
5. ✅ 敏感操作必须二次确认 + 后端验证
6. ✅ 记录所有权限相关的操作日志
7. ❌ 永远不要相信前端传来的权限信息

## 🔧 实施清单

- [ ] 后端所有接口都已添加权限验证
- [ ] 前端使用安全的权限存储方案（Proxy/闭包）
- [ ] 实现了路由守卫
- [ ] 实现了按钮/组件级别的权限控制
- [ ] 对 403 响应进行统一处理
- [ ] 添加了权限操作日志
- [ ] 进行了安全测试（尝试绕过前端限制）

## 📚 参考资料

- [OWASP - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [MDN - Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN - Symbol](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
