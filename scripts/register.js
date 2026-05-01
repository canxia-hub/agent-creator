#!/usr/bin/env node
/**
 * Agent Creator - Agent 注册脚本
 * 
 * 功能：注册 Agent 到 OpenClaw Gateway
 */

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

// 注册 Agent
function registerAgent(agentId) {
  print(`\n📝 注册 Agent "${agentId}"...\n`, 'blue');
  
  const agentDir = path.join(CONFIG.openclawDir, 'agents', agentId);
  const workspaceDir = path.join(CONFIG.openclawDir, `workspace-${agentId}`);
  
  // 构建命令
  const cmd = `openclaw agents add ${agentId} ` +
    `--agent-dir "${agentDir}" ` +
    `--workspace "${workspaceDir}" ` +
    `--non-interactive`;
  
  print(`  执行: ${cmd}\n`, 'yellow');
  
  try {
    execSync(cmd, { stdio: 'inherit' });
    print('\n  ✅ Agent 注册成功', 'green');
    
    // 验证注册
    print('\n🔍 验证注册状态...', 'blue');
    try {
      const output = execSync('openclaw agents list --json', { encoding: 'utf8' });
      const agents = JSON.parse(output);
      const agent = agents.find(a => a.id === agentId);
      
      if (agent) {
        print(`  ✅ Agent "${agentId}" 已在列表中`, 'green');
        print(`     工作区: ${agent.workspace}`, 'green');
      } else {
        print(`  ⚠️ Agent 可能未正确注册`, 'yellow');
      }
    } catch (error) {
      print(`  ⚠️ 无法验证注册状态`, 'yellow');
    }
    
    print('\n✅ 注册完成！\n', 'green');
    print('下一步：', 'blue');
    print('  1. 重启 Gateway: openclaw gateway restart', 'yellow');
    print('  2. 验证状态: openclaw agents list --bindings\n', 'yellow');
    
    return 0;
  } catch (error) {
    print('\n  ❌ Agent 注册失败', 'red');
    print(`  错误: ${error.message}`, 'red');
    print('\n  请检查：', 'yellow');
    print('    - Agent ID 是否已存在', 'yellow');
    print('    - 工作区目录是否存在', 'yellow');
    print('    - openclaw CLI 是否可用\n', 'yellow');
    return 1;
  }
}

// 命令行参数
const agentId = process.argv[2];

if (!agentId) {
  console.error('用法: node register.js <agent-id>');
  console.error('示例: node register.js my-assistant');
  process.exit(1);
}

process.exit(registerAgent(agentId));
