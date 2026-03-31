---
name: agent-creator
description: "Agent 创建架构指南。面向通用使用场景，基于 OpenClaw 核心文件设计思路，以 XML-first 方式手动、审慎地创建 Agent。完整创建必须包含 AGENTS、IDENTITY、SOUL、USER、TOOLS、MEMORY 六个核心文件，并逐个完成细致设计。所有新 Agent 从创建开始就具备正式通信能力。Use when: (1) 创建新 Agent, (2) 重构 Agent 创建流程, (3) 设计核心文件体系, (4) 审核 Agent 架构完整性"
metadata:
  author: 小千 (Xiao Qian)
  version: "3.2.0"
  tags: agent create architecture xml-first manual careful communication plan-mode verify-philosophy
  category: system
  methodology_source: openclaw_core_files_architect
  inspired_by: "Claude Code v2.1.88 system prompts analysis"
---

# Agent Creator - Agent 创建架构指南

## 使命

本技能不是"快速生成器",而是 **Agent 架构设计指南**。

它服务于通用使用场景下的新 Agent 创建,强调以下原则:

1. **完整性优先**:完整创建必须包含 `AGENTS.md`、`IDENTITY.md`、`SOUL.md`、`USER.md`、`TOOLS.md`、`MEMORY.md` 六个核心文件。
2. **XML-first**:默认以 XML 作为核心文件主格式,提升边界清晰度、局部可编辑性与跨模型稳定性。
3. **手动审慎**:不自动批量生成,不依赖脚本,不跳过思考;每个文件都必须逐项设计、逐项审核。
4. **职责单一**:每个核心文件只承担自己的结构职责,不允许混杂成"杂货铺"。
5. **泛化优先**:先设计可泛化的完成标准、方法论、安全边界、记忆系统和用户传递机制,再考虑具体业务细节。

---

## Agent 的本质(创建前必须明确)

在 OpenClaw 中,Agent 不是单一 prompt,也不是一个会说话的工具壳。

一个可持续运行的 Agent,本质上是由以下五层共同构成的:

1. **运行契约层**:规定它如何工作、如何调用工具、何时停下、何时汇报。由 `AGENTS.md` 承担。
2. **身份人格层**:规定它是谁、如何说话、持有什么价值边界。由 `IDENTITY.md` 与 `SOUL.md` 共同承担。
3. **用户对齐层**:规定它服务谁、如何识别主人、如何传递稳定偏好。由 `USER.md` 承担。
4. **环境能力层**:规定它处于什么工作区、拥有什么本地工具约定、有哪些环境陷阱。由 `TOOLS.md` 承担。
5. **长期连续性层**:规定它如何记住重要事实、决策、经验和长期主线。由 `MEMORY.md` 承担。

因此,**创建 Agent 的核心不是"写几段设定",而是搭建一个长期可运行、可维护、可延续的结构系统。**

---

## OpenClaw 核心文件设计思路(创建方法论基础)

基于 OpenClaw 核心文件架构方法,创建 Agent 时必须遵守以下设计思路:

### 1. 按职责分层,而不是按灵感堆叠

- 运行规则 → `AGENTS.md`
- 身份事实 → `IDENTITY.md`
- 人格与行为边界 → `SOUL.md`
- 用户画像与授权关系 → `USER.md`
- 工具与环境约定 → `TOOLS.md`
- 长期记忆协议 → `MEMORY.md`

### 2. 按变化速度分层

- 高频稳定规则 → 常驻核心文件
- 稳定但低频事实 → `MEMORY.md`
- 临时事项与日志 → `memory/YYYY-MM-DD.md`(如后续建立)
- 重复且专门化流程 → 独立 skill,而不是继续塞进核心文件

### 3. 按边界强度分层

- **强约束**:安全红线、审批边界、身份验证规则,必须显式写入 XML 节点,并带 `priority="critical"` 或等价标识。
- **方法论**:任务完成标准、工作循环、失败恢复、记忆晋升逻辑,应写成稳定规则,而非散文说明。
- **风格层**:语气、称呼、行为模式写在 `SOUL.md`,不得污染 `AGENTS.md`。

### 4. 先骨架,后内容;先边界,后润色

正确顺序不是先写故事,而是:

1. 先确定职责与权限
2. 先定义边界与方法
3. 再确定人格与身份
4. 最后才补充风格与表现细节

---

## 完整创建的硬性要求

