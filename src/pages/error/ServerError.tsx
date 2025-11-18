/**
 * 500 页面
 */

import { Button, Result } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function ServerError() {
  const navigate = useNavigate()

  return (
    <Result
      status="500"
      title="500"
      subTitle="抱歉，服务器发生错误"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      }
    />
  )
}
