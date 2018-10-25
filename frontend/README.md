# Hi 起小程序主仓库

## 使用

全局安装 wepy：

```bash
npm i wepy -g
```

clone 本项目到本地，执行 `npm i` 安装依赖，依赖安装成功后，执行：

```bash
wepy build --watch
```

打开开发者工具，开发目录选择 `dist` 目录，同时关闭ES6转ES5、关闭上传代码时样式自动补全、关闭代码压缩上传。

Wepy 使用教程请看[官方文档](https://tencent.github.io/wepy/document.html#/)

## 开发

开发功能，请在 master 分支上创建新分支：

```bash
git checkout -b [分支名]
```

在新分支上完成开发，分支名请遵循以下命名规则：

- `fixbugs/xxxx`：修复 BUG
- `feature/xxxx`：新的功能、页面、特性等
- `improve/xxxx`：页面代码优化等

完成开发后，请先 `merge master` 分支到本分支：

```bash
git merge master

然后登陆[仓库主页](https://coding.net/u/hiwakeup/p/wxapp/git)，点击“新建合并请求”，详细填写合并标题和合并描述，添加评审者为 `ceocjy@vip.qq.com`，添加标签，然后提交合并请求。

开发分支合并到 `master` 不可自行操作，只可通过提交合并请求，在 Jason review 代码之后由 Jason 合并。

## 关于 Commit Message

每个 commit 都需要带有描述提交内容的 commit message，commit message 需以 `Add`，`Update`，`Delete`，`Improve` 开头，例如：

- `Add: readme.md`
- `Delete: remove unuse files`
- `Improve: optimize xxx.js`
