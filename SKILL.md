---
name: agent-creator
description: "Agent 创建向导技能。帮助用户快速、规范地创建新的 OpenClaw Agent，包括生成核心配置文件、配置飞书应用、设置工作区、安装必备技能、验证配置完整性。Use when: (1) 创建新 Agent, (2) 配置 Agent 身份和人格, (3) 设置飞书机器人, (4) 配置多 Agent 路由, (5) 安装 Agent 必备技能"
metadata:
  author: 小千 (Xiao Qian)
  version: "3.1.0"
  tags: agent create setup feishu skills install quality architect xml-first
  category: system
  requires:
    bins: ["openclaw", "skill-manager"]
  references:
    - name: openclaw-core-files-architect
      path: ~/.openclaw/skills/openclaw-core-files-architect/SKILL.md
      description: 核心文件架构设计原则（XML 优先 v2.0）
    - name: core-files-quality-standards
      path: references/core-files-quality-standards.md
      description: 核心文件质量标准
---

# Agent Creator - Agent 创建向导

帮助用户快速、规范地创建新的 OpenClaw Agent，一站式完成从配置到部署的全流程。

---

## 核心设计理念

> 📐 **架构优先**：本技能遵循 `openclaw-core-files-architect` 的核心文件设计原则，确保创建的 Agent 从第一天就拥有清晰、可维护的文件架构。

