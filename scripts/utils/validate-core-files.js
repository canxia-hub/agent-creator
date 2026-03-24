#!/usr/bin/env node
/**
 * Agent Creator - 核心文件质量验证脚本
 * 
 * 功能：验证 Agent 核心文件的质量，确保符合 openclaw_core_files_architect 标准
 * 参考：references/core-files-quality-standards.md
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
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

// 文件长度限制
const FILE_LIMITS = {
  'AGENTS.md': { recommended: 150, max: 300, warning: 250 },
  'SOUL.md': { recommended: 75, max: 150, warning: 120 },
  'IDENTITY.md': { recommended: 45, max: 100, warning: 80 },
  'USER.md': { recommended: 65, max: 120, warning: 100 },
  'TOOLS.md': { recommended: 115, max: 250, warning: 200 },
  'MEMORY.md': { recommended: 115, max: 250, warning: 200 },
  'HEARTBEAT.md': { recommended: 15, max: 30, warning: 25 }
};

// 必须包含的章节
const REQUIRED_SECTIONS = {
  'AGENTS.md': [
    'Mission',
    'Session Startup',
    'Operating Loop',
    'Tool Routing',
    'External Action',
    'Memory Writeback',
    'Shared Context',
    'Definition of Done',
    'Failure Recovery'
  ],
  'SOUL.md': [
    'Identity',
    'Tone',
    'Boundaries'
  ],
  'USER.md': [
    'Master Base',
    'Preferences',
    'Constraints'
  ],
  'TOOLS.md': [
    'Infrastructure',
    'Credentials',
    'Cyberware',
    'Local Traps'
  ],
  'MEMORY.md': [
    'Memory System',
    'LanceDB',
    'Memory Files',
    'Writeback'
  ],
  'HEARTBEAT.md': [
    'Periodic Check'
  ]
};

// 禁止包含的内容
const FORBIDDEN_CONTENT = {
  'AGENTS.md': [
    { pattern: /人格描写|性格特征|personality/i, suggestion: '人格内容应迁移到 SOUL.md' },
    { pattern: /用户画像|用户偏好|user preference/i, suggestion: '用户画像应迁移到 USER.md' },
    { pattern: /今日待办|今天要做|today's task/i, suggestion: '临时任务应迁移到 memory/YYYY-MM-DD.md' }
  ],
  'SOUL.md': [
    { pattern: /工具调用|tool call|SOP/i, suggestion: '工具调用流程应迁移到 AGENTS.md 或 skill' },
    { pattern: /今日状态|当前状态|current state/i, suggestion: '短期状态应迁移到 memory/YYYY-MM-DD.md' }
  ],
  'USER.md': [
    { pattern: /今日待办|今天要做|today's task/i, suggestion: '临时任务应迁移到 memory/YYYY-MM-DD.md' },
    { pattern: /刚做完|刚刚完成|just completed/i, suggestion: '已完成任务应迁移到 memory/YYYY-MM-DD.md' }
  ],
  'TOOLS.md': [
    { pattern: /人格|personality|风格/i, suggestion: '人格内容应迁移到 SOUL.md' }
  ],
  'MEMORY.md': [
    { pattern: /流水账|时间序列|timeline/i, suggestion: '时间序列日志应迁移到 memory/YYYY-MM-DD.md' }
  ],
  'HEARTBEAT.md': [
    { pattern: /指令墙|长篇|detailed instruction/i, suggestion: 'HEARTBEAT.md 应保持极短' }
  ]
};

/**
 * 计算文件行数
 */
function countLines(content) {
  return content.split('\n').length;
}

/**
 * 检查章节完整性
 */
function checkSections(content, filename) {
  const sections = REQUIRED_SECTIONS[filename] || [];
  const found = [];
  const missing = [];
  
  for (const section of sections) {
    // 灵活匹配：标题中包含关键词即可
    const pattern = new RegExp(`#+.*${section}`, 'i');
    if (pattern.test(content)) {
      found.push(section);
    } else {
      missing.push(section);
    }
  }
  
  return { found, missing };
}

