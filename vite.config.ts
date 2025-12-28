/**
 * =============================================================================
 * Vite 7 配置文件详解 - 面试重点
 * =============================================================================
 *
 * 【面试题】Vite 为什么比 Webpack 快？
 * 答：
 * 1. 开发环境：利用浏览器原生 ESM，无需打包，按需编译
 * 2. 预构建：使用 esbuild（Go 语言编写）预构建依赖，比 JS 快 10-100 倍
 * 3. HMR：基于 ESM 的 HMR，只需精确失活编辑的模块
 * 4. 生产构建：使用 Rollup，tree-shaking 更彻底
 *
 * 【面试题】Vite 的工作原理？
 * 答：
 * - 开发时：启动一个 dev server，拦截浏览器的 ESM 请求，按需编译返回
 * - 构建时：使用 Rollup 进行打包，输出高度优化的静态资源
 *
 * 【面试题】Vite 和 Webpack 如何选择？
 * 答：
 * Vite 优势：
 * - 开发启动速度快（秒级 vs 分钟级）
 * - HMR 更快（<100ms vs 1-5s）
 * - 配置简单，开箱即用
 * - 适合：新项目、现代框架、中小型应用
 *
 * Webpack 优势：
 * - 生态成熟（10000+ loader/plugin）
 * - Module Federation 微前端方案
 * - 兼容性强（支持老浏览器、老项目）
 * - 适合：大型企业项目、复杂构建需求、需兼容旧环境
 *
 * 结论：不是替代关系，而是互补。新项目优先 Vite，复杂场景用 Webpack。
 */

import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// 生产环境插件
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