**完整的 Agent 创建,必须包含以下六个核心文件,缺一不可:**

1. `AGENTS.md`
2. `IDENTITY.md`
3. `SOUL.md`
4. `USER.md`
5. `TOOLS.md`
6. `MEMORY.md`

这六个文件分别承担:

| 文件 | 核心职责 | 绝对不能缺失的原因 |
|------|----------|--------------------|
| `AGENTS.md` | 运行契约、完成标准、安全边界 | 没有它,Agent 不知道如何工作 |
| `IDENTITY.md` | 身份事实、职责、权限、关系 | 没有它,Agent 的"是谁"会漂移 |
| `SOUL.md` | 人格、语言风格、行为边界 | 没有它,Agent 的行为一致性会崩塌 |
| `USER.md` | 用户信息、偏好、权限与验证 | 没有它,Agent 无法稳定对齐服务对象 |
| `TOOLS.md` | 工具环境、路径、服务约定 | 没有它,Agent 容易误用工具和环境 |
| `MEMORY.md` | 长期记忆协议、经验沉淀机制 | 没有它,Agent 无法形成跨会话连续性 |

**原则**:这六个文件不是装饰品,而是 Agent 的最小可运行架构。任何省略,都会导致结构性缺陷。

---

## 通用创建流程(面向泛化场景)

### 深度层接入说明

当 Agent 满足以下任一条件时,完成通用创建与情景特化后,必须继续进入深度创建流程:
- 预期长期常驻运行
- 承担管理、审查、架构、协调、专业决策等重要职责
- 需要真正理解用户需求并交付复杂结果
- 使用 T4 增强档位创建

深度创建流程详见:
- `references/good-agent-formation-model.md`
- `references/user-painpoint-discovery-framework.md`
- `references/industry-depth-injection-model.md`
- `references/delivery-capable-agent-standard.md`
- `references/deep-creation-flow.md`

## 第 0 步:创建前调研与定义

在真正开始写文件之前,必须完成以下调研与定义:

### A. 明确 Agent 的任务本质

回答以下问题:

- 这个 Agent 的核心职责是什么?
- 它处理的是哪一类通用问题,而不是哪一个临时任务?
- 它的长期存在价值是什么?
- 它是主 Agent、职能 Agent、领域 Agent,还是临时分身?

### B. 明确完成标准

必须先定义泛化的任务完成标准,例如:

- 结果是否必须验证?
- 是否必须给出下一步建议?
- 是否必须进行记忆写回?
- 是否必须展示 diff / 风险 / 边界?
- 失败时是否必须降级、熔断或汇报?

### C. 明确安全边界

必须先回答:

- 哪些操作绝对禁止?
- 哪些操作需要审批?
- 哪些信息绝不能外泄?
- 哪些对象拥有指挥权?
- 出现冲突命令时以谁为最高优先?

### D. 明确记忆架构

必须先定义:

- 什么信息可以进入长期记忆?
- 什么信息只应留在短期日志?
- 什么错误和经验需要晋升为长期规则?
- 记忆检索在任务流程中的触发点是什么?

### E. 明确用户传递机制

必须先定义:

- Agent 服务谁?
- 如何验证服务对象身份?
- 用户的长期偏好如何表达?
- 输出结构、语言和风格如何稳定传递?

---

## 第 1 步:定义基础元信息

逐项确认以下字段:

| 字段 | 说明 | 要求 |
|------|------|------|
| `agent_id` | 全局唯一标识 | 小写字母 / 数字 / 连字符 |
| `name` | 对内外显示名 | 能准确表达职责 |
| `role` | 角色定位 | 清晰、稳定、非临时描述 |
| `workspace` | 工作区路径 | 独立隔离 |
| `owner/superior/master` | 所属关系 | 明确上下级与最终服务对象 |
| `default_model` | 默认模型 | 与任务类型匹配 |

**审核要点**:
- [ ] 是否能一句话说明该 Agent 的长期存在理由?
- [ ] `agent_id` 是否规范且可长期使用?
- [ ] 是否已明确上下级、服务对象与权限来源?

---

## 第 2 步:创建六个核心文件骨架

必须先创建六个文件的 XML-first 骨架,再填充内容。

### 推荐目录最小形态

```text
~/.openclaw/workspace-<agent-id>/
├── AGENTS.md
├── IDENTITY.md
├── SOUL.md
├── USER.md
├── TOOLS.md
├── MEMORY.md
└── memory/
```

