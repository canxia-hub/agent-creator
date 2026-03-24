#!/usr/bin/env node
/**
 * Agent Creator - 飞书应用配置脚本
 * 
 * 功能：配置飞书机器人应用
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const CONFIG = {
  openclawDir: process.env.OPENCLAW_STATE_DIR || path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw')
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

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

// 主配置流程
async function setupFeishu(agentId) {
  print(`\n🦞 配置飞书应用 for Agent "${agentId}"\n`, 'blue');
  
  print('📋 配置步骤：', 'blue');
  print('  1. 访问 https://open.feishu.cn/app 创建应用', 'yellow');
  print('  2. 获取 App ID 和 App Secret', 'yellow');
  print('  3. 配置应用权限（已提供批量导入 JSON）', 'yellow');
  print('  4. 发布应用并获取凭证\n', 'yellow');
  
  // 获取凭证
  const appId = await ask('请输入 App ID (cli_xxx): ');
  const appSecret = await ask('请输入 App Secret: ');
  
  if (!appId || !appSecret) {
    print('❌ App ID 和 App Secret 不能为空', 'red');
    rl.close();
    return 1;
  }
  
  // 读取现有配置
  const configPath = path.join(CONFIG.openclawDir, 'openclaw.json');
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
  
  // 更新配置
  if (!openclawConfig.channels) {
    openclawConfig.channels = {};
  }
  
  if (!openclawConfig.channels.feishu) {
    openclawConfig.channels.feishu = {
      enabled: true,
      accounts: {}
    };
  }
  
  // 添加账号
  const accountId = agentId === 'main' ? 'default' : agentId;
  openclawConfig.channels.feishu.accounts[accountId] = {
    appId: appId,
    appSecret: appSecret,
    domain: 'feishu'
  };
  
  // 保存配置
  try {
    fs.writeFileSync(configPath, JSON.stringify(openclawConfig, null, 2));
    print('  ✅ 更新 Gateway 配置', 'green');
  } catch (error) {
    print(`  ❌ 保存配置失败: ${error.message}`, 'red');
    rl.close();
    return 1;
  }
  
  // 生成权限配置
  const permissionsJson = {
    scopes: {
      tenant: [
        "im:chat",
        "im:message",
        "im:chat.access_event.bot_p2p_chat:read",
        "im:chat.members:bot_access",
        "im:message:send_as_bot",
        "contact:user.employee_id:readonly",
        "docx:document:readonly",
        "wiki:node:read",
        "calendar:calendar:readonly",
        "calendar:event:readonly",
        "task:task:readonly",
        "bitable:app:readonly",
        "drive:file:readonly"
      ]
    }
  };
  
  const permissionsPath = path.join(CONFIG.openclawDir, `feishu-permissions-${agentId}.json`);
  fs.writeFileSync(permissionsPath, JSON.stringify(permissionsJson, null, 2));
  
  print('\n📄 权限配置已生成:', 'blue');
  print(`  ${permissionsPath}`, 'yellow');
  print('\n  请将此 JSON 内容复制到飞书开放平台的"权限管理"中批量导入', 'yellow');
  
  // 询问是否重启 Gateway
  const restart = await ask('\n是否重启 Gateway 使配置生效？(y/n): ');
  
  if (restart.toLowerCase() === 'y') {
    print('\n🔄 重启 Gateway...', 'blue');
    try {
      execSync('openclaw gateway restart', { stdio: 'inherit' });
      print('  ✅ Gateway 重启成功', 'green');
    } catch (error) {
      print('  ❌ Gateway 重启失败', 'red');
      print('  请手动执行: openclaw gateway restart', 'yellow');
    }
  } else {
    print('\n⏸️ 已跳过重启', 'yellow');
    print('  请稍后手动执行: openclaw gateway restart', 'yellow');
  }
  
  print('\n✅ 飞书配置完成！\n', 'green');
  print('下一步建议：', 'blue');
  print('  1. 在飞书开放平台发布应用', 'yellow');
  print('  2. 将机器人添加到群聊或发送私信测试', 'yellow');
  print('  3. 运行: openclaw channels status --probe 验证连接\n', 'yellow');
  
  rl.close();
  return 0;
}

// 命令行参数
const agentId = process.argv[2] || 'main';

setupFeishu(agentId).then(code => process.exit(code));
