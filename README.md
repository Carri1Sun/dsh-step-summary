# dsh-step-summary

给 DeepSeek Harness 的 Trajectory 增加一个按步骤生成的语义摘要视图：你可以手动为任意步骤生成「输出摘要」和「输入上下文变化摘要」，并展开查看原始思考、工具调用与上下文新增内容。

- 只在你点击时调用模型，不自动摘要、不阻塞工作 Agent。
- 只使用你已配置的 DeepSeek Flash；缺失或不唯一时明确失败，不回退到当前会话模型。
- 摘要结果本地缓存，可单条重新生成；原始记录仍保留在 Trajectory。

![布局预览（近似配色）](docs/preview.png)

## 功能

- **按步骤的输出摘要**：概括这一步实际做了什么、结果与明确失败，不复述私密推理。
- **按步骤的输入变化**：列出这一步相对上一步新增的上下文（用户消息、助手输出、工具调用、工具结果、上下文压缩），并可生成一两句变化摘要。
- **原始数据分开查看**：输入块展开「原始输入」，输出块展开「原始思考」「助手输出」「工具调用」（含参数与结果）。
- **选择与批量**：全选、部分多选、单条生成；输入摘要与输出摘要各自独立缓存。
- **零自动请求**：打开视图只读取步骤与已有缓存，不发起模型请求。

## 安装

要求：DeepSeek Harness 版本包含 `sessionProjections`、`storageDomain`、`commands` 和 `conversation.view` / `useProjection` 接口（本项目在 2026-11 的桌面版上开发）。

在 Harness 中打开 **Plugins → Add plugin**，选择以下任一来源：

1. **Tarball**：选择 `npm pack` 产出的 `.tgz` 文件。
2. **本地目录**：先在目录内执行 `npm install`（安装 `zod`），再把绝对路径填入 Add plugin。
3. **Git 仓库**：填入仓库地址，依赖由 pnpm 安装。

安装后启用 `dsh-step-summary`，刷新页面，会话视图会出现「步骤摘要」标签页。

## 使用

1. 打开会话中的「步骤摘要」视图。
2. 勾选步骤（或全选），在步骤卡片中：
   - 「输入 · 上下文变化」：生成输入摘要，展开「原始输入」查看新增条目。
   - 「输出 · 助手响应」：生成输出摘要，展开原始思考、助手输出与工具调用。
3. 顶部可按选择批量生成输入或输出摘要。
4. 已有摘要会命中缓存；点「重新生成」才会再次请求模型。

## 模型与数据

- 解析规则：只接受唯一的、已注册的 DeepSeek Flash 路由（provider/model/name 同时匹配 DeepSeek 与 Flash）。
- 思考强度：当前官方 Flash 提供 `off` / `low` / `high` / `max`，其中 `high` 是官方说明的「多数任务的默认平衡档」，插件使用 `high`；若模型真实声明 `medium`，则使用 `medium`；两者都不满足时直接报错。
- 不会使用当前会话模型，也不会回退到其他 provider。
- 摘要缓存在本机 profile 存储：`$DSH_HOME/storages/stepsummary.json`。
- 除发往已配置的模型 provider 外，插件不发起其他网络请求。

## 已知限制

- 为保证投影数据体积可控，较早步骤的明细会被省略，提示到 Trajectory 查看；摘要仍可对这些步骤生成（Host 会读取完整会话）。
- 「输入」展示的是相对上一步的**增量**，不是该步完整的累积上下文；完整上下文即会话本身，可在 Trajectory 查看。
- 明细与摘要只针对已完成步骤；进行中的步骤在完成后才能生成。
- 界面文案支持中文与英文；主题色跟随 Harness 的明暗主题。

## 开发

```bash
npm install
npm test
```

测试覆盖：步骤/输入推导、投影 schema、缓存复用与重新生成、严格 Flash 档位解析、Client 传输协议。

## English

`dsh-step-summary` adds a per-step summary view to DeepSeek Harness Trajectory. For each completed step you can manually generate an output summary and an input-context-change summary, and expand the raw input delta, thinking, assistant text, and tool calls. Generation happens only on click, uses only the configured DeepSeek Flash (balanced reasoning, no fallback), and caches results locally.

Install it through **Plugins → Add plugin** with a tarball, a local directory (run `npm install` first), or a Git URL.

## License

MIT
