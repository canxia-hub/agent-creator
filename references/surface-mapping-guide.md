# Surface Mapping 指南

**版本**: 1.0  
**来源**: Claude Code v2.1.88 Verify Skill 分析  
**适用**: 任务分类与验证方式选择

---

## 核心概念

**Surface** 是用户或程序与变更交互的界面。验证变更的正确方式是**通过 Surface 进行运行时观察**，而不是静态分析或重复 CI。

### Surface Mapping 定义

| Change Type | Surface | 验证方式 |
|-------------|---------|----------|
| CLI / TUI | terminal | 输入命令，捕获输出 |
| Server / API | socket | 发送请求，捕获响应 |
| GUI | pixels | Playwright 驱动，截图 |
| Library | package boundary | 通过公开导出导入 |
| Prompt / Agent Config | the agent | 运行 agent，捕获行为 |
| CI Workflow | Actions | 触发运行，读取结果 |
| Document | content | 读取，验证结构 |
| Configuration | file | 解析，验证语法 |

---

## 验证哲学

### 核心原则

```
Verification is runtime observation.
You build the app, run it, drive it to where the changed code executes, 
and capture what you see. That capture is your evidence. Nothing else is.
```

### 不做的事

1. **不运行测试** - CI 已经运行过测试
2. **不做类型检查** - CI 已经做过类型检查
3. **不重复 CI** - 不要做 CI 已经完成的工作
4. **不 import-and-call** - `import { foo } from './src/...'` 然后调用是单元测试，不是验证

### 要做的事

1. **构建应用** - 如果需要构建
2. **运行应用** - 启动实际的服务或界面
3. **驱动到变更点** - 导航到变更代码执行的位置
4. **捕获观察** - 截图、输出、响应

---

## 在 Agent 中的应用

### 任务分类集成

在 `AGENTS.md` 的 `operating_loop` 中，任务分类应包含 Surface Mapping：

```xml
<operating_loop>
  <step order="1" id="understand">
    理解任务：识别真实目标、显式要求、隐含约束、风险等级。
  </step>
  
  <step order="2" id="classify">
    任务分类：
    - 判断任务类型（CLI/API/GUI/Library/Document/Config）
    - 确定 Surface
    - 选择验证方式
  </step>
  
  <step order="3" id="choose-route">
    选择路线：在最小可行路径、复杂任务编排、专业代理协作之间做取舍。
  </step>
  
  <step order="4" id="execute">
    执行推进：只采取与当前判断最匹配的动作。
  </step>
  
  <step order="5" id="verify">
    验证结果：通过 Surface 进行运行时验证，而不是静态分析。
  </step>
  
  <step order="6" id="close-loop">
    闭环收束：按完成定义判断是否结束。
  </step>
</operating_loop>
```

### 完成定义增强

在 `definition_of_done` 中加入验证要求：

```xml
<definition_of_done>
  <criterion id="goal-resolved" priority="critical">
    用户的核心目标已被解决，或已抵达当前条件下最优且诚实的停止点。
  </criterion>
  
  <criterion id="verification-complete" priority="critical">
    结果经过运行时验证（通过 Surface），而非仅静态分析。
    若无法通过 Surface 验证，必须明确说明验证边界。
  </criterion>
  
  <criterion id="no-ci-duplication" priority="high">
    不重复 CI 已完成的工作（测试、类型检查）。
  </criterion>
</definition_of_done>
```

---

## Surface 类型详解

### 1. CLI / TUI Surface

**特征**：用户通过终端与应用交互

**验证方法**：
```bash
# 输入命令
command --flag value

# 捕获输出
command --flag value 2>&1 | tee output.log
```

**验证内容**：
- 命令是否正确执行
- 输出是否符合预期
- 错误处理是否正确

### 2. Server / API Surface

**特征**：用户通过 HTTP/WebSocket 与服务交互

**验证方法**：
```bash
# 发送请求
curl -X POST https://api.example.com/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# 捕获响应
curl -v https://api.example.com/endpoint 2>&1
```

**验证内容**：
- 端点是否可访问
- 响应状态码是否正确
- 响应体是否符合预期

### 3. GUI Surface

**特征**：用户通过图形界面与应用交互

**验证方法**：
```javascript
// Playwright 驱动
await page.goto('https://example.com');
await page.click('#button');
await page.screenshot({ path: 'screenshot.png' });
```

**验证内容**：
- 界面是否正确渲染
- 交互是否正常工作
- 视觉是否符合预期

### 4. Library Surface

**特征**：用户通过公开 API 使用库

**验证方法**：
```javascript
// 通过公开导出导入
import { publicFunction } from 'library';

// 调用公开 API
const result = publicFunction(input);
console.log(result);
```

**验证内容**：
- API 是否可正常调用
- 返回值是否符合预期
- 错误处理是否正确

**注意**：不要通过 `import './src/internal'` 访问内部实现

### 5. Document Surface

**特征**：用户通过阅读文档获取信息

**验证方法**：
```bash
# 读取文档
cat README.md

# 验证结构
grep -E "^#{1,3} " README.md
```

**验证内容**：
- 文档是否存在
- 结构是否正确
- 内容是否准确

### 6. Configuration Surface

**特征**：用户通过配置文件控制应用行为

**验证方法**：
```bash
# 解析配置
jq '.' config.json

# 验证语法
yamllint config.yaml
```

**验证内容**：
- 配置是否存在
- 语法是否正确
- 值是否符合预期

---

## 验证报告模板

```markdown
## Verification: <变更摘要>

**Verdict:** PASS | FAIL | BLOCKED

**Claim:** <变更应该做什么 - 你对 diff 和/或声明的理解；注意任何不匹配>

**Method:** <你如何获得句柄 - 哪个 verifier/run-skill，或冷启动；你启动了什么>

### Steps

每个步骤是对**运行中的应用**做的一件事以及它显示了什么：

1. <你对运行中的应用做了什么> → <你观察到了什么> — ✅/❌
   <证据：应用自己的输出 - 面板捕获、响应体、截图路径>
   
2. ...

**Screenshot / sample:** <评审者看的一帧以查看功能 - GUI/TUI 的图像路径，Library/API 的代码块；build/types-only 时省略>

### Findings

<Claim 不匹配、无关破坏、env 注意事项、变更附近的预先存在的 bug>
```

---

## 与 Plan Agent 的关系

Plan Agent 在探索代码库时，应识别变更的 Surface：

1. **确定变更类型**：CLI/API/GUI/Library/Document/Config
2. **确定 Surface**：用户与变更交互的界面
3. **确定验证方式**：如何通过 Surface 进行运行时验证

这些信息应包含在 Plan Agent 的输出中，为后续执行 Agent 提供指导。

---

## 参考来源

- Claude Code v2.1.88 `skill-verify-skill.md`
- Claude Code v2.1.88 Verify Skill 设计哲学
- OpenClaw `agent-creator` 技能 v3.2

---

*指南版本: 1.0*  
*创建日期: 2026-04-01*