**注意**:
- 不要求一开始就创建大量附属文件。
- 但六个核心文件必须在首轮完整创建中全部建立。
- 每个文件都必须有清晰根标签、purpose/role/version/status 等基础元数据。

---

## 第 3 步:逐个设计六个核心文件

以下内容是本技能的核心。创建时必须逐文件设计,不允许跳过。

### A. `AGENTS.md` -- 运行契约文件

#### 文件本质
`AGENTS.md` 负责规定 Agent **如何工作**,而不是它"是什么性格"。

#### 通用设计目标
必须重点承载:
- 泛化任务完成标准
- 指导方法论
- 安全边界
- 工具路由原则
- 失败恢复机制
- 外部动作审批规则
- 记忆写回规则

#### 必须包含的结构
1. `metadata`
2. `mission`
3. `session_startup`
4. `operating_loop`
5. `safety_boundaries`
6. `tool_routing_rules`
7. `external_action_policy`
8. `agent_communication_discipline`(⚠️ 必须包含,见下方详细说明)
9. `memory_writeback_rules`
10. `failure_recovery`
11. `definition_of_done`
12. `references`

#### 设计重点
- **完成标准泛化**:不要写成某一任务的 SOP,而要写成对各种任务都适用的"完成定义"。
- **方法论显式化**:例如"先理解任务 → 选择最小必要工具 → 执行验证 → 写回记忆"。
- **安全边界优先级最高**:高危行为、外发、删除、越权必须显式约束。
- **审批链清晰**:谁能授权、谁必须汇报,要明确。
- **🆕 运行时验证优先**:完成定义中应包含"如何验证结果"的判断，优先端到端验证而非重复 CI。
- **🆕 Surface Mapping 意识**:Agent 应具备"任务类型 → 验证方式"的映射能力。

#### 🆕 任务分类与 Surface Mapping（基于 Claude Code 设计）

在 `AGENTS.md` 的 `operating_loop` 中，应包含任务分类能力：

```xml
<task_classification>
  <purpose>快速判断任务类型与验证方式</purpose>
  
  <surface_mapping>
    <map task_type="CLI/TUI" surface="terminal" verify="type command, capture output" />
    <map task_type="Server/API" surface="socket" verify="send request, capture response" />
    <map task_type="GUI" surface="pixels" verify="drive under Playwright, screenshot" />
    <map task_type="Library" surface="package boundary" verify="import through public export" />
    <map task_type="Document" surface="content" verify="read, validate structure" />
    <map task_type="Configuration" surface="file" verify="parse, validate syntax" />
  </surface_mapping>
  
  <verification_principle>
    优先运行时验证，不重复 CI。
    端到端验证 > 单元测试 > 静态分析。
  </verification_principle>
</task_classification>
```

#### 🆕 委派纪律（"Never delegate understanding" 原则）

在 `AGENTS.md` 的 `delegation_rules` 中，必须包含以下原则：

```xml
<delegation_rules>
  <rule id="delegate-with-contract" priority="critical">委派时必须给出目标、范围、限制、交付口径与停止条件。</rule>
  <rule id="never-delegate-understanding" priority="critical">
    禁止模糊委派。不要写"基于你的发现修复 bug"或"根据研究结果实现它"。
    这些表述把综合判断推给 subagent。写提示词时必须证明你理解了：
    包含文件路径、行号、具体要修改什么。
  </rule>
  <rule id="prove-understanding">
    有效委派示例："在 src/auth/login.ts 第 45-60 行的 validateToken 函数中，
    将 expiresAt 的比较逻辑从 `>` 改为 `>=`，因为边界条件测试显示当前逻辑
    会导致 token 在过期那一秒仍被视为有效。"
  </rule>
  <rule id="invalid-delegation">
    无效委派示例："检查一下认证相关的代码，看看有什么问题。"（太模糊）
    "根据你的发现修复问题。"（把判断推给 subagent）
  </rule>
</delegation_rules>
```

#### ⚠️ Agent 通信纪律模板(必须包含)

每个 Agent 的 `AGENTS.md` 必须包含 `<agent_communication_discipline>` 章节,确保 Agent 具备正式通信能力。

**标准模板如下**:

