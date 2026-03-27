#!/usr/bin/env node
/**
 * Agent Creator - 核心文件质量验证脚本
 *
 * 功能：验证 Agent 核心文件的质量，确保符合 openclaw_core_files_architect 标准。
 * 同时兼容 Markdown 标题结构和 XML-first 结构。
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const FILE_LIMITS = {
  'AGENTS.md': { recommended: 150, max: 300, warning: 250 },
  'SOUL.md': { recommended: 75, max: 150, warning: 120 },
  'IDENTITY.md': { recommended: 45, max: 100, warning: 80 },
  'USER.md': { recommended: 65, max: 120, warning: 100 },
  'TOOLS.md': { recommended: 115, max: 250, warning: 200 },
  'MEMORY.md': { recommended: 115, max: 250, warning: 200 },
  'HEARTBEAT.md': { recommended: 15, max: 30, warning: 25 }
};

const SECTION_PATTERNS = {
  'AGENTS.md': {
    'Mission': [/#+.*Mission/i, /<mission>/i],
    'Session Startup': [/#+.*Session Startup/i, /<session_startup>/i],
    'Operating Loop': [/#+.*Operating Loop/i, /<operating_loop>/i],
    'Tool Routing': [/#+.*Tool Routing/i, /<tool_routing_rules?>/i],
    'External Action': [/#+.*External Action/i, /<external_action_policy>/i],
    'Memory Writeback': [/#+.*Memory Writeback/i, /<memory_writeback_rules?>/i],
    'Shared Context': [/#+.*Shared Context/i, /<shared_context_rules?>/i],
    'Definition of Done': [/#+.*Definition of Done/i, /<definition_of_done>/i],
    'Failure Recovery': [/#+.*Failure Recovery/i, /<failure_recovery>/i]
  },
  'SOUL.md': {
    'Identity': [/#+.*Identity/i, /<identity>/i],
    'Tone': [/#+.*Tone/i, /<tone>/i],
    'Boundaries': [/#+.*Boundaries/i, /<behavioral_boundaries>/i]
  },
  'USER.md': {
    'Master Base': [/#+.*Master Base/i, /<preferred_address>/i],
    'Preferences': [/#+.*Preferences/i, /<long_term_preferences>/i],
    'Constraints': [/#+.*Known Constraints/i, /<known_constraints>/i]
  },
  'TOOLS.md': {
    'Infrastructure': [/#+.*Infrastructure/i, /<environment>/i],
    'Credentials': [/#+.*Credentials/i, /<credentials_pointers>/i],
    'Cyberware': [/#+.*(Cyberware|Tools)/i, /<preferred_tools_by_task>|<tool_registry>/i],
    'Local Traps': [/#+.*Local Traps/i, /<local_traps>/i]
  },
  'MEMORY.md': {
    'Memory System': [/#+.*Memory System/i, /<system_overview>/i],
    'LanceDB': [/#+.*LanceDB/i, /<lancedb_guide>/i],
    'Memory Files': [/#+.*Memory Files/i, /<file_index>/i],
    'Writeback': [/#+.*Writeback/i, /<writeback_rules>/i]
  },
  'HEARTBEAT.md': {
    'Periodic Check': [/#+.*Periodic Check/i, /<check id=|<notification_triggers>|<silent_hours>/i]
  }
};

const FORBIDDEN_PATTERNS = {
  'AGENTS.md': [
    { pattern: /<soul_profile>|## \[Tone\]|## \[Identity\]/i, suggestion: 'AGENTS.md 混入人格层内容，应迁移到 SOUL.md' },
    { pattern: /<preferred_address>|## \[Master Base\]/i, suggestion: 'AGENTS.md 混入用户画像层内容，应迁移到 USER.md' }
  ],
  'SOUL.md': [
    { pattern: /<tool_routing_rules>|## 4\. Tool Routing|## 5\. External Action/i, suggestion: 'SOUL.md 混入运行契约/工具路由，应迁移到 AGENTS.md' }
  ],
  'USER.md': [
    { pattern: /今日待办|今天要做|just completed|刚做完/i, suggestion: 'USER.md 混入短期任务，应迁移到 memory/YYYY-MM-DD.md' }
  ],
  'TOOLS.md': [
    { pattern: /<soul_profile>|## \[Tone\]/i, suggestion: 'TOOLS.md 混入人格内容，应迁移到 SOUL.md' }
  ],
  'MEMORY.md': [
    { pattern: /<daily_log|## \d{2}:\d{2}/i, suggestion: 'MEMORY.md 混入时间序列日志，应迁移到 memory/YYYY-MM-DD.md' }
  ],
  'HEARTBEAT.md': []
};

function countLines(content) {
  return content.split(/\r?\n/).length;
}

function checkSections(content, filename) {
  const patterns = SECTION_PATTERNS[filename] || {};
  const found = [];
  const missing = [];

  for (const [section, regexes] of Object.entries(patterns)) {
    const matched = regexes.some(regex => regex.test(content));
    if (matched) {
      found.push(section);
    } else {
      missing.push(section);
    }
  }

  return { found, missing };
}

function checkForbiddenContent(content, filename) {
  const rules = FORBIDDEN_PATTERNS[filename] || [];
  return rules
    .filter(({ pattern }) => pattern.test(content))
    .map(({ pattern, suggestion }) => ({ pattern: pattern.source, suggestion }));
}

function calculateScore(filename, lineCount, sections, violations) {
  let score = 10;
  const limits = FILE_LIMITS[filename];

  if (limits) {
    if (lineCount > limits.max) {
      score -= 3;
    } else if (lineCount > limits.warning) {
      score -= 1;
    }
  }

  const totalSections = Object.keys(SECTION_PATTERNS[filename] || {}).length;
  if (totalSections > 0) {
    const missingRatio = sections.missing.length / totalSections;
    score -= missingRatio * 3;
  }

  score -= violations.length * 2;

  return Math.max(0, Math.min(10, score));
}

function validateFile(filePath, filename) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, error: '文件不存在' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lineCount = countLines(content);
  const sections = checkSections(content, filename);
  const violations = checkForbiddenContent(content, filename);
  const score = calculateScore(filename, lineCount, sections, violations);

  return {
    exists: true,
    lineCount,
    sections,
    violations,
    score,
    limits: FILE_LIMITS[filename]
  };
}

function validate(workspaceDir) {
  print('\n🔍 验证核心文件质量...\n', 'blue');
  print(`工作区: ${workspaceDir}\n`, 'cyan');

  const files = [
    'AGENTS.md',
    'SOUL.md',
    'IDENTITY.md',
    'USER.md',
    'TOOLS.md',
    'MEMORY.md',
    'HEARTBEAT.md'
  ];

  const results = {};
  let totalScore = 0;
  let fileCount = 0;

  for (const filename of files) {
    const filePath = path.join(workspaceDir, filename);
    const result = validateFile(filePath, filename);
    results[filename] = result;

    if (result.exists) {
      fileCount += 1;
      totalScore += result.score;
    }

    print(`\n📄 ${filename}`, 'blue');

    if (!result.exists) {
      print(`  ❌ ${result.error}`, 'red');
      continue;
    }

    const limits = result.limits;
    if (limits) {
      if (result.lineCount > limits.max) {
        print(`  ⚠️ 行数: ${result.lineCount} (超出最大限制 ${limits.max})`, 'yellow');
      } else if (result.lineCount > limits.warning) {
        print(`  ⚠️ 行数: ${result.lineCount} (接近警告阈值 ${limits.warning})`, 'yellow');
      } else {
        print(`  ✅ 行数: ${result.lineCount} (推荐 ${limits.recommended})`, 'green');
      }
    }

    if (result.sections.missing.length === 0) {
      print(`  ✅ 章节完整: ${result.sections.found.length}/${result.sections.found.length}`, 'green');
    } else {
      print(`  ⚠️ 缺失章节: ${result.sections.missing.join(', ')}`, 'yellow');
    }

    if (result.violations.length > 0) {
      print('  ❌ 检测到职责混杂:', 'red');
      for (const violation of result.violations) {
        print(`     - ${violation.suggestion}`, 'red');
      }
    } else {
      print('  ✅ 无明显职责混杂', 'green');
    }

    const scoreColor = result.score >= 8 ? 'green' : result.score >= 6 ? 'yellow' : 'red';
    print(`  📊 质量得分: ${result.score.toFixed(1)}/10`, scoreColor);
  }

  const avgScore = fileCount > 0 ? totalScore / fileCount : 0;

  print(`\n${'═'.repeat(50)}`, 'blue');
  print('📊 总体评估', 'blue');
  print(`${'═'.repeat(50)}`, 'blue');

  if (avgScore >= 9) {
    print(`✅ 平均得分: ${avgScore.toFixed(1)}/10 - 优秀`, 'green');
  } else if (avgScore >= 7) {
    print(`👍 平均得分: ${avgScore.toFixed(1)}/10 - 良好`, 'green');
  } else if (avgScore >= 5) {
    print(`⚠️ 平均得分: ${avgScore.toFixed(1)}/10 - 需要改进`, 'yellow');
  } else {
    print(`❌ 平均得分: ${avgScore.toFixed(1)}/10 - 需要重构`, 'red');
  }

  print('\n💡 改进建议:', 'cyan');
  for (const [filename, result] of Object.entries(results)) {
    if (!result.exists || result.score >= 8) {
      continue;
    }

    print(`\n  📄 ${filename}:`, 'yellow');
    if (result.violations.length > 0) {
      print('    - 移除职责混杂内容', 'yellow');
    }
    if (result.sections.missing.length > 0) {
      print(`    - 补充缺失章节: ${result.sections.missing.join(', ')}`, 'yellow');
    }
    if (result.lineCount > (result.limits?.warning || Number.MAX_SAFE_INTEGER)) {
      print('    - 精简内容，减少行数', 'yellow');
    }
  }

  return {
    results,
    avgScore,
    status: avgScore >= 7 ? 'pass' : 'fail'
  };
}

const workspaceDir = process.argv[2];

if (!workspaceDir) {
  console.error('用法: node validate-core-files.js <workspace-dir>');
  process.exit(1);
}

const result = validate(workspaceDir);
process.exit(result.status === 'pass' ? 0 : 1);
