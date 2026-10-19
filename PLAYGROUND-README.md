# Visual Playground — 第一阶段

## 安装

将本文件夹内 index.html、playground.css、playground.js、playground-data.js 复制到网站根目录：
D:\PPfiles2026\261016_作品集\takpyeong.github.io

仅 index.html 是替换文件，另外三个是新文件。替换前可备份本地 index.html。
本 index.html 基于本次读取的本地定稿版，Hero HTML 原样保留。
不要替换 content.js、style.css、script.js 或 manager.html。
素材沿用网站已有的「作品素材」目录，本包不重复包含素材。
浏览器强制刷新后查看。支持直接打开 index.html，也支持静态托管。

## 数据放哪里

playground-data.js 的 window.PLAYGROUND，与 window.PORTFOLIO 完全独立。
后续 Manager 可以增加独立 Playground 页签，读写这个文件，不必改变正式项目结构。

顶层：
- version: 1，数据版本
- enabled: true，false 则隐藏整个区域
- demo: true，测试陈列提示；换成真实陈列后设为 false
- items: 数组，顺序即编辑顺序（瀑布流按列高度寻找位置）

每件作品：
- id: 唯一且稳定的字符串，为未来 Manager 编辑保留
- title: 标题
- type: "image" 或 "video"
- src: 网站根目录相对路径或 HTTP(S) 图片/MP4 地址
- poster: 视频封面路径，可选；减少动态效果模式建议填写
- size: "small" / "medium" / "wide" / "tall"
- width、height: 可选，源文件实际像素尺寸；填写可预留比例，减少加载跳动
- alt: 图片替代文本
- caption: 详细查看说明
- visible: false 时隐藏

small 使用单列内较窄的宽度和留白；medium 为常规单列；wide 在双/三列布局中跨两列；tall 用于保留竖向构图的单列作品。任何权重都不强制裁切或拉伸。tall 的高度由素材本身比例决定。
桌面三列，平板两列，600px 及以下单列。wide 在单列时自动回归一列。
测试数据暂用现有素材展示，包含横、竖、方图和 MP4；没有写入正式项目。

## 交互与视频

- 列表视频：可见时 autoplay / muted / loop / playsinline，无 controls；离屏、后台、打开详情时暂停。
- 系统开启减少动态效果：列表不自动播放视频，关闭 hover 缩放；点击仍可打开详情。
- 视频详情：显示原生 controls，用户主动点击播放，可开启声音，不自动循环。
- 浏览器拒绝自动播放时显示点击查看提示。
- 详情使用独立原生 dialog，支持关闭按钮、Esc、背景点击和焦点返回，不使用正式项目 hash。
- 图片保持原比例；播放失败/素材路径无效时显示提示。

## 文件职责

index.html：新增 Playground 挂载区域、独立详情弹窗、资源引入。
playground.css：仅 pg- 命名空间样式。
playground.js：独立数据渲染、按高度的跨列瀑布流、视频可见性、详细查看。
playground-data.js：唯一 Playground 数据入口。

## 本次验证

通过：JS 语法；HTML 嵌套；Hero HTML 与本地源文件逐字比较；区域顺序；测试素材/封面路径；一/二/三列瀑布流不重叠与跨列边界；模拟 DOM 的视频属性、减少动态效果暂停、详情控件、关闭清理及焦点返回。
限制：浏览器预览连接超时，未完成真实浏览器截图、手机设备和实际 MP4 解码/自动播放策略的视觉实测。模拟 DOM 测试不能代替浏览器验收。