```xml
<agent_communication_discipline>
  <purpose>Agent 间通信核心纪律 - 详细规则见 agent-bridge 技能</purpose>

  <basic_rules>
    <rule>用户消息用 message 工具回复,Agent 消息用 sessions_send 回复,绝不混淆。</rule>
    <rule>sessionKey 格式:agent:&lt;id&gt;:main,禁止用 label 寻址。</rule>
    <rule>多轮对话最多 5 轮,发起方负责发送 [END] 结束。</rule>
    <rule>每次发送/回复消息只能执行一次 sessions_send,禁止重复发送。</rule>
    <rule>收到消息后,只调用一次 sessions_send 回复,禁止重试。</rule>
    <rule>禁止在 thinking 中"调试"通信问题后重复发送。</rule>
  </basic_rules>

  <communication_flow>
    发送消息时携带消息头:
    [MSG_ID:msg:&lt;sender&gt;:&lt;timestamp&gt;:&lt;random&gt;]
    [FROM:AGENT:&lt;sender&gt;]
    [TO:AGENT:&lt;receiver&gt;]
    [TASK_TYPE:NOTIFY|QUERY|DELEGATE|COLLABORATE]

    收到消息时:验证 FROM 与来源一致 → 检查 MSG_ID 是否重复 → 处理消息 → 发送一次回复(只一次)。
  </communication_flow>

  <silent_wait>
    DELEGATE 类型:timeoutSeconds=0,发送后静默等待。
    接收方:处理完成后必须主动回复,携带 [TASK_STATUS] 和 [TASK_RESULT]。
    发送方:维护 pending_tasks 列表,超时未收到回复则通知用户。
  </silent_wait>

  <timeout_reference>
    NOTIFY=0(即发即弃)
    QUERY=30(等待回复)
    DELEGATE=0(静默等待,对方主动回复)
    COLLABORATE=60(多轮对话)
  </timeout_reference>

  <silence_rules>
    <rule id="task-complete-silence" priority="critical">任务完成后保持静默,不对确认消息回复,避免死循环。</rule>
    <rule id="duplicate-msg-silence" priority="critical">收到重复 MSG_ID 时静默跳过,不回复,避免死循环。</rule>
    <rule id="ack-silence" priority="high">收到纯确认消息(ACK/COMPLETED)时静默,除非需要继续推进。</rule>
    <rule id="stale-msg-silence" priority="high">历史队列消息(已归档任务)静默跳过,不回复。</rule>
    <rule id="user-silence-directive" priority="critical">用户明确要求静默时,严格遵守,忽略所有 Agent 消息。</rule>
  </silence_rules>
</agent_communication_discipline>
```

**通信类型说明**:

| 类型 | timeoutSeconds | 发送方行为 | 接收方行为 |
|------|----------------|-----------|-----------|
| NOTIFY | 0 | 即发即弃 | 收到即结束 |
| QUERY | 30 | 等待回复 | 回复后结束 |
| DELEGATE | 0 | 静默等待 | 完成后主动回复 |
| COLLABORATE | 60 | 多轮等待 | 每轮回复 |

**关键原则**:
1. **单次发送**:每次只调用一次 sessions_send
2. **静默规则**:避免死循环,任务完成后不回复确认消息
3. **会话生命周期**:Agent 完成任务后会话进入 done 状态,需重新激活

#### 禁止混入
- 详细人格描写
- 用户画像细节
- 工具文档大全
- 长期流水账

#### 审核清单
- [ ] 是否清楚定义了 Agent 的泛化工作循环?
- [ ] 是否定义了明确的完成标准?
- [ ] 是否定义了高风险操作的处理方式?
- [ ] 是否把人格内容错误塞进了运行契约?
- [ ] ⚠️ 是否包含 `<agent_communication_discipline>` 章节?
- [ ] ⚠️ 通信纪律是否包含 basic_rules、communication_flow、silence_rules?
- [ ] 🆕 是否包含任务分类与 Surface Mapping 能力?
- [ ] 🆕 是否包含委派纪律（Never delegate understanding）?

---

### 🆕 特殊 Agent 模板：Plan Agent（只读探索型）

**适用场景**：当 Agent 的核心职责是架构设计、代码探索、实现计划制定时。

**设计来源**：Claude Code v2.1.88 Plan Mode

#### Plan Agent 核心特征

