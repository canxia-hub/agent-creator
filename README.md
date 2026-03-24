# Agent Creator

<p align="center">
  <img src="https://img.shields.io/badge/version-3.1.0-blue.svg" alt="version">
  <img src="https://img.shields.io/badge/format-XML%20First-green.svg" alt="format">
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="license">
</p>

Agent creation wizard for OpenClaw. Create new OpenClaw Agents quickly and properly with core config files, Feishu bot setup, workspace initialization, and skill installation.

OpenClaw Agent 创建向导技能。帮助用户快速、规范地创建新的 OpenClaw Agent，包括生成核心配置文件、配置飞书应用、设置工作区、安装必备技能、验证配置完整性。

## Features | 功能特性

- 🚀 **Interactive Creation Wizard** - Guided input, create Agent in 5 minutes
- 📐 **Architect-First Design** - Follow `openclaw-core-files-architect` principles (v2.0 XML-First)
- 📄 **XML-First Templates** - Default use XML structured templates for better multi-model collaboration
- 🎯 **High-Quality Config Generation** - Generate 7+ core files following architect standards
- 🔄 **Markdown Compatibility** - Retain Markdown basic templates for compatibility
- 🦞 **Feishu Integration** - Auto-configure Feishu bot app and permissions
- 🔄 **Multi-Agent Routing** - Configure bindings for message routing
- 🧩 **Auto Skill Installation** - One-click install required skills
- ✅ **Quality Validation** - Auto-validate config integrity, file quality and register to Gateway

| 功能 | 说明 |
|------|------|
| 🚀 交互式创建向导 | 引导式输入，5 分钟完成 Agent 创建 |
| 📐 架构优先设计 | 遵循 `openclaw-core-files-architect` 核心原则（v2.0 XML 优先） |
| 📄 XML 优先模板 | 默认使用 XML 结构化模板，更利于多模型协作 |
| 🎯 高质量配置生成 | 按职责边界生成 7+ 核心文件，符合架构师标准 |
| 🔄 Markdown 兼容 | 保留 Markdown 基础模板作为兼容方案 |
| 🦞 飞书集成 | 自动配置飞书机器人应用和权限 |
| 🧩 技能自动安装 | 一键安装必备技能 |
| ✅ 质量验证 | 自动验证配置完整性、文件质量并注册到 Gateway |

## XML-First Core Files Guide | XML 格式设计核心文件指南

This skill follows the `openclaw-core-files-architect` v2.0 XML-First principle.

### XML Advantages | XML 优势

| Advantage | Description |
|-----------|-------------|
| **Clearer Boundaries** | Personality, rules, preferences in different tags |
| **Stable Local Edits** | Modifying specific nodes won't affect others |
| **Multi-Model Collaboration** | Different models can identify explicit tags |
| **Programmatic Maintenance** | Scripts can precisely locate and update |
| **Branch Evolution** | Easily generate Markdown versions, simplified versions |

### XML Root Tags | XML 专用根标签

| File | XML Root Tag |
|------|-------------|
| AGENTS.md | `<agent_contract>` |
| SOUL.md | `<soul_profile>` |
| USER.md | `<user_profile>` |
| TOOLS.md | `<tool_notes>` |
| MEMORY.md | `<long_term_memory>` |
| HEARTBEAT.md | `<heartbeat>` |
| IDENTITY.md | `<identity_profile>` |
| BOOTSTRAP.md | `<bootstrap>` |

## Installation | 安装

### Via ClawHub (Recommended)

```bash
clawhub install agent-creator
```

### Manual Installation

```bash
# Clone to your OpenClaw skills directory
git clone https://github.com/canxia-hub/agent-creator.git
cd agent-creator
# Copy to your OpenClaw skills directory
cp -r . ~/.openclaw/workspace/skills/agent-creator/
```

## Usage | 使用方法

```bash
# Create new Agent (interactive)
agent-creator create

# Or in your workspace
cd ~/.openclaw/workspace
node skills/agent-creator/scripts/create.js
```

## Template Types | 模板类型

| Template | Description |
|----------|-------------|
| `personal-assistant` | Personal daily assistant (default) |
| `team-helper` | Team collaboration assistant |
| `coding-assistant` | Code development assistant |
| `data-analyst` | Data analysis assistant |
| `customer-service` | Customer service assistant |

## Files Structure | 文件结构

```
agent-creator/
├── SKILL.md                              # Main skill definition
├── README.md                             # This file
├── LICENSE                               # MIT License
├── scripts/
│   ├── create.js                         # Main creation script
│   ├── templates/
│   │   ├── common/                       # Common high-quality templates
│   │   │   ├── AGENTS.md.xml.template    # XML-first AGENTS.md template
│   │   │   ├── SOUL.md.xml.template      # XML-first SOUL.md template
│   │   │   ├── USER.md.xml.template      # XML-first USER.md template
│   │   │   ├── TOOLS.md.xml.template     # XML-first TOOLS.md template
│   │   │   ├── MEMORY.md.xml.template    # XML-first MEMORY.md template
│   │   │   ├── HEARTBEAT.md.xml.template # XML-first HEARTBEAT.md template
│   │   │   ├── IDENTITY.md.xml.template  # XML-first IDENTITY.md template
│   │   │   └── BOOTSTRAP.md.xml.template # XML-first BOOTSTRAP.md template
│   │   ├── personal-assistant/           # Personal assistant templates
│   │   ├── team-helper/                  # Team helper templates
│   │   └── coding-assistant/             # Coding assistant templates
│   └── utils/
│       ├── file-generator.js             # File generator
│       ├── template-config.js            # Template configuration
│       └── validate-core-files.js        # Quality validation
└── references/
    └── core-files-quality-standards.md   # Quality standards doc
```

## Related Skills | 相关技能

- [openclaw-core-files-architect](https://github.com/canxia-hub/openclaw-core-files-architect) - Core files architect skill

## License | 许可证

MIT License - See [LICENSE](LICENSE) for details.

## Author | 作者

小千 (Xiao Qian) - OpenClaw Agent

---

<p align="center">
  <a href="https://openclaw.ai">OpenClaw</a> • 
  <a href="https://clawhub.com">ClawHub</a>
</p>
