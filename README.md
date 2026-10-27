# 拉了吗 💩

本地优先的如厕记录与肠道健康分析工具。记录每一次如厕的**时长**与**便便状态**（形状、颜色、分量、排便感觉、气味、出血、粘马桶、腹部是否舒畅、心情），用日历和趋势图帮你看见自己的肠道规律。

> 它不是段子 App，也不是医疗器械，而是一本**肠道日记**——用最低的记录成本，换来对身体的长期感知。

## ✨ 功能

- **计时记录**：坐下点「开始」，起来点「结束」，自动记时长。
- **图形化填表**：形状（布里斯托 1–7 型）、颜色、分量、感觉、气味、出血、粘马桶、腹部、心情，全部点选 emoji / 色块，多数情况只需点「完成」。
- **一键重复上次 / 补记任意日期**：肠道规律的人 90% 记录都一样；也能回填过去任意一天。
- **日历视图**：月历每天着色显示，点开看当天明细。
- **统计分析**：总次数、日均、平均/最长时长；形状、颜色、分量、感觉、腹部、心情分布；时段分布（你通常几点拉）、周内分布；每日趋势折线；规律性（晨便率、间隔、时刻波动）。
- **数据安全**：数据只存在你设备上，**不上传、不埋点、无账号**；可导出 JSON / CSV，可导入迁移。
- **首次免责声明**：本工具仅用于记录与自我观察，不构成医疗建议。

## 🧱 技术栈

React 18 · Vite · TypeScript · Tailwind CSS v4 · 本地存储 IndexedDB · 图表 Recharts · 安卓封装用 Capacitor。

## 📱 如何装到手机（安卓 APK）

成品是安卓安装包（`.apk`）。两种办法，**都不需要懂技术**：

### 办法 A：自动云端打包（推荐，什么都不用装）

1. 把本项目推到 GitHub（公开或私有均可）。
2. 进入仓库的 **Actions** 标签页，找到工作流 **Build Android APK**，点 **Run workflow**（或直接 push 到 `main` 分支会自动触发）。
3. 等几分钟，完成后在 **Artifacts** 里下载 `lalema-apk`（里面是一个 `.apk` 文件）。
4. 把 apk 传到手机，点击安装即可（首次安装需允许「未知来源」）。

### 办法 B：本地出包（需装一次免费工具）

1. 安装 [Node.js 22+](https://nodejs.org/) 和 [Android Studio](https://developer.android.com/studio)（含 SDK）。
2. 命令行执行：
   ```bash
   npm install
   npm run build
   npx cap sync android
   ```
3. `npx cap open android` 打开 Android Studio，点菜单 **Build → Build Bundle(s) / APK(s) → Build APK(s)**。
4. 在 `android/app/build/outputs/apk/debug/` 下找到生成的 apk。

## 🔒 隐私与免责

- 所有数据仅存储于本机（浏览器/应用本地数据库），不与任何服务器通信，也可随时一键导出或清空。
- 本工具仅用于个人记录与自我观察，**不构成任何医疗建议**。如有便血、持续腹泻或便秘等异常，请及时就医（消化内科）。

## 🛠 开发

```bash
npm install
npm run dev        # 本地预览（浏览器）
npm run build      # 构建 Web 产物到 dist/
npx cap sync android && npx cap open android   # 同步并打开安卓工程
```

## 📂 目录结构

```
src/lib      数据模型、本地存储、统计计算、导入导出
src/components  计时器、记录表单、图表、通用 UI
src/pages    今天 / 日历 / 统计 / 历史 / 我的
```

## 📜 许可证

[MIT](./LICENSE)