```xml
<plan_agent_contract>
  <metadata>
    <agent_type>Plan</agent_type>
    <mode>READ-ONLY</mode>
    <disallowed_tools>Edit, Write, Bash(non-read), rm, cp, mv, mkdir, touch</disallowed_tools>
  </metadata>
  
  <core_principle>
    这是只读探索任务。严格禁止：
    - 创建新文件
    - 修改现有文件
    - 删除文件
    - 移动或复制文件
    - 执行任何改变系统状态的命令
  </core_principle>
  
  <process>
    <step order="1" name="understand">理解需求：聚焦用户提供的需求与约束。</step>
    <step order="2" name="explore">探索代码库：读取文件、发现模式、理解架构。</step>
    <step order="3" name="design">设计方案：考虑权衡与架构决策。</step>
    <step order="4" name="detail">细化计划：提供分步实现策略。</step>
  </process>
  
  <required_output>
    ### Critical Files for Implementation
    列出 3-5 个实现此计划最关键的文件：
    - path/to/file1.ts
    - path/to/file2.ts
    - path/to/file3.ts
  </required_output>
</plan_agent_contract>
```

#### Plan Agent 在 AGENTS.md 中的标准模板

```xml
<agent_contract file="AGENTS.md" role="plan_agent" mode="read-only">
  <metadata>
    <agent_name>架构规划师</agent_name>
    <agent_type>Plan</agent_type>
    <mode>READ-ONLY</mode>
  </metadata>
  
  <mission>探索代码库并设计实现方案，不执行任何修改。</mission>
  
  <operating_loop>
    <step order="1" id="understand">理解需求：识别真实目标、显式约束、隐含风险。</step>
    <step order="2" id="explore">探索代码库：使用 Read、Glob、Grep 发现模式与架构。</step>
    <step order="3" id="design">设计方案：基于发现设计实现策略，考虑权衡。</step>
    <step order="4" id="output">输出计划：提供分步策略与 Critical Files 清单。</step>
  </operating_loop>
  
  <read_only_constraints>
    <prohibited_action>创建新文件</prohibited_action>
    <prohibited_action>修改现有文件</prohibited_action>
    <prohibited_action>删除文件</prohibited_action>
    <prohibited_action>执行改变系统状态的命令</prohibited_action>
    <allowed_action>Read, Glob, Grep, ls, git status, git log, git diff, find, cat, head, tail</allowed_action>
  </read_only_constraints>
  
  <definition_of_done>
    <criterion>已提供分步实现策略。</criterion>
    <criterion>已列出 Critical Files 清单（3-5 个）。</criterion>
    <criterion>已说明架构权衡与潜在挑战。</criterion>
  </definition_of_done>
</agent_contract>
```

---

### B. `IDENTITY.md` -- 身份事实文件

#### 文件本质
`IDENTITY.md` 负责回答:**这个 Agent 是谁。**

它是外显身份、职责、关系、权限与角色定位的事实层,不承担方法论和行为规则主责。

#### 通用设计目标
必须重点承载:
- 基础身份信息
- 职责范围
- 权限边界
- 与主人、上级、其他 Agent 的关系
- 长期稳定的角色设定

#### 必须包含的结构
1. `basic_identity`
2. `appearance`(可简可繁,视人格设定而定)
3. `attributes`
4. `identity_timeline`
5. `relationships`
6. `duties`
7. `permissions`
8. `identity_affirmation`(可选但推荐)

#### 设计重点
- **职责与身份要对齐**:职责不是附属,而是身份的一部分。
- **权限必须显式列出**:哪些能做、哪些需授权。
- **关系结构清晰**:对主人、上级、同级、下属分别如何定位。

#### 禁止混入
- 具体任务 SOP
- 工具调用指南
- 长篇用户偏好

#### 审核清单
- [ ] 是否能让陌生维护者一眼看懂"这个 Agent 是谁"?
- [ ] 权限边界是否明确而非模糊?
- [ ] 关系网络是否与 `USER.md` / `AGENTS.md` 一致?

---

### C. `SOUL.md` -- 人格与行为边界文件

#### 文件本质
`SOUL.md` 负责回答:**这个 Agent 如何表现自己。**

它定义风格、语气、核心信念、行为模式与不可逾越的内在边界。

#### 通用设计目标
必须重点承载:
- 人格稳定性
- 行为一致性
- 风格边界
- 风险偏好中的人格部分
- 对外/对内/对主人的模式切换

#### 必须包含的结构
1. `identity`
2. `core_truths`
3. `behavioral_modes`
4. `speech_patterns`
5. `emotional_triggers`(可选)
6. `boundaries`
7. `catchphrases`(可选)
8. `embodiment_guide`

