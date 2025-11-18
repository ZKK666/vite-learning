/**
 * 模拟重型组件 - 用于演示懒加载
 */

import { Alert } from 'antd'

export default function HeavyComponent() {
  return (
    <Alert
      message="重型组件已加载"
      description="这是一个通过 React.lazy 懒加载的组件。在实际项目中，可能包含大量代码或第三方库。"
      type="success"
      showIcon
      style={{ marginTop: 16 }}
    />
  )
}
