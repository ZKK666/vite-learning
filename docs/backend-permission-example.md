# 后端权限验证示例（Node.js + Express）

> 🚨 **重要**：前端权限控制只是 UI 层面的优化，真正的安全保障必须在后端！

## 完整的后端权限验证方案

### 1. 权限中间件

```typescript
// middleware/permission.ts
import { Request, Response, NextFunction } from 'express'

/**
 * 扩展 Express Request 类型
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        permissions: string[]
        roles: string[]
      }
    }
  }
}

/**
 * 权限验证中间件
 * @param requiredPermission 需要的权限点
 */
export function requirePermission(requiredPermission: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. 检查用户是否已登录
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '未登录',
        data: null
      })
    }

    // 2. 获取用户权限
    const userPermissions = req.user.permissions || []

    // 3. 检查权限
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission]

    const hasPermission = permissions.some(permission =>
      userPermissions.includes(permission)
    )

    if (!hasPermission) {
      // 4. 记录未授权访问日志（重要！）
      console.warn(`[权限拒绝] 用户 ${req.user.username} 尝试访问需要 [${permissions.join(', ')}] 权限的接口`)

      return res.status(403).json({
        code: 403,
        message: '无权限访问',
        data: {
          required: permissions,
          current: userPermissions
        }
      })
    }

    // 5. 权限验证通过
    next()
  }
}

/**
 * 要求拥有所有权限
 */
export function requireAllPermissions(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录' })
    }

    const userPermissions = req.user.permissions || []
    const hasAllPermissions = permissions.every(p =>
      userPermissions.includes(p)
    )

    if (!hasAllPermissions) {
      const missing = permissions.filter(p => !userPermissions.includes(p))

      console.warn(`[权限拒绝] 用户 ${req.user.username} 缺少权限: ${missing.join(', ')}`)

      return res.status(403).json({
        code: 403,
        message: '权限不足',
        data: { missing }
      })
    }

    next()
  }
}

/**
 * 角色验证中间件
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ code: 401, message: '未登录' })
    }

    const userRoles = req.user.roles || []
    const hasRole = roles.some(role => userRoles.includes(role))

    if (!hasRole) {
      console.warn(`[权限拒绝] 用户 ${req.user.username} 需要角色: ${roles.join(', ')}`)

      return res.status(403).json({
        code: 403,
        message: '角色权限不足',
        data: { required: roles, current: userRoles }
      })
    }

    next()
  }
}
```

### 2. 认证中间件

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

/**
 * JWT 认证中间件
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. 获取 token
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '缺少认证令牌'
      })
    }

    // 2. 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // 3. 从数据库获取用户完整信息（包括权限）
    // 这里简化处理，实际项目中应该查询数据库
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      permissions: decoded.permissions || [],
      roles: decoded.roles || []
    }

    next()
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Token 无效或已过期'
    })
  }
}
```

### 3. 路由示例

```typescript
// routes/user.ts
import express from 'express'
import { authenticate } from '../middleware/auth'
import { requirePermission, requireAllPermissions, requireRole } from '../middleware/permission'

const router = express.Router()

// ======================== 用户管理接口 ========================

/**
 * 查看用户列表（需要 user:view 权限）
 */
router.get(
  '/users',
  authenticate,
  requirePermission('user:view'),
  async (req, res) => {
    // 业务逻辑
    const users = await getUserList()
    res.json({ code: 200, data: users })
  }
)

/**
 * 创建用户（需要 user:create 权限）
 */
router.post(
  '/users',
  authenticate,
  requirePermission('user:create'),
  async (req, res) => {
    const { username, email } = req.body

    // 业务逻辑
    const newUser = await createUser({ username, email })

    // 记录操作日志
    console.log(`[操作日志] 用户 ${req.user?.username} 创建了新用户 ${username}`)

    res.json({ code: 200, data: newUser })
  }
)

/**
 * 更新用户（需要 user:edit 权限）
 */
router.put(
  '/users/:id',
  authenticate,
  requirePermission('user:edit'),
  async (req, res) => {
    const { id } = req.params
    const updateData = req.body

    // 业务逻辑
    const updatedUser = await updateUser(id, updateData)

    console.log(`[操作日志] 用户 ${req.user?.username} 更新了用户 ${id}`)

    res.json({ code: 200, data: updatedUser })
  }
)

/**
 * 删除用户（需要 user:delete 权限）
 * 🚨 敏感操作，必须验证权限
 */
router.delete(
  '/users/:id',
  authenticate,
  requirePermission('user:delete'),
  async (req, res) => {
    const { id } = req.params

    // 额外的安全检查：不允许删除自己
    if (req.user?.id === id) {
      return res.status(400).json({
        code: 400,
        message: '不能删除自己'
      })
    }

    // 业务逻辑
    await deleteUser(id)

    // ⚠️ 重要：记录敏感操作日志
    console.log(`[敏感操作] 用户 ${req.user?.username} 删除了用户 ${id}`)

    res.json({ code: 200, message: '删除成功' })
  }
)

/**
 * 批量操作（需要多个权限）
 */
router.post(
  '/users/batch-operation',
  authenticate,
  requireAllPermissions('user:view', 'user:edit', 'user:delete'),
  async (req, res) => {
    // 业务逻辑
    res.json({ code: 200, message: '批量操作成功' })
  }
)

/**
 * 超级管理员操作（需要特定角色）
 */
