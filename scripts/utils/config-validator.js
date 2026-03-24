/**
 * Agent Creator - 配置验证工具
 * 
 * 功能：验证 Agent 配置完整性
 */

const fs = require('fs');
const path = require('path');

/**
 * 验证 Agent ID
 * @param {string} agentId - Agent ID
 * @returns {object} 验证结果 { valid: boolean, error: string }
 */
function validateAgentId(agentId) {
  if (!agentId) {
    return { valid: false, error: 'Agent ID 不能为空' };
  }
  
  if (!/^[a-z0-9-]+$/.test(agentId)) {
    return { valid: false, error: 'Agent ID 只能包含小写字母、数字、连字符' };
  }
  
  if (agentId.length < 3) {
    return { valid: false, error: 'Agent ID 至少 3 个字符' };
  }
  
  if (agentId.length > 30) {
    return { valid: false, error: 'Agent ID 最多 30 个字符' };
  }
  
  if (agentId.startsWith('-') || agentId.endsWith('-')) {
    return { valid: false, error: 'Agent ID 不能以连字符开头或结尾' };
  }
  
  return { valid: true, error: null };
}

/**
 * 验证 config.json 格式
 * @param {string} configPath - 配置文件路径
 * @returns {object} 验证结果
 */
function validateConfigJson(configPath) {
  if (!fs.existsSync(configPath)) {
    return { valid: false, error: 'config.json 不存在' };
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(content);
    
    const requiredFields = ['identity', 'model', 'workspace', 'skills'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      return { valid: false, error: `缺少必需字段: ${missingFields.join(', ')}` };
    }
    
    // 验证 identity 字段
    if (!config.identity.name || !config.identity.emoji) {
      return { valid: false, error: 'identity 必须包含 name 和 emoji' };
    }
    
    // 验证 skills 是数组
    if (!Array.isArray(config.skills)) {
      return { valid: false, error: 'skills 必须是数组' };
    }
    
    return { valid: true, error: null, config };
  } catch (error) {
    return { valid: false, error: `JSON 解析错误: ${error.message}` };
  }
}

/**
 * 验证核心文件
 * @param {string} workspaceDir - 工作区目录
 * @returns {object} 验证结果
 */
function validateCoreFiles(workspaceDir) {
  const requiredFiles = [
    'AGENTS.md',
    'SOUL.md',
    'IDENTITY.md',
    'USER.md',
    'MEMORY.md',
    'TOOLS.md'
  ];
  
  const results = {
    valid: true,
    missing: [],
    existing: []
  };
  
  for (const file of requiredFiles) {
    const filePath = path.join(workspaceDir, file);
    if (fs.existsSync(filePath)) {
      results.existing.push(file);
    } else {
      results.missing.push(file);
      results.valid = false;
    }
  }
  
  return results;
}

/**
 * 完整验证 Agent
 * @param {string} agentId - Agent ID
 * @param {string} openclawDir - OpenClaw 目录
 * @returns {object} 完整验证结果
 */
function validateAgent(agentId, openclawDir) {
  const results = {
    agentId,
    valid: true,
    checks: {}
  };
  
  // 1. 验证 Agent ID
  const idValidation = validateAgentId(agentId);
  results.checks.agentId = idValidation;
  if (!idValidation.valid) {
    results.valid = false;
  }
  
  // 2. 检查目录
  const agentDir = path.join(openclawDir, 'agents', agentId);
  const workspaceDir = path.join(openclawDir, `workspace-${agentId}`);
  
  results.checks.directories = {
    agentDir: fs.existsSync(agentDir),
    workspaceDir: fs.existsSync(workspaceDir)
  };
  
  if (!results.checks.directories.agentDir || !results.checks.directories.workspaceDir) {
    results.valid = false;
  }
  
  // 3. 验证 config.json
  const configPath = path.join(agentDir, 'agent', 'config.json');
  const configValidation = validateConfigJson(configPath);
  results.checks.config = configValidation;
  if (!configValidation.valid) {
    results.valid = false;
  }
  
  // 4. 验证核心文件
  const filesValidation = validateCoreFiles(workspaceDir);
  results.checks.coreFiles = filesValidation;
  if (!filesValidation.valid) {
    results.valid = false;
  }
  
  return results;
}

module.exports = {
  validateAgentId,
  validateConfigJson,
  validateCoreFiles,
  validateAgent
};