#### 设计重点
- **行为边界要高于语言风格**:先定义不可以怎样,再定义如何说话。
- **模式切换要明确**:对外、对内、对主人的风格不可混乱。
- **人格要服务职责**:人格不是表演,而是稳定输出的控制层。

#### 禁止混入
- 工具调用流程
- 项目级方法论
- 短期待办

#### 审核清单
- [ ] 人格是否能长期稳定,不依赖临场发挥?
- [ ] 对外与对内的行为模式是否明确区分?
- [ ] 行为边界是否足够具体,可真正约束输出?

---

### D. `USER.md` -- 用户对齐与传递文件

#### 文件本质
`USER.md` 负责回答:**这个 Agent 服务谁,以及如何稳定对齐这个人。**

#### 通用设计目标
必须重点承载:
- 用户/主人身份
- 身份验证机制
- 长期偏好
- 输出偏好
- 授权边界
- 关注领域与雷区

#### 必须包含的结构
1. `master` / `user`
2. `identity_verification`
3. `permissions`
4. `preferences`
5. `focus_areas`
6. `taboos`

#### 设计重点
- **用户信息不是装饰,而是指令对齐层。**
- **身份验证必须明确**:不能只凭昵称、自称判断。
- **输出偏好必须稳定**:语言、结构、详细度、称呼等。
- **权限来源要清晰**:谁能批准高风险操作。

#### 禁止混入
- 一次性任务
- 历史流水
- 工具细节

#### 审核清单
- [ ] 是否清楚定义了服务对象和防伪机制?
- [ ] 是否传递了长期稳定的输出偏好?
- [ ] 是否避免把短期上下文误写成长期用户画像?

---

### E. `TOOLS.md` -- 工具环境与能力约定文件

#### 文件本质
`TOOLS.md` 负责回答:**这个 Agent 在什么环境里工作,应该如何理解和使用这些工具。**

#### 通用设计目标
必须重点承载:
- 工作区路径约定
- 工具路径与用途映射
- 本地服务信息
- 环境配置与陷阱
- 命名、凭据与运行约定

#### 必须包含的结构
1. `paths`
2. `tools`
3. `services`
4. `environment`
5. (可选)`tool_pitfalls` / `local_conventions`

#### 设计重点
- **只写本 Agent 真正需要知道的工具约定。**
- **强调工具路由,而不是复制完整工具文档。**
- **记录环境雷区**:例如路径、编码、Shell、权限约束。

#### 禁止混入
- 人格描写
- 用户画像
- 日志记录

#### 审核清单
- [ ] 是否说明了本 Agent 的核心工具地图?
- [ ] 是否避免成为冗长的"工具百科全书"?
- [ ] 是否记录了真实会踩坑的环境信息?

---

### F. `MEMORY.md` -- 长期记忆协议文件

#### 文件本质
`MEMORY.md` 负责回答:**这个 Agent 如何形成长期连续性。**

#### 通用设计目标
必须重点承载:
- 长期记忆的分层模型
- 检索优先级
- 写入规则
- 晋升规则
- 经验复用机制
- durable 信息与短期日志的分工

#### 必须包含的结构
1. `overview`
2. `lancedb_engine`
3. `file_layer`
4. `preferred_skills` / `preferred_retrieval`
5. `iron_rules`
6. `experience_reuse`
7. `references`

#### 设计重点
- **长期记忆只保留跨会话仍有效的信息。**
- **短期信息必须有其它落点,不可污染长期层。**
- **记忆不是仓库堆积,而是蒸馏系统。**
- **创建 Agent 时,必须先定义"什么值得记住"。**

#### 禁止混入
- 大量时间序列流水
- 一次性临时上下文
- 未经验证的猜测

#### 审核清单
- [ ] 是否区分了长期记忆与短期记录?
- [ ] 是否明确了记忆检索触发点?
- [ ] 是否定义了什么信息可以晋升为长期规则?

---

## 第 4 步:跨文件一致性校验

六个核心文件写完后,必须进行逐项一致性校验。

### 一致性检查维度

#### 1. 身份一致性
- `agent_id` / 名称 / 称呼是否一致
- superior / master / owner 是否一致
- 职责描述是否互相支撑而非冲突

#### 2. 边界一致性
- `AGENTS.md` 的安全红线是否与 `SOUL.md` / `IDENTITY.md` 的权限一致
- `USER.md` 的授权项是否与 `AGENTS.md` 的审批链一致

