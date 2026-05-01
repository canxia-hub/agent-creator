# Agent Creator

Agent 创建向导技能 - 帮助用户快速、规范地创建新的 OpenClaw Agent。

## 功能特性

- 🚀 **交互式创建向导**：5分钟完成 Agent 创建
- 📄 **自动生成配置**：生成 6 个核心配置文件
- 🎯 **模板系统**：5 种预定义模板
- 🦞 **飞书集成**：自动配置飞书机器人
- 🔄 **多 Agent 路由**：配置消息路由
- 🧩 **技能自动安装**：一键安装 12 个必备技能
- ✅ **配置验证**：自动验证并注册到 Gateway

## 快速开始

### 安装技能

```bash
# 使用 skill-manager 安装
skill-manager install agent-creator

# 或手动复制到 skills 目录
cp -r agent-creator ~/.openclaw/workspace/skills/
```

### 创建新 Agent

```bash
# Windows
agent-creator.cmd create

# Linux/macOS
./scripts/create.js
```

### 其他命令

```bash
# 列出所有 Agent
agent-creator.cmd list

# 验证 Agent 配置
agent-creator.cmd validate my-agent

# 配置飞书应用
agent-creator.cmd feishu-setup my-agent

# 配置多 Agent 路由
agent-creator.cmd routing-setup "main,my-agent"

# 注册 Agent
agent-creator.cmd register my-agent
```

## 文件结构

```
agent-creator/
├── SKILL.md                    # 技能说明文档
├── package.json                # 依赖配置
├── agent-creator.cmd           # Windows 入口脚本
├── README.md                   # 本文件
├── scripts/
│   ├── create.js               # 创建向导主脚本
│   ├── validate.js             # 配置验证
│   ├── install-skills.js       # 技能安装
│   ├── feishu-setup.js         # 飞书配置
│   ├── routing-setup.js        # 路由配置
│   ├── register.js             # Agent 注册
│   ├── list.js                 # Agent 列表
│   ├── templates/              # 配置模板
│   │   ├── personal-assistant/
│   │   ├── team-helper/
│   │   └── coding-assistant/
│   └── utils/
│       ├── file-generator.js   # 文件生成工具
│       └── config-validator.js # 配置验证工具
```

## 模板列表

| 模板 | 用途 | 预配置技能 |
|------|------|-----------|
| personal-assistant | 个人日常助手 | memory, searxng-web-search |
| team-helper | 团队协作助手 | feishu-bitable, feishu-doc |
| coding-assistant | 代码开发助手 | agent-browser, memory |

## 必备技能（12个）

创建 Agent 时自动安装：

1. lancedb-query - 长期记忆检索
2. memory-manager - 记忆文件管理
3. cron-manager - 定时任务
4. self-improving-agent - 自我进化
5. searxng-web-search - 网络搜索
6. agent-browser - 浏览器自动化
7. powershell - PowerShell 支持
8. skill-finder-cn - 技能查找
9. agent-config - Agent 配置
10. agent-team-orchestration - 团队编排
11. task-decomposer - 任务分解
12. （预留）

## 创建流程

```
1. 输入 Agent ID
2. 输入显示名称
3. 选择表情符号
4. 选择用途模板
5. 选择默认模型
6. 选择必备技能
7. 选择可选技能
8. 确认创建
9. 自动生成文件
10. 安装技能
11. 注册 Agent
```

## 故障排查

### 创建失败
- 检查工作区路径权限
- 确认 Agent ID 格式正确
- 验证 openclaw CLI 可用

### 技能安装失败
- 检查网络连接
- 确认 skill-manager 已安装
- 查看安装日志

### 飞书配置失败
- 检查 App ID 和 App Secret
- 确认应用已发布
- 验证权限已开通

## 许可证

Apache-2.0

## 作者

小千 (Xiao Qian) 👡