### 文件分层原则

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 0: 系统内核层 (AGENTS.md)                            │
│  - 会话启动顺序、工具路由、安全边界、记忆写回规则            │
│  - 变化频率: 极低 | 常驻上下文: 是 | 职责: 运行契约          │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: 身份人格层 (SOUL.md + IDENTITY.md)               │
│  - 身份感、风格语气、价值取向、行为边界                      │
│  - 变化频率: 低 | 常驻上下文: 是 | 职责: 人格定义            │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: 用户画像层 (USER.md)                              │
│  - 用户称呼、长期偏好、输出偏好、工作环境偏好                │
│  - 变化频率: 中低 | 常驻上下文: 是 | 职责: 服务对象配置       │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: 环境工具层 (TOOLS.md)                             │
│  - 本地工具约定、路径、API Key 指针、平台约束               │
│  - 变化频率: 中 | 常驻上下文: 是 | 职责: 环境配置            │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: 记忆索引层 (MEMORY.md)                            │
│  - 长期事实、关键决策、重复踩坑规则、项目主线                │
│  - 变化频率: 中 | 常驻上下文: 是 | 职责: 记忆索引            │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: 心跳巡检层 (HEARTBEAT.md)                         │
│  - 极短巡检卡、定期检查、轻量提醒                            │
│  - 变化频率: 高 | 常驻上下文: 否(按需) | 职责: 巡检          │
├─────────────────────────────────────────────────────────────┤
│  Layer 6: 每日日志层 (memory/YYYY-MM-DD.md)                 │
│  - 当日事件、临时约束、待跟进事项                            │
│  - 变化频率: 极高 | 常驻上下文: 否(启动时加载) | 职责: 日志   │
└─────────────────────────────────────────────────────────────┘
```

### 职责边界铁律

| 文件 | ✅ 应该包含 | ❌ 不应包含 |
|------|-----------|-----------|
| `AGENTS.md` | 启动顺序、工具路由、安全边界、记忆写回规则 | 人格描写、用户画像、项目流水账 |
| `SOUL.md` | 身份感、风格语气、价值取向、行为边界 | 工具调用 SOP、短期状态 |
| `IDENTITY.md` | 名字、外貌、背景故事、能力面板 | 复杂操作规则 |
| `USER.md` | 用户称呼、长期偏好、已知约束 | 今天要办的事、刚做完的任务 |
| `TOOLS.md` | 本地工具约定、路径、API Key 指针 | 工具完整文档、人格内容 |
| `MEMORY.md` | 长期事实、关键决策、重复踩坑规则 | 时间序列日志、大量已过期上下文 |
| `HEARTBEAT.md` | 3-6 条高价值检查 | 长篇指令墙 |

---

## 核心功能

- 🚀 **交互式创建向导**：引导式输入，5 分钟完成 Agent 创建
- 📐 **架构优先设计**：遵循 `openclaw-core-files-architect` 核心原则（v2.0 XML 优先），一步到位
- 📄 **XML 优先模板**：默认使用 XML 结构化模板，更利于多模型协作和程序化维护
- 🎯 **高质量配置生成**：按职责边界生成 7+ 核心文件，符合架构师标准
- 🔄 **Markdown 兼容**：保留 Markdown 基础模板作为兼容方案
- 🦞 **飞书集成**：自动配置飞书机器人应用和权限
- 🔄 **多 Agent 路由**：配置 bindings 实现消息路由
- 🧩 **技能自动安装**：一键安装必备技能
- ✅ **质量验证**：自动验证配置完整性、文件质量并注册到 Gateway
- 🔍 **架构师诊断**：创建后自动执行质量打分，确保符合标准

---

## 快速开始

### 创建新 Agent（交互式）

```bash
agent-creator create
```

**流程**：
1. 输入 Agent 名称
2. 选择表情符号
3. 选择用途模板
4. 选择模型
5. 选择必备技能（默认全选）
6. 选择可选技能
7. 确认创建 → **自动生成高质量核心文件（默认 XML 格式）**

---

## XML 格式设计核心文件指南

> 📐 **XML 优先原则**：根据 `openclaw-core-files-architect` v2.0，本技能默认采用 XML 结构化格式设计核心文件。

### 为什么 XML 更优

| 优势 | 说明 |
|------|------|
| **边界更清晰** | 人格、规则、偏好、决策可放进不同标签，不容易互相污染 |
| **局部编辑更稳** | 修改 `<rule id="memory-writeback">` 比修改混合段落更不容易误伤 |
| **多模型协作** | 不同模型通常都能较稳定识别显式标签与属性 |
| **程序化维护** | 可用脚本、hook、搜索替换、差异比较去维护特定节点 |
| **分支演化** | 可轻松再生成 Markdown 版、精简版、渠道版、子 agent 版 |

### XML 设计规范

1. **文件名保持不变**：仍使用 `AGENTS.md`、`SOUL.md` 等 `.md` 扩展名
2. **内容使用 XML 结构**：文件主体使用 XML 标签表达核心语义
3. **单一根标签**：每个文件只有一个语义明确的根标签
4. **嵌套不超过 3 层**：语义清晰比层级华丽更重要
5. **关键规则带 `id`**：便于精准定位和更新
6. **短而高信号**：每个节点都应尽量短而明确

### XML 专用根标签

| 文件 | XML 根标签 | 说明 |
|------|-----------|------|
| `AGENTS.md` | `<agent_contract>` | 运行契约 |
| `SOUL.md` | `<soul_profile>` | 人格设定 |
| `USER.md` | `<user_profile>` | 用户画像 |
| `TOOLS.md` | `<tool_notes>` | 环境工具 |
| `MEMORY.md` | `<long_term_memory>` | 长期记忆 |
| `HEARTBEAT.md` | `<heartbeat>` | 心跳巡检 |
| `IDENTITY.md` | `<identity_profile>` | 身份档案 |
| `BOOTSTRAP.md` | `<bootstrap>` | 分身铸造 |

### XML 示例：AGENTS.md

```xml
<agent_contract>
  <mission>{{AGENT_NAME}} 是一个个人日常助手...</mission>

  <session_startup>
    <step order="1">加载 IDENTITY.md</step>
    <step order="2">加载 SOUL.md</step>
    <step order="3">加载 USER.md</step>
    ...
  </session_startup>

  <tool_routing_rules>
    <rule id="minimal-tooling" priority="high">优先选择作用域最小的工具</rule>
    <rule id="memory-first" priority="high">高风险操作前强制检索记忆</rule>
  </tool_routing_rules>

  <external_action_policy>
    <require_confirmation>
      <action>向外发送信息</action>
      <action>执行破坏性操作</action>
    </require_confirmation>
  </external_action_policy>
