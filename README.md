# 姐妹省钱打卡 PWA

这是一个手机优先的 PWA 省钱打卡网页，支持妹妹/姐姐双身份、本地记账、奶茶规则、每周/月统计、周边盲盒统计和 Excel 导入导出。

## PWA 功能
- 可添加到 iPhone / 安卓主屏幕
- 独立窗口启动，体验接近 App
- 核心页面和本地记账支持离线使用
- 数据仍保存在各自设备浏览器的 localStorage 中，键名：`sister-saving-v1`
- Excel 导入/导出继续使用 SheetJS CDN；首次加载该组件需要联网，成功加载后浏览器/PWA 会尽量缓存

## 部署要求
PWA 的 Service Worker 不能通过直接双击 `index.html` 的 `file://` 方式启用。请部署到 HTTPS 网站（例如 GitHub Pages / Cloudflare Pages / Netlify），或者开发时通过 localhost 运行。

### 本地测试
在项目目录运行：

```bash
python3 -m http.server 8080
```

然后电脑访问 `http://localhost:8080`。手机测试时建议部署到 HTTPS 地址。

## iPhone 安装
1. 用 Safari 打开部署后的 HTTPS 地址
2. 点击“分享”
3. 选择“添加到主屏幕”
4. 从桌面图标启动

## 安卓安装
1. 用 Chrome 打开部署后的 HTTPS 地址
2. 点击网页中的“安装”提示，或浏览器菜单中的“安装应用 / 添加到主屏幕”
3. 从桌面图标启动

## 数据同步
两个人的数据默认互不自动同步。需要阶段对齐时：一方导出 Excel → 发给另一方 → 另一方“导入并合并”，网页会按身份合并并自动去重。
