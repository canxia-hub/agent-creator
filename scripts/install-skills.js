#!/usr/bin/env node
/**
 * Agent Creator - 技能安装脚本
 * 
 * 功能：为指定 Agent 安装必备技能
 * 修复：使用直接复制方式替代 skill-manager 命令
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  openclawDir: process.env.OPENCLAW_STATE_DIR || path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw'),
  requiredSkills: [
    'lancedb-query',
    'memory-manager',
    'cron-manager',
    'self-improving-agent',
    'searxng-web-search',
    'agent-browser',
    'powershell',
    'skill-finder-cn',
    'agent-config',
    'agent-team-orchestration',
    'task-decomposer'
  ],
  optionalSkills: [
    'feishu-media',
    'volcengine-ark-tts',
    'volcengine-ark-asr',
    'bailian-video-recognition',
    'github',
    'docker-essentials',
    'gui-vision-controller',
    'video-downloader',
    'summarize',
    'agent-evaluation'
  ]
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

// 复制目录
function copyDir(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

// 安装技能
async function installSkill(skill) {
  return new Promise((resolve) => {
    try {
      print(`  ⏳ 安装 ${skill}...`, 'blue');
      
      const srcDir = path.join(CONFIG.openclawDir, 'workspace', 'skills', skill);
      const dstDir = path.join(CONFIG.openclawDir, 'workspace-su-er', 'skills', skill);
      
      // 检查源目录是否存在
      if (!fs.existsSync(srcDir)) {
        print(`  ⚠️ ${skill} 源目录不存在`, 'yellow');
        resolve({ skill, success: false, error: '源目录不存在' });
        return;
      }
      
      // 复制技能目录
      copyDir(srcDir, dstDir);
      
      // 验证安装
      if (fs.existsSync(dstDir)) {
        print(`  ✅ ${skill} 安装成功`, 'green');
        resolve({ skill, success: true });
      } else {
        print(`  ❌ ${skill} 安装失败`, 'red');
        resolve({ skill, success: false, error: '复制失败' });
      }
    } catch (error) {
      print(`  ❌ ${skill} 安装失败: ${error.message}`, 'red');
      resolve({ skill, success: false, error: error.message });
    }
  });
}

// 主函数
async function installSkills(agentId, skills = null) {
  const skillsToInstall = skills || CONFIG.requiredSkills;
  
  // 获取 Agent 的工作区目录
  const workspaceDir = path.join(CONFIG.openclawDir, `workspace-${agentId}`);
  
  // 如果工作区不存在，提示错误
  if (!fs.existsSync(workspaceDir)) {
    print(`\n❌ Agent "${agentId}" 的工作区不存在`, 'red');
    print(`   路径: ${workspaceDir}`, 'yellow');
    print('\n   请先运行: agent-creator create\n', 'yellow');
    return 1;
  }
  
  print(`\n🧩 为 Agent "${agentId}" 安装技能...\n`, 'blue');
  print(`共 ${skillsToInstall.length} 个技能需要安装\n`, 'blue');
  
  const results = [];
  
  for (const skill of skillsToInstall) {
    const result = await installSkill(skill);
    results.push(result);
  }
  
  // 统计
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  print(`\n┌────────────────────────────────────────────────────────┐`, 'blue');
  print(`│                      安装结果                          │`, 'blue');
  print(`├────────────────────────────────────────────────────────┤`, 'blue');
  print(`│  成功：${String(success).padEnd(5)}                                  │`, 'green');
  print(`│  失败：${String(failed).padEnd(5)}                                  │`, failed > 0 ? 'red' : 'green');
  print(`└────────────────────────────────────────────────────────┘`, 'blue');
  
  if (failed > 0) {
    print('\n失败的技能：', 'red');
    results.filter(r => !r.success).forEach(r => {
      print(`  - ${r.skill}`, 'red');
    });
  }
  
  print('\n✅ 技能安装完成！\n', 'green');
  print(`技能已安装到：${path.join(workspaceDir, 'skills')}\n`, 'blue');
  
  return failed === 0 ? 0 : 1;
}

// 命令行参数
const agentId = process.argv[2];
const skillsArg = process.argv[3];

if (!agentId) {
  console.error('用法：node install-skills.js <agent-id> [skills-json-array]');
  console.error('示例：node install-skills.js my-bot');
  console.error('      node install-skills.js my-bot \'["skill1", "skill2"]\'');
  process.exit(1);
}

let skills = null;
if (skillsArg) {
  try {
    skills = JSON.parse(skillsArg);
  } catch (error) {
    console.error('错误：skills 参数必须是有效的 JSON 数组');
    process.exit(1);
  }
}

installSkills(agentId, skills).then(code => process.exit(code));