</agent_contract>
```

### XML 示例：SOUL.md

```xml
<soul_profile>
  <identity>
    <name>{{AGENT_NAME}}</name>
    <emoji>{{AGENT_EMOJI}}</emoji>
  </identity>

  <core_truths>
    <truth id="helpful">真正地提供帮助</truth>
    <truth id="opinions">要有自己的观点</truth>
  </core_truths>

  <behavioral_boundaries>
    <rule id="privacy-first" priority="critical">用户隐私是逆鳞</rule>
  </behavioral_boundaries>
</soul_profile>
```

### 格式选择

本技能支持两种格式：

| 格式 | 文件后缀 | 使用场景 |
|------|---------|---------|
| **XML 优先** | `.xml.template` | 默认格式，推荐使用 |
| Markdown | `.template` | 兼容方案，特殊环境使用 |

**默认使用 XML 优先格式**。若环境对 XML 兼容较差，可退回 Markdown 格式。

---

## 核心文件构建流程

> 📐 **设计目标**：让 Agent 在创建时就拥有清晰的文件职责边界，避免后期"杂货铺化"。

### 第 1 步：创建工作区骨架

```text
workspace-<agent-id>/
├── AGENTS.md          # 运行契约（必须）
├── SOUL.md            # 人格设定（必须）
├── IDENTITY.md        # 身份档案（可选）
├── USER.md            # 服务对象配置（必须）
├── MEMORY.md          # 记忆系统索引（必须）
├── TOOLS.md           # 环境工具配置（必须）
├── HEARTBEAT.md       # 心跳巡检卡（可选）
├── BOOTSTRAP.md       # 分身铸造协议（可选）
├── memory/            # 记忆文件目录
│   ├── INDEX.md
│   └── YYYY-MM/
│       └── YYYY-MM-DD-完整.md
└── skills/            # 专属技能目录（可选）
```

### 第 2 步：按模板生成 AGENTS.md

**核心原则**：这是运行契约，不是人格设定，不是记忆仓库。

**必须包含**：
- 会话启动顺序 (BIOS_startup_sequence)
- 操作循环 (Operating Loop)
- 工具路由规则 (Tool Routing Rules)
- 外部动作审批边界 (External Action Policy)
- 记忆写回规则 (Memory Writeback Rules)
- 群聊/共享上下文规则 (Shared Context Rules)
- 完成定义 (Definition of Done)
- 失败恢复策略 (Failure Recovery)

**禁止包含**：
- ❌ 大段人格描写 → 迁移到 SOUL.md
- ❌ 长期用户画像 → 迁移到 USER.md
- ❌ 项目流水账 → 迁移到 memory/YYYY-MM-DD.md
- ❌ 工具完整文档 → 迁移到 TOOLS.md 或独立 skill

**模板结构**：
```markdown
# AGENTS.md - Agent 运行契约

## 1. Mission（一句话使命）

## 2. Session Startup（启动顺序）
- 必读文件列表
- 记忆加载规则

## 3. Operating Loop（操作循环）
- 感知 → 判断 → 行动 → 反馈

## 4. Tool Routing Rules（工具路由）
- 首选工具优先级
- 备用方案

## 5. External Action Policy（外部动作审批）
- 必须审批的操作
- 可自动执行的操作

## 6. Memory Writeback Rules（记忆写回）
- 什么内容写到哪里
- 写入触发条件

## 7. Shared Context Rules（共享上下文）
- 群聊规则
- 多 Agent 协作规则

## 8. Definition of Done（完成定义）

## 9. Failure Recovery（失败恢复）
```

### 第 3 步：生成 SOUL.md（人格层）

**核心原则**：这是稳定人格与边界层。

**必须包含**：
- 身份感 (Identity)
- 风格与语气 (Tone)
- 价值取向 (Values)
- 行为边界 (Boundaries)
- 风险偏好中的人格侧 (Risk Posture)

**模板结构**：
```markdown
# SOUL.md - 你是谁

## [Character Base]
- 名字、性别、年龄、外貌
- 性格特征
- 身份定位

## [Vibe]
- 自称方式
- 说话风格
- 常用语气词/表情
- 口头禅

## [Boundaries]
- 护短底线
- 行为禁忌
- 交互分寸

