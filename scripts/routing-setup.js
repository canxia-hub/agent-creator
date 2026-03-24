#!/usr/bin/env node
/**
 * Agent Creator - 多 Agent 路由配置脚本
 * 
 * 功能：配置 bindings 实现消息路由
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

// 设置路由
function setupRouting(agentIds, options = {}) {
  print(`\n🔄 配置多 Agent 路由...\n`, 'blue');
  
  const configPath = path.join(CONFIG.openclawDir, 'openclaw.json');
  
  // 读取现有配置
  let openclawConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      openclawConfig = JSON.parse(content);
      print('  ✅ 读取现有配置', 'green');
    } catch (error) {
      print(`  ⚠️ 读取配置失败: ${error.message}`, 'yellow');
    }
  }
  
  // 确保 agents.list 存在
  if (!openclawConfig.agents) {
    openclawConfig.agents = {};
  }
  if (!openclawConfig.agents.list) {
    openclawConfig.agents.list = [];
  }
  
  // 添加 Agent 到 list
  for (const agentId of agentIds) {
    const exists = openclawConfig.agents.list.some(a => a.id === agentId);
    if (!exists) {
      const isDefault = agentId === 'main' || openclawConfig.agents.list.length === 0;
      openclawConfig.agents.list.push({
        id: agentId,
        default: isDefault,
        workspace: path.join(CONFIG.openclawDir, `workspace-${agentId}`)
      });
      print(`  ➕ 添加 Agent: ${agentId}`, 'green');
    } else {
      print(`  ✓ Agent 已存在: ${agentId}`, 'yellow');
    }
  }
  
  // 确保 bindings 存在
  if (!openclawConfig.bindings) {
    openclawConfig.bindings = [];
  }
  
  // 为每个 Agent 创建 binding
  const channel = options.channel || 'feishu';
  
  for (const agentId of agentIds) {
    const accountId = agentId === 'main' ? 'default' : agentId;
    
    // 检查是否已有 binding
    const exists = openclawConfig.bindings.some(
      b => b.agentId === agentId && b.match?.channel === channel
    );
    
    if (!exists) {
      openclawConfig.bindings.push({
        agentId: agentId,
        match: {
          channel: channel,
          accountId: accountId
        }
      });
      print(`  ➕ 添加路由: ${agentId} -> ${channel}:${accountId}`, 'green');
    } else {
      print(`  ✓ 路由已存在: ${agentId} -> ${channel}:${accountId}`, 'yellow');
    }
  }
  
  // 保存配置
  try {
    fs.writeFileSync(configPath, JSON.stringify(openclawConfig, null, 2));
    print('\n  ✅ 路由配置已更新', 'green');
  } catch (error) {
    print(`\n  ❌ 保存配置失败: ${error.message}`, 'red');
    return 1;
  }
  
  // 显示配置摘要
  print('\n┌────────────────────────────────────────────────────────┐', 'blue');
  print('│                    路由配置摘要                         │', 'blue');
  print('├────────────────────────────────────────────────────────┤', 'blue');
  
  for (const agentId of agentIds) {
    const accountId = agentId === 'main' ? 'default' : agentId;
    print(`│  ${agentId.padEnd(15)} -> ${channel}:${accountId.padEnd(20)}│`, 'green');
  }
  
  print('└────────────────────────────────────────────────────────┘', 'blue');
  
  print('\n📝 配置说明：', 'blue');
  print('  消息路由规则：', 'yellow');
  print('    - 飞书 default 账号的消息 -> main Agent', 'yellow');
  print('    - 飞书其他账号的消息 -> 对应 Agent', 'yellow');
  
  print('\n⚠️ 注意：', 'yellow');
  print('  修改配置后需要重启 Gateway 生效', 'yellow');
  print('  执行: openclaw gateway restart\n', 'yellow');
  
  return 0;
}

// 命令行参数
const agentsArg = process.argv[2];

if (!agentsArg) {
  console.error('用法: node routing-setup.js <agent-ids>');
  console.error('示例: node routing-setup.js "main,finance,hr"');
  process.exit(1);
}

const agentIds = agentsArg.split(',').map(s => s.trim());

process.exit(setupRouting(agentIds));
