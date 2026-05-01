# OpenClaw Core Files Architect - 核心文件质量标准

> 本文档定义了核心文件的质量门槛，供 agent-creator 在创建 Agent 时使用。

## 文件长度限制

| 文件 | 推荐行数 | 最大行数 | 警告阈值 |
|------|---------|---------|---------|
| `AGENTS.md` | 100-200 行 | 300 行 | > 250 行 |
| `SOUL.md` | 50-100 行 | 150 行 | > 120 行 |
| `IDENTITY.md` | 30-60 行 | 100 行 | > 80 行 |
| `USER.md` | 50-80 行 | 120 行 | > 100 行 |
| `TOOLS.md` | 80-150 行 | 250 行 | > 200 行 |
| `MEMORY.md` | 80-150 行 | 250 行 | > 200 行 |
| `HEARTBEAT.md` | 10-20 行 | 30 行 | > 25 行 |

## 结构完整性标准

### AGENTS.md 必须包含的章节

1. **Mission** - 一句话使命
2. **Session Startup** - 启动顺序
3. **Operating Loop** - 操作循环
4. **Tool Routing Rules** - 工具路由
5. **External Action Policy** - 外部动作审批
6. **Memory Writeback Rules** - 记忆写回
7. **Shared Context Rules** - 共享上下文
8. **Definition of Done** - 完成定义
9. **Failure Recovery** - 失败恢复

### SOUL.md 必须包含的章节

1. **Identity** - 身份感
2. **Tone** - 风格语气
3. **Boundaries** - 行为边界
4. **Vibe** - 自称方式与口头禅

### USER.md 必须包含的章节

1. **Master Base** - 用户基础信息
2. **Long-term Preferences** - 长期偏好
3. **Output Preferences** - 输出偏好
4. **Known Constraints** - 已知约束

### TOOLS.md 必须包含的章节

1. **Infrastructure** - 基础设施
2. **Credentials Pointers** - 凭证指针
3. **Cyberware Registry** - 工具寻址表
4. **Local Traps** - 本地雷区

### MEMORY.md 必须包含的章节

1. **Memory System Overview** - 记忆系统综述
2. **LanceDB Query Guide** - LanceDB 查询指南
3. **Memory Files Index** - 记忆文件索引
4. **Writeback Rules** - 写回规则

### HEARTBEAT.md 必须包含的章节

1. **Periodic Checks** - 定期检查（3-6 条）
2. **Notification Triggers** - 通知触发条件
3. **Silent Hours** - 静默时间

## 职责边界检查

### AGENTS.md 禁止包含

- ❌ 大段人格描写 → 应迁移到 SOUL.md
- ❌ 长期用户画像 → 应迁移到 USER.md
- ❌ 项目流水账 → 应迁移到 memory/YYYY-MM-DD.md
- ❌ 工具完整文档 → 应迁移到 TOOLS.md 或独立 skill
- ❌ 背景故事 → 应迁移到 IDENTITY.md

### SOUL.md 禁止包含

- ❌ 工具调用 SOP → 应迁移到 AGENTS.md 或 skill
- ❌ 短期状态 → 应迁移到 memory/YYYY-MM-DD.md
- ❌ 用户偏好 → 应迁移到 USER.md

### USER.md 禁止包含

- ❌ 今天要办的事 → 应迁移到 memory/YYYY-MM-DD.md
- ❌ 刚做完的任务 → 应迁移到 memory/YYYY-MM-DD.md
- ❌ 一次性短期约束 → 应迁移到 memory/YYYY-MM-DD.md

### TOOLS.md 禁止包含

- ❌ 工具完整文档 → 应引用对应的 SKILL.md
- ❌ 人格内容 → 应迁移到 SOUL.md
- ❌ 操作流程 → 应迁移到 AGENTS.md 或 skill

### MEMORY.md 禁止包含

- ❌ 按时间顺序堆满所有事件 → 应迁移到 memory/YYYY-MM-DD.md
- ❌ 大量已过期的上下文 → 应归档或删除
- ❌ 私密高风险信息（除非用户明确要求）

### HEARTBEAT.md 禁止包含

- ❌ 长篇指令墙
- ❌ 复杂操作流程
- ❌ 详细检查逻辑

## 质量打分标准

每个核心文件从以下维度打分（0-10 分）：

1. **职责清晰度** - 是否只承担单一职责
2. **长度合理性** - 是否在推荐范围内
3. **重叠度** - 与其他文件的内容重叠程度（越低越好）
4. **过期内容** - 是否含有过期信息
5. **层级正确性** - 短期内容是否误入长期层
6. **长期规则完整性** - 是否缺失必要的长期规则
7. **安全合规** - 是否包含不应公开的敏感信息
8. **可维护性** - 是否便于未来修改和扩展

### 打分等级

- **9-10 分**：优秀，无需修改
- **7-8 分**：良好，可小幅优化
- **5-6 分**：及格，需要改进
- **3-4 分**：不及格，需要大幅重构
- **0-2 分**：严重问题，需要重新设计

## 验证流程

### 创建时验证

1. 检查文件是否存在
2. 检查文件行数是否在限制内
3. 检查必须章节是否完整
4. 检查禁止内容是否存在
5. 计算质量得分

### 定期验证

1. 检查文件是否过厚
2. 检查是否有内容混杂
3. 检查是否有过期内容
4. 检查职责边界是否清晰
5. 生成改进建议

## 自我改进规则

### 发现"决策失误"时

先问：这次失误属于哪一层？

- 行为准则不清 → 更新 `AGENTS.md`
- 人格边界不清 → 更新 `SOUL.md`
- 用户偏好没记住 → 更新 `USER.md` 或 `MEMORY.md`
- 环境工具约定不清 → 更新 `TOOLS.md`
- 当日上下文遗失 → 更新 `memory/YYYY-MM-DD.md`
- 长期结论未沉淀 → 更新 `MEMORY.md`
- 重复操作还靠临时发挥 → 新建或更新 skill

### 发现"重复出错"时

必须至少做一件结构性修复：
- 增加明确规则
- 增加决策边界
- 抽出独立 skill
- 删除误导性旧规则
- 为维护流程增加检查项

### 发现"文件越来越胖"时

立刻做瘦身：
- 删除重复表述
- 把例子改成规则
- 把短期内容移到 daily log
- 把专门流程拆 skill
- 把长篇背景改成简洁原则