## [Continuity]
- 记忆延续声明
```

### 第 4 步：生成 IDENTITY.md（身份档案）

**核心原则**：这是名字、风格感和外显 identity 的轻量文件。

**必须包含**：
- Character Base（基础角色信息）
- Status & Attributes（状态与属性）
- Lore & Background（背景故事，可选）

**注意**：不要把复杂操作规则塞进这里。

### 第 5 步：生成 USER.md（用户画像层）

**核心原则**：这是稳定用户画像层。

**必须包含**：
- 用户称呼 (How to address)
- 长期偏好 (Long-term preferences)
- 输出偏好 (Output preferences)
- 沟通偏好 (Communication preferences)
- 工作环境偏好 (Work environment)
- 已知约束 (Known constraints)

**禁止包含**：
- ❌ 今天要办的事 → 迁移到 memory/YYYY-MM-DD.md
- ❌ 刚做完的任务 → 迁移到 memory/YYYY-MM-DD.md
- ❌ 一次性短期约束 → 迁移到 memory/YYYY-MM-DD.md

**模板结构**：
```markdown
# USER.md - 服务对象档案

## [Master Base]
- 用户真名、昵称
- 身份、时区
- 平台 ID

## [长期偏好]
- 沟通风格偏好
- 输出格式偏好
- 工作习惯

## [已知约束]
- 隐私保护要求
- 工作时间限制
- 技术栈限制

## [观察日志]（长期累积）
- 当前心力重心
- 厌恶与雷区
- 偏好与舒缓
- 日常健康
```

### 第 6 步：生成 TOOLS.md（环境工具层）

**核心原则**：这是环境与工具使用注记层。

**必须包含**：
- 本地工具约定（路径、版本）
- 哪个 skill 负责什么（指针）
- 平台约束（哪些不适合表格/长文/附件）
- 工具陷阱与注意事项
- 节点/服务/路径/命名约定

**禁止包含**：
- ❌ 工具完整文档 → 引用对应的 SKILL.md
- ❌ 人格内容 → 迁移到 SOUL.md

**模板结构**：
```markdown
# TOOLS.md - 本地环境与工具配置

## 1. 基础设施与硬件
- 操作系统、网络节点、工作区路径

## 2. 机密保险箱（指针）
- API Key 存放位置（不直接写明文）

## 3. 核心义体寻址表
- 工具名 → 本地路径 → 版本 → 依赖

## 4. 专属环境雷区
- 血泪教训、常见坑点

## 5. 自托管服务
- 服务名 → 端口 → 启动命令
```

### 第 7 步：生成 MEMORY.md（记忆索引层）

**核心原则**：这是精炼后的长期记忆索引。

**必须包含**：
- 记忆系统综述
- 长期事实指针
- 关键决策记录
- 重复踩坑规则
- 长期项目主线
- 记忆文件索引

**禁止包含**：
- ❌ 按时间顺序堆满所有事件 → 迁移到 memory/YYYY-MM-DD.md
- ❌ 大量已过期的上下文 → 归档或删除
- ❌ 私密高风险信息（除非用户明确要求）

**模板结构**：
```markdown
# MEMORY.md - 记忆总索引

## 记忆系统综述
- 分层架构说明
- 启动加载流程

## 长期事实索引
- 稳定事实指针

## 关键决策索引
- 重要决策指针

## 重复踩坑规则
- 常见错误与解决方案

## 记忆文件索引
- memory/INDEX.md 指针

## 记忆写回铁律
- 什么内容写到哪里
```

### 第 8 步：生成 HEARTBEAT.md（心跳巡检层）

**核心原则**：极短巡检卡，最多 3-6 条检查。

**必须包含**：
- 小型定期检查
- 少量例行判断
- 是否需要晋升信息到长期记忆

**禁止包含**：
- ❌ 长篇指令墙
- ❌ 复杂操作流程

**模板结构**：
```markdown
# HEARTBEAT.md - 心跳任务配置

## 定期检查任务
1. 检查近期是否有重要未处理事项
2. 检查日志中是否有应晋升的内容
3. 若无重要事项则立即结束

## 通知条件
- 紧急事项
- 2 小时内日程