/**
 * 【知识点】Vite 配置可以是对象或函数
 * - 对象：适合简单配置
 * - 函数：可以根据 mode 和 command 动态配置
 *
 * 【面试题】如何区分开发和生产环境配置？
 * 答：使用函数形式，通过 command 和 mode 参数判断
 */
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  // 【知识点】loadEnv 用于加载环境变量
  // 第一个参数：mode（development/production/staging）
  // 第二个参数：env 文件所在目录
  // 第三个参数：环境变量前缀，默认只加载 VITE_ 开头的变量
  const env = loadEnv(mode, process.cwd(), '')

  // 是否是生产构建
  const isBuild = command === 'build'
  // 是否开启打包分析
  const isAnalyze = process.env.ANALYZE === 'true'

  return {
    /**
     * ==========================================================================
     * 基础配置
     * ==========================================================================
     */

    // 【知识点】base 配置
    // 开发环境通常是 '/'，生产环境可能部署在子路径下
    // 例如部署在 https://example.com/admin/ 下，base 就是 '/admin/'
    base: env.VITE_PUBLIC_PATH || '/',

    /**
     * ==========================================================================
     * 插件配置 - 面试重点
     * ==========================================================================
     *
     * 【面试题】Vite 插件和 Rollup 插件的关系？
     * 答：
     * 1. Vite 插件是 Rollup 插件的超集
     * 2. Vite 扩展了 Rollup 的插件接口，添加了开发服务器特有的钩子
     * 3. 大部分 Rollup 插件可以直接在 Vite 中使用
     *
     * 【面试题】Vite 插件的执行顺序？
     * 答：
     * 1. alias 解析
     * 2. 带有 enforce: 'pre' 的插件
     * 3. Vite 核心插件
     * 4. 没有 enforce 的插件
     * 5. Vite 构建插件
     * 6. 带有 enforce: 'post' 的插件
     * 7. 构建后置钩子
     */
    plugins: [
      // React 插件 - 支持 JSX 和 Fast Refresh
      react({
        // 【知识点】babel 配置，可以添加额外的 babel 插件
        // 例如添加 styled-components 支持
        // babel: {
        //   plugins: ['styled-components']
        // }
      }),

      // 【知识点】条件加载插件
      // 只在生产构建时启用压缩插件
      ...(isBuild ? [
        // Gzip 压缩
        viteCompression({
          verbose: true, // 是否在控制台输出压缩结果
          disable: false,
          threshold: 10240, // 只处理大于 10KB 的文件
          algorithm: 'gzip',
          ext: '.gz',
        }),
        // Brotli 压缩（压缩率更高）
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'brotliCompress',
          ext: '.br',
        }),
      ] : []),

      // 打包分析插件
      ...(isAnalyze ? [
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
          filename: 'dist/stats.html',
        }),
      ] : []),

      /**
       * 【知识点】自定义 Vite 插件示例
       *
       * Vite 插件本质是一个返回对象的函数，对象包含：
       * - name: 插件名称
       * - 各种钩子函数
       *
       * 常用钩子：
       * - config: 修改配置
       * - configResolved: 配置解析完成
       * - configureServer: 配置开发服务器
       * - transformIndexHtml: 转换 index.html
       * - transform: 转换代码
       * - load: 加载模块
       * - resolveId: 解析模块路径
       */
      {
        name: 'vite-plugin-build-info',
        // 只在构建时执行
        apply: 'build',
        // 在构建完成后执行
        closeBundle() {
          console.log('\n✨ 构建完成！')
          console.log(`📦 模式: ${mode}`)
          console.log(`🕐 时间: ${new Date().toLocaleString()}`)
        },
      },

      // 【实战经验】注入构建信息到 HTML
      {
        name: 'vite-plugin-html-transform',
        transformIndexHtml(html) {
          return html.replace(
            '<!--BUILD_INFO-->',
            `<!-- Built at ${new Date().toISOString()} | Mode: ${mode} -->`
          )
        },
      },
    ],

    /**
     * ==========================================================================
     * 解析配置
     * ==========================================================================
     */
    resolve: {
      /**
       * 【面试题】路径别名的作用和配置方式？
       * 答：
       * 1. 简化导入路径，避免相对路径地狱（../../../）
       * 2. 提高代码可读性和可维护性
       * 3. 配合 tsconfig.json 的 paths 使用
       */
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@types': path.resolve(__dirname, 'src/types'),
      },
      // 【知识点】导入时可省略的扩展名
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },

    /**
     * ==========================================================================
     * CSS 配置 - 面试重点
     * ==========================================================================
     *
     * 【面试题】Vite 如何处理 CSS？
     * 答：
     * 1. 原生支持 CSS、Less、Sass、Stylus
     * 2. 自动处理 CSS Modules（.module.css）
     * 3. 支持 PostCSS 配置
     * 4. 开发时以 <style> 标签注入，生产时提取为单独文件
     */
    css: {
      // CSS Modules 配置
      modules: {
        // 【知识点】localsConvention 决定类名导出格式
        // camelCase: .my-class -> myClass
        // camelCaseOnly: 只导出驼峰格式
        localsConvention: 'camelCaseOnly',
        // 生成的类名格式
        generateScopedName: isBuild
          ? '[hash:base64:8]' // 生产环境用 hash，更短
          : '[name]__[local]__[hash:base64:5]', // 开发环境保留可读性
      },
      // 预处理器配置
      preprocessorOptions: {
        less: {
          // 【实战经验】注入全局 Less 变量
          // 这样每个 Less 文件都可以直接使用这些变量
          additionalData: `@import "@/styles/variables.less";`,
          javascriptEnabled: true,
          // 修改 Ant Design 主题
          modifyVars: {
            'primary-color': '#1890ff',
          },
        },
      },
      // 【知识点】devSourcemap 在开发时生成 CSS sourcemap
      devSourcemap: true,
    },

    /**
     * ==========================================================================
     * 开发服务器配置
     * ==========================================================================
     */
    server: {
      host: '0.0.0.0', // 允许局域网访问
      port: 3000,
      open: true, // 自动打开浏览器
      cors: true, // 允许跨域

      /**
       * 【面试题】如何解决开发环境跨域问题？
       * 答：配置 proxy 代理
       *
       * 【原理】
       * 浏览器请求 /api/xxx -> Vite Dev Server -> 转发到 target
       * 由于是服务器转发，不受浏览器同源策略限制
       */
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true, // 修改请求头中的 Origin
          rewrite: (path) => path.replace(/^\/api/, ''),
          // 【实战经验】配置请求/响应日志，便于调试
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`)
            })
          },
        },
        // WebSocket 代理
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
        },
      },

      /**
       * 【知识点】HMR 配置
       *
       * 【面试题】什么是 HMR？它是如何工作的？
       * 答：
       * HMR (Hot Module Replacement) 热模块替换
       * 1. 文件修改时，Vite 通过 WebSocket 通知浏览器
       * 2. 浏览器请求更新的模块
       * 3. 只替换修改的模块，保持应用状态
       */
      hmr: {
        overlay: true, // 显示错误遮罩
      },

      /**
       * 【知识点】文件系统监听配置
       *
       * 【实战经验】在 Docker 或网络文件系统中可能需要开启轮询
       */
      watch: {
        usePolling: false, // 默认使用原生 fs events
        // 忽略的文件
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    },

    /**
     * ==========================================================================
     * 构建配置 - 面试重点
     * ==========================================================================
     */
    build: {
      // 输出目录
      outDir: 'dist',
      // 静态资源目录
      assetsDir: 'assets',

      /**
       * 【面试题】什么是 sourcemap？生产环境要不要开启？
       * 答：
       * sourcemap 将压缩后的代码映射回源代码，便于调试
       *
       * 【Vite Sourcemap 选项】类似 Webpack，但更简洁：
       * - false: 不生成（最安全，生产推荐）
       * - true: 生成独立 .map 文件并添加引用注释（用户可见源码）
       * - 'inline': sourcemap 内联到 JS 中（体积大，不推荐生产）
       * - 'hidden': 生成 .map 但不添加引用注释（用于错误监控系统）
       *
       * 【Webpack 对比】
       * Webpack 有 20+ 种组合：
       * - eval: 最快，但重构后行号不准
       * - cheap: 不包含列信息
       * - module: 包含 loader 转换前的源码
       * - source-map: 最完整，但最慢
       * 常见组合：cheap-module-source-map, eval-source-map 等
       *
       * Vite 简化为 4 种，构建速度更快（基于 Rollup）
       *
       * 【生产环境最佳实践】
       * - 'hidden'：配合 Sentry 等监控系统，安全且可追踪错误
       * - false：完全不生成，最安全但无法追踪线上问题
       */
      sourcemap: mode === 'staging' ? 'hidden' : false,

      /**
       * 【知识点】target 配置
       * 决定输出代码的兼容性，影响打包体积
       *
       * 【实战经验】
       * - 面向现代浏览器：'esnext' 或 'es2020'
       * - 需要兼容旧浏览器：'es2015'
       */
      target: 'es2020',

      /**
       * 【面试题】如何优化打包体积？
       * 答：
       * 1. 代码分割（splitVendorChunkPlugin 或自定义 manualChunks）
       * 2. Tree Shaking（确保使用 ES Module）
       * 3. 压缩（terser/esbuild）
       * 4. 按需加载（动态 import）
       * 5. CDN 外部化大型依赖
       */

      // 【知识点】chunk 大小警告阈值（KB）
      chunkSizeWarningLimit: 500,

      // Rollup 配置
      rollupOptions: {
        output: {
          /**
           * 【面试题】什么是代码分割？如何配置？
           * 答：将代码拆分成多个 chunk，实现按需加载
           *
           * manualChunks 手动分割策略：
           * - 将大型库单独打包
           * - 将不常变动的代码单独打包（利用缓存）
           */
          manualChunks: {
            // 【实战经验】React 生态单独打包
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // UI 库单独打包
            'antd-vendor': ['antd', '@ant-design/icons'],
            // 工具库单独打包
            'utils-vendor': ['axios', 'dayjs', 'lodash-es'],
          },

          /**
           * 【知识点】文件命名配置
           * 使用 contenthash 确保内容变化时文件名变化
           * 便于浏览器缓存管理
           */
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // 根据资源类型分目录
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return 'assets/images/[name]-[hash][extname]'
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return 'assets/fonts/[name]-[hash][extname]'
            }
            return 'assets/[name]-[hash][extname]'
          },
        },
        // 【知识点】external 外部化依赖
        // 配合 CDN 使用，减小打包体积
        // external: ['react', 'react-dom'],
      },

      /**
       * 【知识点】minify 压缩配置
       *
       * 【面试题】esbuild 和 terser 压缩的区别？
       * 答：
       * - esbuild：速度快（Go 语言），压缩率略低
       * - terser：速度慢（JS 语言），压缩率高，支持更多选项
       *
       * Vite 默认使用 esbuild，追求极致压缩可切换 terser
       */
      minify: 'esbuild',

      // esbuild 压缩选项
      esbuildOptions: {
        // 移除 console 和 debugger
        drop: isBuild && mode === 'production' ? ['console', 'debugger'] : [],
      },

      // 【实战经验】提取 CSS 到单独文件
      cssCodeSplit: true,
    },

    /**
     * ==========================================================================
     * 预构建优化配置 - 面试重点
     * ==========================================================================
     *
     * 【面试题】什么是 Vite 的预构建？为什么需要它？
     * 答：
     * 1. 将 CommonJS/UMD 转换为 ESM
     * 2. 将多个模块合并，减少请求数（如 lodash-es 有 600+ 模块）
     * 3. 使用 esbuild 执行，速度极快
     *
     * 【面试题】预构建的缓存在哪里？什么时候会重新构建？
     * 答：
     * - 缓存在 node_modules/.vite
     * - 以下情况会重新构建：
     *   1. package.json 的 dependencies 变化
     *   2. lockfile 变化
     *   3. vite.config.js 变化
     *   4. NODE_ENV 变化
     */
    optimizeDeps: {
      /**
       * 【知识点】include 强制预构建
       * 适用于：
       * 1. 动态导入的依赖（Vite 无法静态分析）
       * 2. 隐式依赖
       */
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'antd',
        'zustand',
        'axios',
        'dayjs',
        'lodash-es',
        // 【实战经验】Ant Design 图标按需加载时需要预构建
        '@ant-design/icons',
      ],
      /**
       * 【知识点】exclude 排除预构建
       * 适用于：
       * 1. 已经是 ESM 格式的包
       * 2. 需要在运行时处理的包
       */
      exclude: [],
    },

    /**
     * ==========================================================================
     * 环境变量配置
     * ==========================================================================
     *
     * 【面试题】Vite 如何处理环境变量？
     * 答：
     * 1. 从 .env 文件加载
     * 2. 只有 VITE_ 前缀的变量才会暴露给客户端
     * 3. 通过 import.meta.env 访问
     * 4. 支持多环境：.env.development, .env.production
     */
    envPrefix: 'VITE_',

    /**
     * ==========================================================================
     * 实验性功能
     * ==========================================================================
     */
    // experimental: {
    //   // Vite 5+ 的一些实验性功能
    // },

    /**
     * 【知识点】define 全局常量
     * 在编译时替换，类似 webpack.DefinePlugin
     */
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  }
})