router.post(
  '/users/admin-operation',
  authenticate,
  requireRole('super_admin', 'admin'),
  async (req, res) => {
    // 业务逻辑
    res.json({ code: 200, message: '管理员操作成功' })
  }
)

// ======================== 权限查询接口 ========================

/**
 * 获取当前用户权限
 */
router.get(
  '/user/permissions',
  authenticate,
  (req, res) => {
    // 返回用户权限列表
    res.json({
      code: 200,
      data: {
        permissions: req.user?.permissions || [],
        roles: req.user?.roles || []
      }
    })
  }
)

export default router

// ======================== 模拟数据库操作 ========================

async function getUserList() {
  // 实际项目中从数据库查询
  return [
    { id: '1', username: 'admin', email: 'admin@example.com' },
    { id: '2', username: 'user', email: 'user@example.com' }
  ]
}

async function createUser(data: any) {
  // 实际项目中写入数据库
  return { id: '3', ...data }
}

async function updateUser(id: string, data: any) {
  // 实际项目中更新数据库
  return { id, ...data }
}

async function deleteUser(id: string) {
  // 实际项目中从数据库删除
  console.log(`删除用户 ${id}`)
}
```

### 4. 数据库设计（MySQL 示例）

```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,  -- 例如：user:view, user:edit
  name VARCHAR(50) NOT NULL,
  module VARCHAR(50),  -- 模块名称
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户-角色关联表
CREATE TABLE user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 角色-权限关联表
CREATE TABLE role_permissions (
  role_id INT,
  permission_id INT,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 操作日志表（重要！记录所有权限相关操作）
CREATE TABLE operation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  username VARCHAR(50),
  action VARCHAR(100),  -- 操作类型
  resource VARCHAR(200),  -- 操作资源
  ip VARCHAR(50),
  user_agent TEXT,
  status ENUM('success', 'failed'),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### 5. 获取用户权限的 SQL 查询

```typescript
// services/permission.service.ts

/**
 * 获取用户所有权限
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const query = `
    SELECT DISTINCT p.code
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = ?
  `

  const rows = await db.query(query, [userId])
  return rows.map((row: any) => row.code)
}

/**
 * 获取用户所有角色
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const query = `
    SELECT r.name
    FROM roles r
    INNER JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = ?
  `

  const rows = await db.query(query, [userId])
  return rows.map((row: any) => row.name)
}

/**
 * 检查用户是否拥有某个权限
 */
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count
    FROM permissions p
    INNER JOIN role_permissions rp ON p.id = rp.permission_id
    INNER JOIN user_roles ur ON rp.role_id = ur.role_id
    WHERE ur.user_id = ? AND p.code = ?
  `

  const [row] = await db.query(query, [userId, permissionCode])
  return row.count > 0
}
```

### 6. 操作日志记录

```typescript
// services/log.service.ts

interface LogData {
  userId: string
  username: string
  action: string
  resource: string
  ip: string
  userAgent: string
  status: 'success' | 'failed'
  errorMessage?: string
}

/**
 * 记录操作日志
 */
export async function logOperation(data: LogData) {
  const query = `
    INSERT INTO operation_logs
    (user_id, username, action, resource, ip, user_agent, status, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `

  await db.query(query, [
    data.userId,
    data.username,
    data.action,
    data.resource,
    data.ip,
    data.userAgent,
    data.status,
    data.errorMessage || null
  ])
}

// 在中间件中使用
export function logMiddleware(req: Request, res: Response, next: NextFunction) {
  // 保存原始的 res.json 方法
  const originalJson = res.json.bind(res)

  // 重写 res.json 方法
  res.json = function(body: any) {
    // 记录日志
    logOperation({
      userId: req.user?.id || 'anonymous',
      username: req.user?.username || 'anonymous',
      action: req.method,
      resource: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
      status: res.statusCode < 400 ? 'success' : 'failed',
      errorMessage: res.statusCode >= 400 ? body.message : undefined
    }).catch(error => {
      console.error('记录日志失败:', error)
    })

    return originalJson(body)
  }

  next()
}
```

### 7. 安全清单

- ✅ 所有敏感接口都添加了权限验证中间件
- ✅ 权限验证在后端进行，前端只控制 UI
- ✅ 使用 JWT 进行身份认证
- ✅ 记录所有权限相关的操作日志
- ✅ 对敏感操作（删除、批量操作）额外记录日志
- ✅ 返回明确的错误信息（401 未登录，403 无权限）
- ✅ 使用参数化查询防止 SQL 注入
- ✅ 密码使用 bcrypt 加密存储
- ✅ Token 设置合理的过期时间
- ✅ 对频繁的权限查询进行缓存优化

## 总结

前端权限控制的正确姿势：

```
┌──────────────────────────────────────────────────┐
│  前端（UI 层）                                    │
│  - 控制按钮/菜单是否显示                          │
│  - 使用 Proxy/闭包提高篡改成本                    │
│  - 提供良好的用户体验                             │
└────────────────┬─────────────────────────────────┘
                 │
                 │ HTTP Request
                 ▼
┌──────────────────────────────────────────────────┐
│  后端（安全层）⭐⭐⭐                              │
│  - 验证 JWT Token                                │
│  - 检查用户权限（从数据库）                        │
│  - 记录操作日志                                   │
│  - 返回 403 如果无权限                            │
└──────────────────────────────────────────────────┘
```

**核心原则：永远不要相信前端，所有安全验证必须在后端进行！**