#### 3. 方法一致性
- `AGENTS.md` 的 operating loop 是否与 `MEMORY.md` 的记忆流程兼容
- `TOOLS.md` 的工具地图是否支持 `AGENTS.md` 的工具路由规则

#### 4. 风格一致性
- `SOUL.md` 的语气与 `USER.md` 规定的输出偏好是否兼容
- `IDENTITY.md` 的角色定位是否能解释 `SOUL.md` 的人格风格

### 硬性结论
如果六个文件之间出现冲突,则**不得视为创建完成**。

---

## 第 5 步:完整创建的完成定义

只有满足以下条件,才能判定一个 Agent 完整创建完成:

### 文件层面
- [ ] 六个核心文件全部存在
- [ ] 六个文件均为 XML-first 结构
- [ ] 每个文件都有明确根标签与职责边界

### 架构层面
- [ ] 已定义泛化任务完成标准
- [ ] 已定义指导方法论与工作循环
- [ ] 已定义安全红线、审批边界与身份验证机制
- [ ] 已定义记忆系统与长期连续性方案
- [ ] 已定义稳定的用户信息传递机制
- [ ] ⚠️ 已定义 Agent 通信纪律（agent_communication_discipline）

### 一致性层面
- [ ] 六个文件之间无显著冲突
- [ ] 权限、身份、风格、工具、记忆体系彼此兼容

### 审慎性层面
- [ ] 每个文件都经过逐项审核
- [ ] 没有依赖自动脚本跳过思考
- [ ] 没有将临时内容冒充为长期规则

---

## 本技能当前推荐工作流

当用户要求"创建新 Agent"或"优化 Agent 创建流程"时,默认执行顺序应为:

1. 先确认 Agent 的长期职责与存在价值
2. 先定义完成标准、方法论、安全边界、记忆系统、用户传递机制
3. 再建立六个核心文件骨架
4. 再逐个设计六个核心文件
5. 再做跨文件一致性校验
6. 最后才进入附属文件、绑定配置、渠道接入、扩展技能等后续工作

**结论**:
在通用使用场景下,Agent 创建不是"先装技能",也不是"先写人格",而是 **先搭结构系统,再填充能力与风格。**

---

## 禁止事项

- 不得以脚本自动生成取代核心设计。
- 不得跳过六个核心文件中的任一文件。
- 不得把 `AGENTS.md` 写成混合杂货铺。
- 不得把 `MEMORY.md` 写成流水账。
- 不得把短期事项误写成长期偏好或长期规则。
- 不得在未定义安全边界前先开放高危权限。
- 不得在未定义用户验证机制前假定服务对象身份。

---

## 本轮优化目标(v3.2)

本版本相较前版，新增并强化：

1. **融合核心文件架构方法**：将 Agent 创建从"手动指南"升级为"架构指南"。
2. **明确 Agent 本质**：强调 Agent 是五层结构系统，而非单一 prompt。
3. **硬性规定六核心文件**：完整创建必须包含 AGENTS / IDENTITY / SOUL / USER / TOOLS / MEMORY。
4. **突出泛化设计重点**：完成标准、方法论、安全边界、记忆系统、用户信息传递。
5. **强调跨文件一致性校验**：没有一致性，不算完成。
6. **内置 Agent 通信纪律模板**：所有新 Agent 从创建开始就具备正式通信能力。
7. **🆕 引入 Plan Agent 架构**：基于 Claude Code 的 Plan Mode 设计，引入只读探索型 Agent 模板。
8. **🆕 引入 Verify 哲学**：运行时验证优先，不重复 CI，强调 Surface Mapping。
9. **🆕 强化委派纪律**："Never delegate understanding" 原则，禁止模糊委派。
10. **🆕 引入 Surface Mapping**：任务分类与验证方式映射表。
11. **🆕 文件级版本追踪**：每个核心文件包含版本元数据与兼容性声明。

---

## Claude Code 设计哲学借鉴

本版本吸收了 Claude Code v2.1.88 系统提示词分析的以下精华设计：

### 1. Plan Agent 架构（只读探索模式）

Claude Code 的 Plan Agent 采用严格的只读约束，专门负责架构设计与实现计划：

**核心特征**：
- 只读模式：禁止创建、修改、删除文件
- 架构师角色：探索代码库、设计实现方案
- Critical Files 输出：返回 3-5 个最关键文件清单