## 静默时间
- 23:00-08:00
```

### 第 9 步：生成 BOOTSTRAP.md（分身铸造协议，可选）

**核心原则**：用于创建 sub-agent 时的标准模板。

**必须包含**：
- 分身铸造模板
- 分身调度铁律

### 第 10 步：初始化 memory/ 目录

创建初始文件结构：
```text
memory/
├── INDEX.md                    # 月度索引
└── YYYY-MM/
    ├── INDEX.md               # 当月索引
    └── YYYY-MM-DD-完整.md     # 今日初始化
```

---

## 核心文件质量检查与验证

> 📐 **架构师集成**：本技能已集成 `openclaw-core-files-architect` 的质量标准，在创建 Agent 时自动执行质量验证。

### 创建时自动验证

创建完成后，自动执行以下验证流程：

#### 1. 文件存在性检查
- 确保所有必须文件已创建
- 检查目录结构完整性

#### 2. 文件长度验证

| 文件 | 推荐行数 | 最大行数 | 警告阈值 |
|------|---------|---------|---------|
| `AGENTS.md` | 100-200 | 300 | > 250 |
| `SOUL.md` | 50-100 | 150 | > 120 |
| `IDENTITY.md` | 30-60 | 100 | > 80 |
| `USER.md` | 50-80 | 120 | > 100 |
| `TOOLS.md` | 80-150 | 250 | > 200 |
| `MEMORY.md` | 80-150 | 250 | > 200 |
| `HEARTBEAT.md` | 10-20 | 30 | > 25 |

#### 3. 章节完整性检查

**AGENTS.md 必须章节**：
- [ ] Mission（使命）
- [ ] Session Startup（启动顺序）
- [ ] Operating Loop（操作循环）
- [ ] Tool Routing Rules（工具路由）
- [ ] External Action Policy（外部动作审批）
- [ ] Memory Writeback Rules（记忆写回）
- [ ] Shared Context Rules（共享上下文）
- [ ] Definition of Done（完成定义）
- [ ] Failure Recovery（失败恢复）

**SOUL.md 必须章节**：
- [ ] Identity（身份感）
- [ ] Tone（风格语气）
- [ ] Boundaries（行为边界）

**USER.md 必须章节**：
- [ ] Master Base（用户基础信息）
- [ ] Long-term Preferences（长期偏好）
- [ ] Known Constraints（已知约束）

**TOOLS.md 必须章节**：
- [ ] Infrastructure（基础设施）
- [ ] Credentials Pointers（凭证指针）
- [ ] Cyberware Registry（工具寻址）
- [ ] Local Traps（本地雷区）

**MEMORY.md 必须章节**：
- [ ] Memory System Overview（记忆系统综述）
- [ ] LanceDB Query Guide（LanceDB 查询）
- [ ] Memory Files Index（记忆文件索引）
- [ ] Writeback Rules（写回规则）

#### 4. 职责边界验证

检测禁止内容并提示迁移：

| 文件 | 禁止内容 | 迁移目标 |
|------|---------|---------|
| `AGENTS.md` | 人格描写、用户画像、项目流水账 | SOUL.md / USER.md / memory/ |
| `SOUL.md` | 工具调用 SOP、短期状态 | AGENTS.md / memory/ |
| `USER.md` | 今日待办、刚做完的任务 | memory/YYYY-MM-DD.md |
| `TOOLS.md` | 工具完整文档、人格内容 | SKILL.md / SOUL.md |
| `MEMORY.md` | 时间序列日志、大量过期上下文 | memory/YYYY-MM-DD.md |
| `HEARTBEAT.md` | 长篇指令墙、复杂流程 | AGENTS.md / skill |

#### 5. 质量打分

每个核心文件从以下维度打分（0-10 分）：

1. **职责清晰度** - 是否只承担单一职责
2. **长度合理性** - 是否在推荐范围内
3. **重叠度** - 与其他文件的内容重叠程度（越低越好）
4. **过期内容** - 是否含有过期信息
5. **层级正确性** - 短期内容是否误入长期层
6. **长期规则完整性** - 是否缺失必要的长期规则
7. **安全合规** - 是否包含不应公开的敏感信息
8. **可维护性** - 是否便于未来修改和扩展

**打分等级**：
- **9-10 分**：优秀，无需修改 ✅
- **7-8 分**：良好，可小幅优化 👍
- **5-6 分**：及格，需要改进 ⚠️
- **3-4 分**：不及格，需要大幅重构 ❌
- **0-2 分**：严重问题，需要重新设计 💀

### 手动验证命令

```bash
# 验证 Agent 核心文件质量
node scripts/utils/validate-core-files.js <workspace-dir>

