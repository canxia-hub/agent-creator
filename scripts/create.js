#!/usr/bin/env node
/**
 * Agent Creator - 交互式创建向导 v3.1.1
 * 
 * 功能：引导用户创建新的 OpenClaw Agent
 * 流程：输入信息 → 选择模板 → 生成配置 → 质量验证 → 安装技能 → 注册
 * 
 * v3.1.1 更新：
 * - 集成 openclaw-core-files-architect 质量标准
 * - 使用高质量模板系统
 * - 自动执行核心文件质量验证
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// 导入高质量文件生成器
const fileGenerator = require('./utils/file-generator');

// 配置
const CONFIG = {
  openclawDir: process.env.OPENCLAW_STATE_DIR || path.join(process.env.USERPROFILE || process.env.HOME, '.openclaw'),
  templatesDir: path.join(__dirname, 'templates'),
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
    { name: 'feishu-media', desc: '飞书媒体处理' },
    { name: 'volcengine-ark-tts', desc: '火山引擎 TTS' },
    { name: 'volcengine-ark-asr', desc: '火山引擎 ASR' },
    { name: 'bailian-video-recognition', desc: '百炼视频识别' },
    { name: 'github', desc: 'GitHub 交互' },
    { name: 'docker-essentials', desc: 'Docker 基础' },
    { name: 'gui-vision-controller', desc: 'GUI 视觉操作' },
    { name: 'video-downloader', desc: '视频下载' },
    { name: 'summarize', desc: '内容摘要' },
    { name: 'agent-evaluation', desc: 'Agent 能力评估' }
  ],
  templates: [
    { id: 'personal-assistant', name: '个人助手', desc: '个人日常助手', emoji: '🤖' },
    { id: 'team-helper', name: '团队助手', desc: '团队协作助手', emoji: '👥' },
    { id: 'coding-assistant', name: '代码助手', desc: '代码开发助手', emoji: '💻' },
    { id: 'data-analyst', name: '数据分析师', desc: '数据分析助手', emoji: '📊' },
    { id: 'customer-service', name: '客服助手', desc: '客户服务助手', emoji: '🎧' }
  ],
  models: [
    { id: 'bailian/qwen3.5-plus', name: '通义千问 3.5 Plus', desc: '阿里云，均衡型' },
    { id: 'volcengine-coding/doubao-seed-2.0-pro', name: '豆包 2.0 Pro', desc: '字节跳动，代码强' },
    { id: 'baidu-qianfan/glm-5', name: 'GLM-5', desc: '百度千帆，综合型' },
    { id: 'byteplus-coding/kimi-k2.5', name: 'Kimi K2.5', desc: '字节跳动，长文本' }
  ]
};

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 辅助函数：提问
function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// 辅助函数：选择列表
async function select(question, options, defaultIndex = 0) {
  console.log(`\n${question}`);
  options.forEach((opt, idx) => {
    const marker = idx === defaultIndex ? '>' : ' ';
    console.log(`  ${marker} ${idx + 1}. ${opt.name}${opt.desc ? ` - ${opt.desc}` : ''}`);
  });
  
  const answer = await ask(`请选择 (1-${options.length})`, (defaultIndex + 1).toString());
  const index = parseInt(answer) - 1;
  
  if (index >= 0 && index < options.length) {
    return options[index];
  }
  return options[defaultIndex];
}

// 辅助函数：多选
async function multiSelect(question, options) {
  console.log(`\n${question} (输入编号，多个用逗号分隔，全选输入 all)`);
  options.forEach((opt, idx) => {
    console.log(`  ${idx + 1}. ${opt.name}${opt.desc ? ` - ${opt.desc}` : ''}`);
  });
  
  const answer = await ask('请选择', 'all');
  
  if (answer.toLowerCase() === 'all') {
    return options;
  }
  
  const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
  return indices.filter(i => i >= 0 && i < options.length).map(i => options[i]);
}

// 验证 Agent ID
function validateAgentId(id) {
  if (!id) return 'Agent ID 不能为空';
  if (!/^[a-z0-9-]+$/.test(id)) return 'Agent ID 只能包含小写字母、数字、连字符';
  if (id.length < 3) return 'Agent ID 至少 3 个字符';
  if (id.length > 30) return 'Agent ID 最多 30 个字符';
  return null;
}

// 检查 Agent 是否已存在
function checkAgentExists(agentId) {
  const agentDir = path.join(CONFIG.openclawDir, 'agents', agentId);
  const workspaceDir = path.join(CONFIG.openclawDir, `workspace-${agentId}`);
  return fs.existsSync(agentDir) || fs.existsSync(workspaceDir);
}

// 创建目录
function createDirectories(agentId) {
  const dirs = [
    path.join(CONFIG.openclawDir, 'agents', agentId, 'agent'),
    path.join(CONFIG.openclawDir, `workspace-${agentId}`),
    path.join(CONFIG.openclawDir, `workspace-${agentId}`, 'memory'),
    path.join(CONFIG.openclawDir, `workspace-${agentId}`, 'skills'),
    path.join(CONFIG.openclawDir, `workspace-${agentId}`, 'docs'),
    path.join(CONFIG.openclawDir, `workspace-${agentId}`, 'tasks')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`  📁 创建目录: ${dir}`);
    }
  });
}

// 保存所有文件（使用高质量模板系统）
function saveFiles(agentConfig) {
  const workspaceDir = path.join(CONFIG.openclawDir, `workspace-${agentConfig.id}`);
  const agentDir = path.join(CONFIG.openclawDir, 'agents', agentConfig.id, 'agent');
  
  // 添加 workspace 到配置
  agentConfig.workspace = workspaceDir;
  
  // 保存 config.json
  fs.writeFileSync(path.join(agentDir, 'config.json'), fileGenerator.generateConfigJson(agentConfig));
  console.log('  📝 生成 config.json');
  
  // 使用高质量模板生成核心文件
  console.log('\n📐 使用架构师标准模板生成核心文件...');
  const results = fileGenerator.generateCoreFiles(agentConfig, workspaceDir);
  
  // 输出结果
  results.success.forEach(file => {
    console.log(`  ✅ 生成 ${file}`);
  });
  results.failed.forEach(({ file, reason }) => {
    console.log(`  ❌ 生成 ${file} 失败: ${reason}`);
  });
  results.warnings.forEach(({ file, reason }) => {
    console.log(`  ⚠️ 跳过 ${file}: ${reason}`);
  });

  if (results.failed.length > 0) {
    throw new Error(`核心文件生成失败: ${results.failed.map(({ file, reason }) => `${file}(${reason})`).join(', ')}`);
  }
  
  // 初始化 memory/ 目录
  console.log('\n📁 初始化记忆系统目录...');
  fileGenerator.initMemoryDir(workspaceDir, agentConfig);
  console.log('  ✅ 初始化 memory/ 目录');
  
  return results;
}

// 执行质量验证
function validateQuality(workspaceDir) {
  console.log('\n🔍 执行核心文件质量验证...');
  
  const result = fileGenerator.validateQuality(workspaceDir);
  
  if (result.status === 'skipped') {
    console.log(`  ⚠️ 质量验证跳过: ${result.reason}`);
    return { status: 'skipped', score: 0 };
  }
  
  if (result.status === 'pass') {
    console.log(`  ✅ 质量验证通过，平均得分: ${result.score}/10`);
  } else {
    console.log(`  ⚠️ 质量验证需要改进，平均得分: ${result.score}/10`);
  }
  
  return result;
}

// 安装技能
async function installSkills(agentConfig) {
  console.log('\n🧩 安装必备技能...');
  
  for (const skill of agentConfig.skills) {
    try {
      console.log(`  ⏳ 安装 ${skill}...`);
      execSync(`skill-manager install ${skill}`, { stdio: 'inherit' });
      console.log(`  ✅ ${skill} 安装成功`);
    } catch (error) {
      console.log(`  ⚠️ ${skill} 安装失败，跳过`);
    }
  }
}

// 注册 Agent
function registerAgent(agentConfig) {
  console.log('\n📝 注册 Agent 到 Gateway...');
  
  try {
    const cmd = `openclaw agents add ${agentConfig.id} ` +
      `--agent-dir "${path.join(CONFIG.openclawDir, 'agents', agentConfig.id)}" ` +
      `--workspace "${path.join(CONFIG.openclawDir, `workspace-${agentConfig.id}`)}" ` +
      `--model ${agentConfig.model} ` +
      `--non-interactive`;
    
    execSync(cmd, { stdio: 'inherit' });
    console.log('  ✅ Agent 注册成功');
  } catch (error) {
    console.log('  ⚠️ Agent 注册失败，可手动执行：');
    console.log(`     openclaw agents add ${agentConfig.id}`);
  }
}

// 主流程
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           🚀 Agent Creator - 创建新 Agent               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  try {
    // 1. 输入 Agent ID
    let agentId;
    while (true) {
      agentId = await ask('请输入 Agent ID（小写字母、数字、连字符）');
      const error = validateAgentId(agentId);
      if (error) {
        console.log(`  ❌ ${error}`);
        continue;
      }
      if (checkAgentExists(agentId)) {
        console.log(`  ⚠️ Agent "${agentId}" 已存在，请使用其他 ID`);
        continue;
      }
      break;
    }
    
    // 2. 输入名称
    const agentName = await ask('请输入 Agent 显示名称', agentId);
    
    // 3. 选择表情
    const emoji = await ask('请输入表情符号', '🤖');
    
    // 4. 选择模板
    const template = await select('请选择用途模板', CONFIG.templates);
    
    // 5. 选择模型
    const model = await select('请选择默认模型', CONFIG.models);
    
    // 6. 确认必备技能
    console.log('\n📋 必备技能（默认全选）：');
    CONFIG.requiredSkills.forEach(skill => console.log(`  ✅ ${skill}`));
    const installRequired = await ask('是否安装以上必备技能？(y/n)', 'y');
    
    // 7. 选择可选技能
    let optionalSkills = [];
    const installOptional = await ask('是否选择可选技能？(y/n)', 'n');
    if (installOptional.toLowerCase() === 'y') {
      optionalSkills = await multiSelect('请选择可选技能', CONFIG.optionalSkills);
    }
    
    // 8. 确认创建
    const allSkills = [...CONFIG.requiredSkills];
    if (installRequired.toLowerCase() !== 'y') {
      allSkills.length = 0;
    }
    allSkills.push(...optionalSkills.map(s => s.name));
    
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│                    创建信息确认                         │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ Agent ID:    ${agentId.padEnd(40)}│`);
    console.log(`│ 显示名称:     ${agentName.padEnd(40)}│`);
    console.log(`│ 表情符号:     ${emoji.padEnd(40)}│`);
    console.log(`│ 模板:        ${template.name.padEnd(40)}│`);
    console.log(`│ 模型:        ${model.name.padEnd(40)}│`);
    console.log(`│ 技能数量:    ${String(allSkills.length).padEnd(40)}│`);
    console.log('└────────────────────────────────────────────────────────┘');
    
    const confirm = await ask('确认创建？(y/n)', 'y');
    if (confirm.toLowerCase() !== 'y') {
      console.log('\n❌ 已取消创建');
      rl.close();
      return;
    }
    
    // 9. 创建 Agent
    console.log('\n🚀 开始创建 Agent...\n');
    
    const agentConfig = {
      id: agentId,
      name: agentName,
      emoji: emoji,
      template: template.id,
      model: model.id,
      skills: allSkills
    };
    
    // 创建目录
    console.log('📁 创建目录结构...');
    createDirectories(agentId);
    
    // 生成文件（使用高质量模板）
    const fileResults = saveFiles(agentConfig);
    
    // 执行质量验证
    const workspaceDir = path.join(CONFIG.openclawDir, `workspace-${agentId}`);
    const qualityResult = validateQuality(workspaceDir);
    
    // 安装技能
    if (allSkills.length > 0) {
      await installSkills(agentConfig);
    }
    
    // 注册 Agent
    registerAgent(agentConfig);
    
    // 完成
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                   ✅ 创建完成！                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Agent "${agentName}" (${agentId}) 创建成功！`);
    console.log(`\n📊 质量验证结果：`);
    console.log(`   核心文件生成：${fileResults.success.length}/${fileResults.success.length + fileResults.failed.length} 成功`);
    console.log(`   质量得分：${qualityResult.score}/10 ${qualityResult.status === 'pass' ? '✅' : qualityResult.status === 'skipped' ? '⚠️' : '❌'}`);
    console.log(`\n📁 工作区：${workspaceDir}`);
    console.log(`🔧 配置：${path.join(CONFIG.openclawDir, 'agents', agentId, 'agent', 'config.json')}`);
    console.log(`\n🚀 下一步可选操作：`);
    console.log(`   1. 配置飞书：agent-creator feishu-setup --agent-id ${agentId}`);
    console.log(`   2. 详细验证：node scripts/utils/validate-core-files.js "${workspaceDir}"`);
    console.log(`   3. 重启 Gateway：openclaw gateway restart`);
    
    if (qualityResult.score < 7 && qualityResult.status !== 'skipped') {
      console.log(`\n💡 提示：质量得分较低，建议检查核心文件是否符合架构师标准。`);
    }
    
  } catch (error) {
    console.error('\n❌ 创建失败：', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 运行主流程
main();
