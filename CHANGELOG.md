# Agent 创建技能更新日志

## v3.2.0 (2026-04-01)

**设计灵感**: Claude Code v2.1.88 系统提示词分析

### 新增功能

#### 1. Plan Agent 模板
- 引入只读探索型 Agent 标准结构
- 基于 Claude Code Plan Mode 设计
- 严格禁止修改操作
- 输出 Critical Files 清单
- 参考文件: `references/plan-agent-template.md`

#### 2. Surface Mapping 指南
- 任务分类与验证方式映射表
- 6 种 Surface 类型：CLI/API/GUI/Library/Document/Config
- 参考文件: `references/surface-mapping-guide.md`

#### 3. 运行时验证哲学
- "Verification is runtime observation" 核心原则
- 不重复 CI 已完成的工作
- 端到端验证优先
- 参考文件: `references/verify-philosophy.md`

#### 4. "Never delegate understanding" 原则
- 禁止模糊委派
- 委派时必须证明理解：包含文件路径、行号、具体变更
- 有效/无效委派示例

### 改进内容

#### AGENTS.md 设计增强
- 新增 `<task_classification>` 章节（Surface Mapping）
- 新增 `<delegation_rules>` 强化（Never delegate understanding）
- 增强 `<definition_of_done>`（运行时验证优先）

#### 核心设计原则扩展
- 原则 G：运行时验证优先
- 原则 H：禁止模糊委派

### 参考文件新增
- `references/plan-agent-template.md` - Plan Agent 标准模板
- `references/surface-mapping-guide.md` - Surface Mapping 指南
- `references/verify-philosophy.md` - 运行时验证哲学

### 兼容性
- 完全向后兼容 v3.1
- 所有现有 Agent 无需修改

---

## v3.1.0 (2026-03-31)

- 融合核心文件架构方法
- 明确 Agent 本质（五层结构系统）
- 硬性规定六核心文件
- 内置 Agent 通信纪律模板

---

## v3.0.0 (2026-03-26)

- XML-first 架构
- 六核心文件体系
- 完整创建流程
