/**
 * =============================================================================
 * 登录页面详解
 * =============================================================================
 */

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

import { useUserStore } from '@/store'
import type { LoginParams } from '@/types'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)

  const { setUserInfo, setToken } = useUserStore()

  /**
   * 【面试题】表单提交处理的最佳实践？
   * 答：
   * 1. 使用 Form 组件的 onFinish 处理
   * 2. 异步操作使用 loading 状态
   * 3. 错误处理使用 try-catch
   * 4. 成功后跳转并提示
   */
  const handleSubmit = async (values: LoginParams) => {
    try {
      setLoading(true)

      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 模拟登录成功
      setToken('mock-token-' + Date.now())
      setUserInfo({
        id: 1,
        username: values.username,
        email: `${values.username}@example.com`,
        nickname: 'Admin User',
        roles: ['admin'],
        permissions: ['*'],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
      })

      message.success('登录成功！')

      // 跳转到之前的页面或首页
      const redirect = searchParams.get('redirect') || '/dashboard'
      navigate(redirect)
    } catch {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户登录</h2>

      <Form
        name="login"
        initialValues={{
          username: 'admin',
          password: '123456',
          remember: true,
        }}
        onFinish={handleSubmit}
        size="large"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名: admin"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码: 123456"
          />
        </Form.Item>

        <Form.Item>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>记住我</Checkbox>
          </Form.Item>
          <a style={{ float: 'right' }} href="#">
            忘记密码
          </a>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
