/**
 * =============================================================================
 * ESLint 配置详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】ESLint 的作用？
 * 答：
 * 1. 代码质量检查（潜在错误）
 * 2. 代码风格统一
 * 3. 最佳实践推荐
 *
 * 【面试题】ESLint 9+ 的新配置格式是什么？
 * 答：Flat Config（扁平配置）
 * - 使用 ESM 格式
 * - 配置数组而非对象
 * - 更好的类型推断
 * - 弃用 .eslintrc 格式
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  /**
   * 【知识点】ignores 配置
   * 全局忽略的文件和目录
   */
  {
    ignores: [
      'dist',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'public',
    ]
  },

  /**
   * 【知识点】extends 配置
   * 继承推荐的规则集
   */
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],

    /**
     * 【知识点】languageOptions 语言选项
     */
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },

    /**
     * 【知识点】plugins 插件配置
     */
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    /**
     * 【知识点】rules 规则配置
     *
     * 规则级别：
     * - 'off' 或 0: 关闭
     * - 'warn' 或 1: 警告
     * - 'error' 或 2: 错误
     */
    rules: {
      /**
       * React Hooks 规则 - 面试重点
       *
       * 【面试题】React Hooks 的使用规则？
       * 答：
       * 1. 只在顶层调用 Hooks（不要在循环、条件、嵌套中调用）
       * 2. 只在 React 函数组件或自定义 Hook 中调用
       */
      ...reactHooks.configs.recommended.rules,

      /**
       * React Refresh 规则
       * 确保组件可以正确热更新
       */
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      /**
       * TypeScript 相关规则
       */
      // 允许使用 any（但建议尽量避免）
      '@typescript-eslint/no-explicit-any': 'warn',

      // 允许未使用的变量以下划线开头
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // 允许空函数
      '@typescript-eslint/no-empty-function': 'off',

      // 允许非空断言
      '@typescript-eslint/no-non-null-assertion': 'off',

      /**
       * 通用规则
       */
      // 强制使用 === 和 !==
      'eqeqeq': ['error', 'always'],

      // 禁止 console（生产环境会被移除，这里只警告）
      'no-console': 'warn',

      // 禁止 debugger
      'no-debugger': 'warn',

      // 禁止 var，使用 let/const
      'no-var': 'error',

      // 优先使用 const
      'prefer-const': 'error',

      /**
       * 【实战经验】根据团队情况调整规则
       * 这些规则可以根据实际项目需求修改
       */

      // 【可选】要求函数显式返回类型
      // '@typescript-eslint/explicit-function-return-type': 'warn',

      // 【可选】禁止魔术数字
      // 'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],
    },
  }
)
