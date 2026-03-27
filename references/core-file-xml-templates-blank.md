# Agent Creator - T1 空白母板（极简 XML 骨架）

> 用途：四档模板体系中的 T1 档，适用于高度探索期、强人工定制场景。
> 特点：只保留最小语义骨架，不预设过多内容。

---

## AGENTS.md

```xml
<agent_contract file="AGENTS.md" role="{{role}}_contract" version="1.0" status="draft" format="xml-first" agent="{{agent_id}}">
  <metadata>
    <purpose>{{purpose}}</purpose>
  </metadata>
  <mission>{{mission}}</mission>
  <rules>
    <rule id="r1">{{rule}}</rule>
  </rules>
</agent_contract>
```

## IDENTITY.md

```xml
<identity_profile file="IDENTITY.md" role="{{role}}_identity" version="1.0" status="draft" format="xml-first" agent="{{agent_id}}">
  <basic_identity>
    <name>{{agent_name}}</name>
    <role>{{role}}</role>
  </basic_identity>
</identity_profile>
```

## SOUL.md

```xml
<soul_profile file="SOUL.md" role="{{role}}_soul" version="1.0" status="draft" format="xml-first" agent="{{agent_id}}">
  <core_truths>
    <truth id="t1">{{truth}}</truth>
  </core_truths>
</soul_profile>
```

## USER.md

```xml
<user_profile file="USER.md" role="{{role}}_user" version="1.0" status="draft" format="xml-first" agent="{{agent_id}}">
  <master>
    <name>{{master}}</name>
  </master>
</user_profile>
```

## TOOLS.md

```xml
<tool_notes file="TOOLS.md" role="{{role}}_tools" version="1.0" status="draft" format="xml-first" agent="{{agent_id}}">
  <paths>
    <home>{{workspace}}</home>
  </paths>
</tool_notes>
```

## MEMORY.md

```xml
<long_term_memory file="MEMORY.md" role="{{role}}_memory" version="1.0" status="draft" format="xml-first" agent="{{agent_id}}">
  <overview>
    <purpose>{{memory_purpose}}</purpose>
  </overview>
</long_term_memory>
```

---

*版本：v1*  
*日期：2026-03-28*