/**
 * 检查禁止内容
 */
function checkForbiddenContent(content, filename) {
  const forbidden = FORBIDDEN_CONTENT[filename] || [];
  const violations = [];
  
  for (const { pattern, suggestion } of forbidden) {
    if (pattern.test(content)) {
      violations.push({ pattern: pattern.source, suggestion });
    }
  }
  
  return violations;
}

/**
 * 打分（0-10）
 */
function calculateScore(filename, lineCount, sections, violations) {
  let score = 10;
  
  // 长度扣分
  const limits = FILE_LIMITS[filename];
  if (limits) {
    if (lineCount > limits.max) {
      score -= 3;
    } else if (lineCount > limits.warning) {
      score -= 1;
    }
  }
  
  // 章节缺失扣分
  const totalSections = (REQUIRED_SECTIONS[filename] || []).length;
  if (totalSections > 0) {
    const missingRatio = sections.missing.length / totalSections;
    score -= missingRatio * 3;
  }
  
  // 禁止内容扣分
  score -= violations.length * 2;
  
  return Math.max(0, Math.min(10, score));
}

/**
 * 验证单个文件
 */
function validateFile(filePath, filename) {
  if (!fs.existsSync(filePath)) {
    return {
      exists: false,
      error: '文件不存在'
    };
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

/**
 * 主验证函数
 */
function validate(workspaceDir) {
  print(`\n🔍 验证核心文件质量...\n`, 'blue');
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
      fileCount++;
      totalScore += result.score;
    }
    
    print(`\n📄 ${filename}`, 'blue');
    
    if (!result.exists) {
      print(`  ❌ ${result.error}`, 'red');
      continue;
    }
    
    // 行数
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
    
    // 章节完整性
    const sections = result.sections;
    if (sections) {
      if (sections.missing.length === 0) {
        print(`  ✅ 章节完整: ${sections.found.length}/${sections.found.length}`, 'green');
      } else {
        print(`  ⚠️ 缺失章节: ${sections.missing.join(', ')}`, 'yellow');
      }
    }
    
    // 禁止内容
    if (result.violations.length > 0) {
      print(`  ❌ 检测到禁止内容:`, 'red');
      for (const v of result.violations) {
        print(`     - ${v.suggestion}`, 'red');
      }
    } else {
      print(`  ✅ 无禁止内容`, 'green');
    }
    
    // 得分
    const scoreColor = result.score >= 8 ? 'green' : result.score >= 6 ? 'yellow' : 'red';
    print(`  📊 质量得分: ${result.score.toFixed(1)}/10`, scoreColor);
  }
  
  // 总体评估
  const avgScore = fileCount > 0 ? totalScore / fileCount : 0;
  
  print(`\n${'═'.repeat(50)}`, 'blue');
  print(`📊 总体评估`, 'blue');
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
  
  // 改进建议
  print(`\n💡 改进建议:`, 'cyan');
  
  for (const [filename, result] of Object.entries(results)) {
    if (!result.exists) continue;
    
    if (result.score < 8) {
      print(`\n  📄 ${filename}:`, 'yellow');
      
      if (result.violations.length > 0) {
        print(`    - 移除禁止内容`, 'yellow');
      }
      if (result.sections && result.sections.missing.length > 0) {
        print(`    - 补充缺失章节: ${result.sections.missing.join(', ')}`, 'yellow');
      }
      if (result.lineCount > (result.limits?.warning || 0)) {
        print(`    - 精简内容，减少行数`, 'yellow');
      }
    }
  }
  
  return {
    results,
    avgScore,
    status: avgScore >= 7 ? 'pass' : 'fail'
  };
}

// 命令行参数
const workspaceDir = process.argv[2];

if (!workspaceDir) {
  console.error('用法: node validate-core-files.js <workspace-dir>');
  process.exit(1);
}

const result = validate(workspaceDir);
process.exit(result.status === 'pass' ? 0 : 1);