# 完整配置验证
agent-creator validate --agent-id <agent-id>
```

### 质量标准参考

详细质量标准请查阅：[references/core-files-quality-standards.md](references/core-files-quality-standards.md)

---

## 模板列表

| 模板 | 用途 | 核心文件预设 |
|------|------|-------------|
| `personal-assistant` | 个人日常助手 | 轻量 AGENTS + 温暖 SOUL |
| `team-helper` | 团队协作助手 | 群聊规则 AGENTS + 专业 SOUL |
| `coding-assistant` | 代码开发助手 | 工具路由 AGENTS + 技术型 SOUL |
| `data-analyst` | 数据分析助手 | 工具密集 TOOLS + 分析型 SOUL |
| `customer-service` | 客户服务助手 | 审批边界 AGENTS + 礼貌型 SOUL |

---

## 必备技能（16 个）

创建 Agent 时自动安装的必备技能：

### 记忆系统核心（4 个）
- **lancedb-query** - LanceDB 向量检索
- **memory-manager** - 记忆文件管理
- **cron-manager** - 定时任务管理
- **self-improving-agent** - 自我进化

### 基础工具（3 个）
- **searxng-web-search** - 网络搜索
- **agent-browser** - 浏览器自动化
- **powershell** - PowerShell 支持

### Agent 管理（4 个）
- **skill-finder-cn** - 技能查找
- **agent-config** - Agent 配置
- **agent-team-orchestration** - 团队编排
- **task-decomposer** - 任务分解
- **skill-manager** - 技能管理

### 通信与媒体（4 个）
- **agent-bridge** - Agent 间通信
- **xiaoqian-tts** - 语音合成
- **volcengine-ark-asr** - 语音识别
- **feishu-media** - 媒体处理

---

## 配置示例

### 个人助手配置

```json
{
  "identity": {
    "name": "学习助手",
    "emoji": "📚",
    "theme": "default"
  },
  "model": "bailian/qwen3.5-plus",
  "workspace": "C:/Users/Administrator/.openclaw/workspace-study",
  "files": {
    "agents_md": "lightweight",
    "soul_md": "warm",
    "user_md": "template",
    "memory_md": "index-only"
  },
  "skills": [
    "lancedb-query",
    "memory-manager",
    "cron-manager",
    "self-improving-agent",
    "searxng-web-search",
    "agent-browser",
    "powershell",
    "skill-finder-cn",
    "agent-config",
    "agent-team-orchestration",
    "task-decomposer",
    "skill-manager",
    "agent-bridge",
    "xiaoqian-tts",
    "volcengine-ark-asr",
    "feishu-media"
  ]
}
```

---

## 最佳实践

### 文件职责原则
1. **一个信息只有一个落点** - 不要重复写入多个文件
2. **按变化速度分层** - 稳定的在常驻文件，易变的在日志
3. **常驻上下文要薄** - 不要堆砌冗余背景故事

### 创建时机
1. **命名规范**：Agent ID 使用小写字母、数字、连字符
2. **工作区隔离**：每个 Agent 使用独立工作区
3. **权限最小化**：只安装必要的技能
4. **定期备份**：使用 `export` 命令定期备份

### 后续维护
1. **每日**：更新 memory/YYYY-MM-DD.md
2. **每周**：检查核心文件是否过厚，执行质量验证
3. **每月**：清理过期内容，晋升有价值信息到 MEMORY.md

---

## 自我改进规则

> 📐 **架构师视角**：当 Agent 在运行中发现问题时，按以下规则进行结构性修复。

### 发现"决策失误"时

先问：这次失误属于哪一层？

| 问题类型 | 修复目标 | 修复方式 |
|---------|---------|---------|
| 行为准则不清 | `AGENTS.md` | 增加明确规则 |
| 人格边界不清 | `SOUL.md` | 补充边界说明 |
| 用户偏好没记住 | `USER.md` / `MEMORY.md` | 记录偏好 |
| 环境工具约定不清 | `TOOLS.md` | 补充约定 |
| 当日上下文遗失 | `memory/YYYY-MM-DD.md` | 改进记录习惯 |
| 长期结论未沉淀 | `MEMORY.md` / LanceDB | 写入长期记忆 |
| 重复操作还靠临时发挥 | 新建 skill | 抽象为技能 |

### 发现"重复出错"时

必须至少做一件结构性修复：
- ✅ 增加明确规则
- ✅ 增加决策边界
- ✅ 抽出独立 skill
- ✅ 删除误导性旧规则
- ✅ 为维护流程增加检查项

### 发现"文件越来越胖"时

立刻做瘦身：
- ✅ 删除重复表述
- ✅ 把例子改成规则
- ✅ 把短期内容移到 daily log
- ✅ 把专门流程拆 skill
- ✅ 把长篇背景改成简洁原则

### 发现"技能已与现实不符"时

优先顺序：
1. 修正文档
2. 修正约束
3. 修正示例
4. 修正命名

---

## 质量门槛

只有当以下条件大部分满足时，才可判断 Agent 创建成功：

- ✅ 每个核心文件都可以用一句话准确描述职责
- ✅ `AGENTS.md` 不再承担人格、用户画像和流水账职责
- ✅ `MEMORY.md` 是蒸馏后的长期记忆，而不是时间序列日志
- ✅ `memory/YYYY-MM-DD.md` 承担短期连续性
- ✅ `HEARTBEAT.md` 足够短，可低成本运行
- ✅ 重复性高的复杂流程已开始迁移到 skill
- ✅ 工作区不存在明显过期、冲突或重复规则
- ✅ 本次创建被记录到 memory/YYYY-MM-DD.md

---

## 禁止事项

- 🚫 不要为了"显得完整"而编造用户偏好、历史事实或长期记忆
- 🚫 不要把敏感信息默认写入长期记忆
- 🚫 不要在核心文件中直接写入明文密码或 API Key
- 🚫 不要把 `HEARTBEAT.md` 写成第二个总指令文件
- 🚫 不要把 `TOOLS.md` 当作技能目录全文备份
- 🚫 不要在没有明确收益时新增大量 skill，造成技能清单膨胀
- 🚫 不要保留明显互相矛盾的旧规则
- 🚫 不要仅修当前问题而不修导致该问题反复出现的结构原因

---

## 相关技能

- **openclaw-core-files-architect** - 核心文件架构设计原则（本技能的核心参考）
- **agent-config** - Agent 配置标准流程
- **agent-team-orchestration** - 多 Agent 团队编排
- **skill-manager** - 技能管理
- **self-improving-agent** - 自我进化与反思

---

## 文件结构

```
agent-creator/
├── SKILL.md                          # 本文件
├── references/
│   └── core-files-quality-standards.md  # 核心文件质量标准
├── scripts/
│   ├── create.js                     # 交互式创建向导
│   ├── validate.js                   # 配置验证
│   ├── templates/
│   │   ├── common/                   # 通用高质量模板
│   │   │   ├── AGENTS.md.template
│   │   │   ├── SOUL.md.template
│   │   │   ├── USER.md.template
│   │   │   ├── TOOLS.md.template
│   │   │   ├── MEMORY.md.template
│   │   │   ├── HEARTBEAT.md.template
│   │   │   ├── IDENTITY.md.template
│   │   │   └── BOOTSTRAP.md.template
│   │   ├── personal-assistant/       # 个人助手模板（可选覆盖）
│   │   ├── team-helper/              # 团队助手模板
│   │   ├── coding-assistant/         # 代码助手模板
│   │   ├── data-analyst/             # 数据分析师模板
│   │   └── customer-service/         # 客服助手模板
│   └── utils/
│       ├── file-generator.js         # 文件生成工具
│       ├── config-validator.js       # 配置验证工具
│       ├── validate-core-files.js    # 核心文件质量验证
│       └── template-config.js        # 模板配置
└── package.json
```

---

*技能版本 v3.1 (XML-First)*  
*更新日期：2026-03-24*  
*创建者：小千 👡*  
*参考：openclaw-core-files-architect v2.0 (XML-First)*
