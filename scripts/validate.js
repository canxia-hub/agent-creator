#!/usr/bin/env node
/**
 * Agent Creator - 配置验证脚本
 * 
 * 功能：验证 Agent 配置完整性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  openclawDir: process.env.OPENCLAW_STATE_DIR || path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw')
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 验证文件存在
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    print(`  ✅ ${description}`, 'green');
    return true;
  } else {
    print(`  ❌ ${description} - 文件不存在`, 'red');
    return false;
  }
}

// 验证 JSON 格式
function validateJson(filePath, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    print(`  ✅ ${description} - JSON 格式正确`, 'green');
    return true;
  } catch (error) {
    print(`  ❌ ${description} - JSON 格式错误: ${error.message}`, 'red');
    return false;
  }
}

// 主验证函数
function validate(agentId) {
  print(`\n🔍 验证 Agent "${agentId}" 配置...\n`, 'blue');
  
  const agentDir = path.join(CONFIG.openclawDir, 'agents', agentId);
  const workspaceDir = path.join(CONFIG.openclawDir, `workspace-${agentId}`);
  const configPath = path.join(agentDir, 'agent', 'config.json');
  
  let passed = 0;
  let failed = 0;
  
  // 1. 检查目录结构
  print('📁 检查目录结构...', 'blue');
  if (checkFile(agentDir, 'Agent 目录')) passed++; else failed++;
  if (checkFile(workspaceDir, '工作区目录')) passed++; else failed++;
  if (checkFile(path.join(agentDir, 'agent'), 'Agent 配置目录')) passed++; else failed++;
  
  // 2. 检查 config.json
  print('\n🔧 检查 config.json...', 'blue');
  if (fs.existsSync(configPath)) {
    if (validateJson(configPath, 'config.json')) {
      passed++;
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // 验证必需字段
      const requiredFields = ['identity', 'model', 'workspace', 'skills'];
      for (const field of requiredFields) {
        if (config[field]) {
          print(`    ✅ 字段 "${field}" 存在`, 'green');
          passed++;
        } else {
          print(`    ❌ 字段 "${field}" 缺失`, 'red');
          failed++;
        }
      }
    } else {
      failed++;
    }
  } else {
    print(`  ❌ config.json - 文件不存在`, 'red');
    failed++;
  }
  
  // 3. 检查核心文件
  print('\n📄 检查核心配置文件...', 'blue');
  const coreFiles = [
    { file: 'AGENTS.md', desc: 'AGENTS.md' },
    { file: 'SOUL.md', desc: 'SOUL.md' },
    { file: 'IDENTITY.md', desc: 'IDENTITY.md' },
    { file: 'USER.md', desc: 'USER.md' },
    { file: 'MEMORY.md', desc: 'MEMORY.md' },
    { file: 'TOOLS.md', desc: 'TOOLS.md' }
  ];
  
  for (const { file, desc } of coreFiles) {
    if (checkFile(path.join(workspaceDir, file), desc)) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // 4. 检查记忆目录
  print('\n🧠 检查记忆系统...', 'blue');
  if (checkFile(path.join(workspaceDir, 'memory'), 'memory 目录')) passed++; else failed++;
  
  // 5. 运行 openclaw doctor
  print('\n🏥 运行 openclaw doctor...', 'blue');
  try {
    execSync('openclaw doctor', { stdio: 'inherit' });
    print('  ✅ openclaw doctor 通过', 'green');
    passed++;
  } catch (error) {
    print('  ⚠️ openclaw doctor 发现警告或错误', 'yellow');
    failed++;
  }
  
  // 6. 检查 Agent 是否已注册
  print('\n📝 检查 Agent 注册状态...', 'blue');
  try {
    const output = execSync('openclaw agents list --json', { encoding: 'utf8' });
    const agents = JSON.parse(output);
    if (agents.some(a => a.id === agentId)) {
      print(`  ✅ Agent "${agentId}" 已注册`, 'green');
      passed++;
    } else {
      print(`  ⚠️ Agent "${agentId}" 未注册`, 'yellow');
      failed++;
    }
  } catch (error) {
    print(`  ⚠️ 无法检查注册状态`, 'yellow');
    failed++;
  }
  
  // 总结
  print(`\n┌────────────────────────────────────────────────────────┐`, 'blue');
  print(`│                      验证结果                          │`, 'blue');
  print(`├────────────────────────────────────────────────────────┤`, 'blue');
  print(`│  通过: ${String(passed).padEnd(5)}                                  │`, 'green');
  print(`│  失败: ${String(failed).padEnd(5)}                                  │`, failed > 0 ? 'red' : 'green');
  print(`└────────────────────────────────────────────────────────┘`, 'blue');
  
  if (failed === 0) {
    print('\n✅ 所有验证通过！Agent 配置完整。\n', 'green');
    return 0;
  } else {
    print(`\n⚠️ 发现 ${failed} 个问题，请修复后重新验证。\n`, 'yellow');
    return 1;
  }
}

// 命令行参数
const agentId = process.argv[2];

if (!agentId) {
  console.error('用法: node validate.js <agent-id>');
  process.exit(1);
}

process.exit(validate(agentId));