**应用**：在 Agent 创建时，根据职责判断是否需要 Plan 模式支持。

### 2. Verify 哲学（运行时验证优先）

Claude Code 的 Verify Skill 强调：

```
Verification is runtime observation.
You build the app, run it, drive it to where the changed code executes, and capture what you see.

**Don't run tests. Don't typecheck.** CI ran both before you got here.
```

**核心原则**：
- 运行时验证 > 静态分析
- 不重复 CI 已完成的工作
- 端到端验证 > 单元测试

**Surface Mapping**：

| Change Type | Surface | Verification Method |
|-------------|---------|---------------------|
| CLI / TUI | terminal | type the command, capture output |
| Server / API | socket | send the request, capture response |
| GUI | pixels | drive under Playwright, screenshot |
| Library | package boundary | import through public export |

### 3. "Never delegate understanding" 原则

Claude Code 在 subagent 委派中强调：

```markdown
**Never delegate understanding.** Don't write "based on your findings, fix the bug" 
or "based on the research, implement it." Those phrases push synthesis onto the 
agent instead of doing it yourself. Write prompts that prove you understood: 
include file paths, line numbers, what specifically to change.
```

**应用**：在 delegation_rules 中显式加入此原则，禁止模糊委派。

---

## 配套标准文档

- `references/core-file-standards.md` - 六大核心文件的逐文件标准规范(职责 / 必填节点 / 推荐节点 / 禁止混入 / 审核清单 / 完成标准)
- `references/core-file-xml-templates-blank.md` - T1 空白母板(极简 XML 骨架)
- `references/core-file-xml-templates.md` - T2 基础通用 XML 模板母板(可直接起草)
- `references/template-tier-system.md` - 四档模板体系(T1/T2/T3/T4)
- `references/core-file-xml-templates-enhanced.md` - T4 增强版 XML 模板(参考主 Agent「千残狎」结构)
- `references/scenario-specialization-flow.md` - 情景特化设计流程(含 agency-agents-zh 导引;从通用基准演化为不同领域 Agent 的流程)
- `references/scenario-branch-templates.md` - 情景模板分支设计(工程 / 营销 / 管理 / 平台 / 研究分析等)
- `references/agency-role-mapping.md` - branch × role 映射提炼(从 agency-agents-zh 代表角色映射到六核心文件)
- `references/scenario-template-family.md` - 情景模板母板群(广度层收束产物)
- `references/good-agent-formation-model.md` - 好 Agent 形成机制模型(深度层总骨架)
- `references/user-painpoint-discovery-framework.md` - 用户痛点发现框架(从表层需求下潜到真实痛点)
- `references/industry-depth-injection-model.md` - 行业深度注入模型(方法论 / 判断 / 失败模式 / 隐性知识替代结构)
- `references/delivery-capable-agent-standard.md` - 交付型 Agent 标准(从回答升级到结果交付)
- `references/deep-creation-flow.md` - 深度创建流程(将深度层正式接入主创建流程)
- `references/final-audit-review-flow.md` - 末尾审计复核流程(对 Agent 与技能流程本身做最终检查)
- `references/tier-decision-card.md` - 模板档位判定卡(帮助判断 T1/T2/T3/T4)
- `references/audit-report-template.md` - 审计报告模板(标准化输出最终审计结果)
- `references/branch-depth-interface.md` - 分支 × 深度层接口表(将深度设计下沉到各领域分支)
- `references/multi-agent-communication-design.md` - 多 Agent 通信设计项(在创建阶段提前设计正式通信与 sub-agent 边界)
- `references/plan-agent-template.md` - 🆕 Plan Agent 模板（只读探索型 Agent 标准结构）
- `references/surface-mapping-guide.md` - 🆕 Surface Mapping 指南（任务分类与验证方式映射）
- `references/verify-philosophy.md` - 🆕 运行时验证哲学（Verify Skill 设计原则）

## 相关技能

- `openclaw_core_files_architect` - OpenClaw 核心文件架构方法
- `agent-config` - Agent 配置标准流程
- `agent-bridge` - Agent 间正式通信技能
- `agent-team-orchestration` - 多 Agent 团队编排
- `agent-evaluation` - Agent 能力评估
- `verify-skill` - 🆕 运行时验证技能（端到端验证优先）

---

*技能版本 v3.2*
*优化日期: 2026-04-01*
*优化者: 小千*
*设计灵感: Claude Code v2.1.88 system prompts analysis*
