# 技术栈核对

- Vite 官方提供 `react-ts` 模板并负责开发服务器及静态构建：https://vite.dev/guide/ 。Vite 只转译 TypeScript，不执行类型检查，因此另设 `tsc` 脚本：https://vite.dev/guide/features 。
- React 官方建议无现成构建配置的前端项目可使用 Vite：https://react.dev/learn/add-react-to-an-existing-project 。
- IndexedDB 可保存文件和 Blob，适合本地照片；Web Storage 更适合少量数据：https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API 。
- 后台页的定时器会被浏览器节流，倒计时用结束时间戳推导剩余，页面可见时再刷新：https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API 。
- CSS `prefers-reduced-motion` 可为用户减少不必要的动画：https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion 。
- Vitest 与 Vite 同源，适合少量状态规则测试：https://vitest.dev/guide/ 。

版本以实施时安装并验证的兼容组合为准，不预先钉死未经本机验证的版本号。
