# Yu Zhuoping Portfolio v2.1

这是为 GitHub Pages 准备的纯 HTML / CSS / JavaScript 作品集。日常维护主要只碰 `content.js` 和 `作品素材/`。

## 这版的 6 个项目

1. 运行正常：MP4 + 8 张关键帧 + 剧本 PDF
2. 克莱因蓝的自白：MP4 + 8 张图 + 剧本 PDF
3. 商业三维角色动画：6 个 MP4
4. 角色与插画：20 张图（8 张精选 + 12 张 Archive）
5. Unity 实时交互：录屏 + 5 张截图 + 项目 PDF
6. Unreal Engine：录屏 + 项目 PDF

## 最省事的素材命名

把文件按下面名称放进去，`content.js` 默认配置就能直接读取：

```text
作品素材/
├─ running-normal/
│  ├─ cover.jpg
│  ├─ film.mp4
│  ├─ still-01.jpg ... still-08.jpg
│  └─ script.pdf
├─ klein-blue/
│  ├─ cover.jpg
│  ├─ film.mp4
│  ├─ still-01.jpg ... still-08.jpg
│  └─ script.pdf
├─ commercial-3d/
│  ├─ cover.jpg
│  └─ animation-01.mp4 ... animation-06.mp4
├─ illustration/
│  ├─ cover.jpg
│  └─ 01.jpg ... 20.jpg
├─ unity/
│  ├─ cover.jpg
│  ├─ demo.mp4
│  ├─ 01.jpg ... 05.jpg
│  └─ project.pdf
└─ unreal/
   ├─ cover.jpg
   ├─ demo.mp4
   └─ project.pdf
```

如果你的真实文件名不同，不必重命名，也可以直接在 `content.js` 修改路径。

## sections 怎么用

每个项目的详情页由 `sections` 顺序生成。例如：

```js
sections: [
  { type: "video", title: "完整影片", src: "作品素材/demo/film.mp4" },
  { type: "gallery", title: "Selected Frames", layout: "editorial", images: [
    "作品素材/demo/01.jpg",
    "作品素材/demo/02.jpg"
  ]},
  { type: "pdf", title: "剧本", src: "作品素材/demo/script.pdf" }
]
```

`layout: "editorial"` 适合关键帧：部分图片自动跨两列，形成节奏；`layout: "grid"` 适合大量插画 Archive。

## 第一次替换 / 测试

1. 先备份当前 GitHub 仓库。
2. 替换根目录的 `index.html`、`style.css`、`script.js`、`content.js`。
3. 按上面的目录把真实素材放进 `作品素材/`。
4. 把求职简历放在根目录并命名 `resume.pdf`，或修改 `about.resume`。
5. 在 `content.js` 填真实公开邮箱和社交主页。
6. 用 VS Code Live Server 打开 `index.html`。
7. 逐项检查：首页筛选、6 个详情页、MP4 播放、图片、PDF、Esc 关闭、手机宽度。
8. 确认无误后上传 GitHub；等待 Pages 部署后 Ctrl+F5 强制刷新。

## 日常新增项目

以后新增作品不需要改 HTML / CSS / script.js。复制 `content.js` 里一个 project，修改：`id`、标题、分类、封面、简介和 `sections` 即可。

## 关于视频

GitHub Pages 能直接播放仓库中的 MP4，但仓库不适合长期堆积很多大视频。建议先导出网页展示版（H.264 MP4，合理码率），保留高清母版在本地/网盘。若单个文件很大，再考虑视频平台或对象存储。


# Portfolio Manager（本地管理器）

网站根目录现在多了 `manager.html`。它是这个作品集的本地后台，不是第二套网站。

## 推荐浏览器

请使用桌面版 Chrome 或 Edge。管理器使用浏览器的 File System Access API，需要你主动授权网站文件夹，才能在本地复制素材和写回 `content.js`。

## 使用方法

1. 双击打开 `manager.html`。
2. 点击「选择作品集文件夹」。
3. 选择包含 `index.html`、`content.js` 的网站根目录。
4. 左侧选择项目。
5. 可以修改标题、分类、年份、职责、简介；拖入封面；增加 Video / Gallery / PDF / File / Link 模块。
6. 拖入素材后，管理器会把文件复制到 `作品素材/<项目ID>/`。
7. 点击右上角「保存到 content.js」。
8. 点击「预览网站」检查页面。
9. 确认后再用 GitHub Desktop Commit + Push，GitHub Pages 会更新线上网站。

## 重要

- Manager 不会自动上传 GitHub，也不会要求 GitHub Token。
- 删除项目只删除 `content.js` 中的记录，不会删除磁盘上的素材，避免误删原文件。
- 第一次使用前建议备份整个网站文件夹。
- Manager 保存 `content.js` 时会把配置规范化为 JSON 风格的 JavaScript 对象，因此原有注释会被替换；网站功能不受影响。


## 2026-10 修复说明

本修复包处理了三个问题：

1. Manager 旧版保存 `content.js` 时把换行错误写成了字面量 `\\n`，导致浏览器无法执行 `content.js`。
2. `script.js` 的详情页仍读取旧的 `media` 数据结构，没有读取 v2.1 的 `sections`。
3. 下载/重复文件产生的 `index(1).html`、`script(1).js`、`style(1).css` 已统一恢复为网站实际引用的 `index.html`、`script.js`、`style.css`。

请用本包中的同名文件覆盖网站根目录对应文件。
