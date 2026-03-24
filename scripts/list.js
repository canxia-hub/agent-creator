#!/usr/bin/env node
/**
 * Agent Creator - Agent 列表脚本
 * 
 * 功能：列出所有已创建的 Agent
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
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 获取本地 Agent 列表
function getLocalAgents() {
  const agentsDir = path.join(CONFIG.openclawDir, 'agents');
  const agents = [];
  
  if (!fs.existsSync(agentsDir)) {
    return agents;
  }
  
  const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const agentId = entry.name;
      const configPath = path.join(agentsDir, agentId, 'agent', 'config.json');
      
      let config = null;
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
          // 忽略解析错误
        }
      }
      
      agents.push({
        id: agentId,
        config: config,
        source: 'local'
      });
    }
  }
  
  return agents;
}

// 获取 Gateway 注册的 Agent
function getRegisteredAgents() {
  try {
    const output = execSync('openclaw agents list --json', { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    return [];
  }
}

// 显示 Agent 列表
function listAgents(options = {}) {
  print('\n📋 Agent 列表\n', 'blue');
  
  const localAgents = getLocalAgents();
  const registeredAgents = getRegisteredAgents();
  
  if (localAgents.length === 0 && registeredAgents.length === 0) {
    print('  暂无 Agent', 'yellow');
    print('\n  使用 "agent-creator create" 创建新 Agent\n', 'cyan');
    return 0;
  }
  
  // 合并信息
  const allAgents = new Map();
  
  for (const agent of localAgents) {
    allAgents.set(agent.id, {
      ...agent,
      registered: false
    });
  }
  
  for (const agent of registeredAgents) {
    if (allAgents.has(agent.id)) {
      allAgents.get(agent.id).registered = true;
      allAgents.get(agent.id).gatewayInfo = agent;
    } else {
      allAgents.set(agent.id, {
        id: agent.id,
        config: null,
        registered: true,
        gatewayInfo: agent,
        source: 'gateway-only'
      });
    }
  }
  
  // 显示表格
  print('┌────────────────────────────────────────────────────────────────────────┐', 'blue');
  print('│  ID                 │  名称               │  模型              │  状态   │', 'blue');
  print('├────────────────────────────────────────────────────────────────────────┤', 'blue');
  
  for (const [id, agent] of allAgents) {
    const name = agent.config?.identity?.name || id;
    const model = agent.config?.model?.split('/').pop() || '-';
    
    let status = '';
    if (agent.registered && agent.source !== 'gateway-only') {
      status = '✅ 正常';
    } else if (agent.registered) {
      status = '📝 仅注册';
    } else {
      status = '⚠️ 未注册';
    }
    
    print(`│  ${id.padEnd(17)} │  ${name.padEnd(17)} │  ${model.padEnd(16)} │  ${status.padEnd(5)} │`);
  }
  
  print('└────────────────────────────────────────────────────────────────────────┘', 'blue');
  
  // 统计
  const total = allAgents.size;
  const normal = Array.from(allAgents.values()).filter(a => a.registered && a.source !== 'gateway-only').length;
  const unregistered = Array.from(allAgents.values()).filter(a => !a.registered).length;
  
  print(`\n统计: 共 ${total} 个 Agent，${normal} 个正常，${unregistered} 个未注册\n`, 'cyan');
  
  if (unregistered > 0) {
    print('提示: 未注册的 Agent 需要执行:', 'yellow');
    print('  agent-creator register <agent-id>\n', 'cyan');
  }
  
  return 0;
}

// 显示详细信息
function showDetails(agentId) {
  print(`\n📋 Agent "${agentId}" 详细信息\n`, 'blue');
  
  const configPath = path.join(CONFIG.openclawDir, 'agents', agentId, 'agent', 'config.json');
  
  if (!fs.existsSync(configPath)) {
    print(`  ❌ Agent "${agentId}" 不存在\n`, 'red');
    return 1;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    print('┌────────────────────────────────────────────────────────┐', 'blue');
    print('│                    基本信息                            │', 'blue');
    print('├────────────────────────────────────────────────────────┤', 'blue');
    print(`│  ID:        ${agentId.padEnd(43)}│`);
    print(`│  名称:      ${(config.identity?.name || '-').padEnd(43)}│`);
    print(`│  表情:      ${(config.identity?.emoji || '-').padEnd(43)}│`);
    print(`│  模型:      ${(config.model || '-').padEnd(43)}│`);
    print('├────────────────────────────────────────────────────────┤', 'blue');
    print('│                    工作区                              │', 'blue');
    print('├────────────────────────────────────────────────────────┤', 'blue');
    print(`│  ${(config.workspace || '-').padEnd(52)}│`);
    print('├────────────────────────────────────────────────────────┤', 'blue');
    print('│                    技能列表                            │', 'blue');
    print('├────────────────────────────────────────────────────────┤', 'blue');
    
    if (config.skills && config.skills.length > 0) {
      for (const skill of config.skills) {
        print(`│  • ${skill.padEnd(50)}│`);
      }
    } else {
      print(`│  (无技能)${' '.padEnd(43)}│`);
    }
    
    print('└────────────────────────────────────────────────────────┘', 'blue');
    
    print('\n');
    return 0;
  } catch (error) {
    print(`  ❌ 读取配置失败: ${error.message}\n`, 'red');
    return 1;
  }
}

// 命令行参数
const command = process.argv[2];
const agentId = process.argv[3];

if (command === 'details' && agentId) {
  process.exit(showDetails(agentId));
} else {
  process.exit(listAgents());
}
