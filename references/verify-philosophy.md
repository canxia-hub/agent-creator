# 运行时验证哲学

**版本**: 1.0  
**来源**: Claude Code v2.1.88 Verify Skill 分析  
**适用**: Agent 完成定义与验证策略

---

## 核心原则

```
Verification is runtime observation.
You build the app, run it, drive it to where the changed code executes, 
and capture what you see. That capture is your evidence. Nothing else is.
```

**验证是运行时观察**。构建应用，运行它，驱动到变更代码执行的位置，捕获你看到的。那个捕获就是你的证据。除此之外都不是。

---

## 不做的事

### 1. 不运行测试

```
**Don't run tests.** CI ran both before you got here — green checks on the PR 
mean they passed. Running them again proves you can run CI. Not as a warm-up, 
not "just to be sure," not as a regression sweep after.
```

**原因**：
- CI 已经运行过测试
- 绿色检查意味着测试通过
- 再次运行测试只证明你能运行 CI

### 2. 不做类型检查

```
**Don't typecheck.** CI ran both before you got here.
```

**原因**：
- CI 已经做过类型检查
- 类型检查是静态分析，不是运行时验证

### 3. 不重复 CI

```
The time goes to running the app instead.
```

**原因**：
- 重复 CI 浪费时间
- 应该把时间用于运行应用

### 4. 不 import-and-call

```
**Don't import-and-call.** `import { foo } from './src/...'` then 
`console.log(foo(x))` is a unit test you wrote. The function did what 
the function does — you knew that from reading it. The app never ran.
```

**原因**：
- 这是你写的单元测试
- 函数做了函数该做的事 —— 你阅读代码就知道
- 应用从未运行

---

## 要做的事

### 1. 构建应用

如果变更需要构建，先构建。

### 2. 运行应用

启动实际的服务或界面。

### 3. 驱动到变更点

导航到变更代码执行的位置。

### 4. 捕获观察

截图、输出、响应。

---

## Surface 概念

**Surface** 是变更到达用户或程序的地方。那就是你观察的地方。

| Change reaches | Surface | You |
|---|---|---|
| CLI / TUI | terminal | type the command, capture the pane |
| Server / API | socket | send the request, capture the response |
| GUI | pixels | drive it under xvfb/Playwright, screenshot |
| Library | package boundary | sample code through the public export |
| Prompt / agent config | the agent | run the agent, capture its behavior |
| CI workflow | Actions | dispatch it, read the run |

**内部函数？不是 Surface。** 仓库中的某些东西调用它，那个调用者最终到达上面的某一行。跟随它到那里。

---

## 验证流程

### 第 1 步：找到变更

建立完整范围 —— 一个分支可能有多个提交：

```bash
git log --oneline @{u}..              # count commits
git diff @{u}.. --stat                # full range, not HEAD~1
gh pr diff                            # if in a PR context
```

在报告中说明提交数量。大型 diff 被截断？重定向：

```bash
git diff @{u}.. > /tmp/d
```

然后读取它。完全没有 diff？说明并停止。

**diff 是基本事实。PR 描述是对它的声明。** 两者都读。如果它们不一致，那就是一个发现。

### 第 2 步：确定 Surface

检查现有知识后再冷启动：

- **`.claude/skills/*verifier*/`** —— 如果一个与你的 Surface 匹配（CLI 变更用 CLI verifier 等），路由到它。它知道你不知道的就绪信号和环境陷阱。
- **`.claude/skills/run-*/`** —— 知道如何构建和启动。使用它的原语作为你的句柄。
- **Neither** —— 从 README/package.json/Makefile 冷启动。时间限制 ~15 分钟。卡住时，报告 BLOCKED 并附上确切位置。

### 第 3 步：驱动它

使变更代码执行的最小路径：

- 改变了标志？用它运行。
- 改变了处理器？命中那个路由。
- 改变了错误处理？触发那个错误。
- 改变了内部函数？找到到达它的 CLI 命令 / 请求 / 渲染。运行那个。

**运行前重读你的计划。** 如果每一步都是构建 / 类型检查 / 运行测试文件 —— 你计划的是 CI 重跑，不是验证。找到到达 Surface 的步骤或报告 BLOCKED。

### 第 4 步：捕获

stdout、响应体、截图、面板转储。捕获的输出是证据；你的记忆不是。

意外情况？不要绕过它 —— 捕获、记录、决定它是变更还是环境。

---

## 验证裁决

### PASS

你运行了应用，变更在它的 Surface 做了它应该做的。

**不是**：测试通过、构建干净、代码看起来正确。

### FAIL

你运行了它，它不工作。或者它破坏了其他东西。或者声明和 diff 有实质性不一致。

### BLOCKED

无法到达变更可观察的状态，或没有运行时 Surface。不是对变更的裁决。

环境阻塞 → 说明确切位置 + `/run-skill-generator` 提示。没有 Surface → 一行原因。

**没有部分通过。** "4 个中 3 个通过" 是 FAIL，直到 4 个通过或被解释。

**有疑问时，FAIL。** 假 PASS 发布损坏代码；假 FAIL 只需再看一眼人类。模糊输出是 FAIL 并附上原始捕获 —— 不要解释。

---

## 在 Agent 中的应用

### 完成定义集成

```xml
<definition_of_done>
  <criterion id="runtime-verification" priority="critical">
    结果已通过 Surface 进行运行时验证，而非仅静态分析或重复 CI。
  </criterion>
  
  <criterion id="no-ci-duplication" priority="high">
    不重复 CI 已完成的工作（测试、类型检查）。
  </criterion>
  
  <criterion id="evidence-captured" priority="high">
    验证证据已捕获（输出、响应、截图）。
  </criterion>
</definition_of_done>
```

### 任务分类集成

```xml
<task_classification>
  <surface_mapping>
    <map task_type="CLI" surface="terminal" verify="type command, capture output" />
    <map task_type="API" surface="socket" verify="send request, capture response" />
    <map task_type="GUI" surface="pixels" verify="drive, screenshot" />
  </surface_mapping>
  
  <verification_principle>
    运行时验证优先。
    不重复 CI。
    端到端 > 单元测试 > 静态分析。
  </verification_principle>
</task_classification>
```

---

## 验证报告模板

```markdown
## Verification: <变更摘要>

**Verdict:** PASS | FAIL | BLOCKED

**Claim:** <变更应该做什么>

**Method:** <如何获得句柄>

### Steps

1. <对运行中的应用做了什么> → <观察到了什么> — ✅/❌
   <证据：应用输出>

**Screenshot / sample:** <图像路径或代码块>

### Findings

<发现的问题、不匹配、环境注意事项>
```

---

## 参考来源

- Claude Code v2.1.88 `skill-verify-skill.md`
- Claude Code Verify Skill 设计哲学
- OpenClaw `agent-creator` 技能 v3.2

---

*哲学版本: 1.0*  
*创建日期: 2026-04-01*
