/**
 * Agent Creator - 高质量文件生成器
 * 
 * 功能：使用架构师标准的高质量模板生成核心文件
 * 参考：openclaw-core-files-architect v2.0 (XML-First), references/core-files-quality-standards.md
 * 
 * v3.1 更新：
 * - 支持 XML 优先模板
 * - 默认优先使用 XML 结构化模板
 * - 保留 Markdown 基础模板作为兼容方案
 */

const fs = require('fs');
const path = require('path');

// 模板配置
const templateConfig = require('./template-config');

// 模板格式配置
const TEMPLATE_FORMAT = {
  XML_FIRST: 'xml-first',     // XML 优先（默认）
  MARKDOWN: 'markdown'        // Markdown 兼容
};

// 默认使用 XML 优先格式
let defaultFormat = TEMPLATE_FORMAT.XML_FIRST;

/**
 * 渲染模板
 * @param {string} template - 模板内容
 * @param {object} variables - 变量对象
 * @returns {string} 渲染后的内容
 */
function renderTemplate(template, variables) {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  return result;
}

/**
 * 加载模板文件
 * @param {string} templatePath - 模板路径
 * @returns {string} 模板内容
 */
function loadTemplate(templatePath) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`模板文件不存在: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * 获取模板路径
 * @param {string} templateId - 模板 ID（如 personal-assistant）
 * @param {string} filename - 文件名（如 AGENTS.md）
 * @param {string} format - 模板格式（xml-first 或 markdown）
 * @returns {string} 模板完整路径
 */
function getTemplatePath(templateId, filename, format = defaultFormat) {
  const templatesDir = path.join(__dirname, '..', 'templates');
  
  // XML 优先模板路径
  if (format === TEMPLATE_FORMAT.XML_FIRST) {
    // 优先使用 XML 优先通用模板
    const xmlCommonPath = path.join(templatesDir, 'common', `${filename}.xml.template`);
    if (fs.existsSync(xmlCommonPath)) {
      return xmlCommonPath;
    }
    
    // 其次使用模板特定 XML 模板
    const xmlSpecificPath = path.join(templatesDir, templateId, `${filename}.xml.template`);
    if (fs.existsSync(xmlSpecificPath)) {
      return xmlSpecificPath;
    }
  }
  
  // Markdown 模板路径（兼容方案）
  // 优先使用通用高质量模板
  const mdCommonPath = path.join(templatesDir, 'common', `${filename}.template`);
  if (fs.existsSync(mdCommonPath)) {
    return mdCommonPath;
  }
  
  // 其次使用模板特定模板
  const mdSpecificPath = path.join(templatesDir, templateId, `${filename}.template`);
  if (fs.existsSync(mdSpecificPath)) {
    return mdSpecificPath;
  }
  
  // 最后返回 XML 优先路径（即使不存在也返回，让调用者处理错误）
  return format === TEMPLATE_FORMAT.XML_FIRST
    ? path.join(templatesDir, 'common', `${filename}.xml.template`)
    : path.join(templatesDir, 'common', `${filename}.template`);
}

/**
 * 生成核心文件
 * @param {object} agentConfig - Agent 配置
 * @param {string} workspaceDir - 工作区目录
 * @param {string} format - 模板格式（xml-first 或 markdown）
 * @returns {object} 生成结果
 */
function generateCoreFiles(agentConfig, workspaceDir, format = defaultFormat) {
  const results = {
    success: [],
    failed: [],
    warnings: [],
    format: format
  };
  
  // 获取模板变量
  const variables = templateConfig.getTemplateVariables(agentConfig.template, agentConfig);
  
  // 核心文件列表
  const coreFiles = [
    { file: 'AGENTS.md', required: true },
    { file: 'SOUL.md', required: true },
    { file: 'IDENTITY.md', required: false },
    { file: 'USER.md', required: true },
    { file: 'MEMORY.md', required: true },
    { file: 'TOOLS.md', required: true },
    { file: 'HEARTBEAT.md', required: false },
    { file: 'BOOTSTRAP.md', required: false }
  ];
  
  for (const { file, required } of coreFiles) {
    const outputPath = path.join(workspaceDir, file);
    
    try {
      const templatePath = getTemplatePath(agentConfig.template, file, format);
      
      if (!fs.existsSync(templatePath)) {
        if (required) {
          results.failed.push({ file, reason: '模板文件不存在' });
        } else {
          results.warnings.push({ file, reason: '可选文件跳过' });
        }
        continue;
      }
      
      const template = loadTemplate(templatePath);
      const content = renderTemplate(template, variables);
      
      fs.writeFileSync(outputPath, content);
      results.success.push(file);
      
    } catch (error) {
      if (required) {
        results.failed.push({ file, reason: error.message });
      } else {
        results.warnings.push({ file, reason: error.message });
      }
    }
  }
  
  return results;
}

/**
 * 初始化 memory/ 目录
 * @param {string} workspaceDir - 工作区目录
 * @param {object} agentConfig - Agent 配置
 */
function initMemoryDir(workspaceDir, agentConfig) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = `${year}-${month}-${String(now.getDate()).padStart(2, '0')}`;
  
  const memoryDir = path.join(workspaceDir, 'memory');
  const monthDir = path.join(memoryDir, `${year}-${month}`);
  
  // 创建目录
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }
  if (!fs.existsSync(monthDir)) {
    fs.mkdirSync(monthDir, { recursive: true });
  }
  
  // 获取模板变量
  const variables = {
    ...agentConfig,
    CREATION_DATE: date,
    DATE: date,
    MONTH: month,
    DAILY_FILES_LIST: `- [${date}](${date}-完整.md) - Agent 创建`,
    SKILLS_COUNT: agentConfig.skills?.length || 0,
    QUALITY_SCORE: '待验证'
  };
  
  // 生成 memory/INDEX.md
  const indexPath = path.join(memoryDir, 'INDEX.md');
  if (!fs.existsSync(indexPath)) {
    const indexTemplatePath = path.join(__dirname, '..', 'templates', 'common', 'memory', 'INDEX.md.template');
    if (fs.existsSync(indexTemplatePath)) {
      const template = loadTemplate(indexTemplatePath);
      const content = renderTemplate(template, variables);
      fs.writeFileSync(indexPath, content);
    } else {
      // 默认内容
      fs.writeFileSync(indexPath, `# Memory 总索引

## 月度索引列表

- [${year}-${month}](${year}-${month}/INDEX.md)

## 归档目录
- [原始文件归档](archive/raw-backups/)

---

*创建日期：${date}*
`);
    }
  }
  
  // 生成月度 INDEX.md
  const monthIndexPath = path.join(monthDir, 'INDEX.md');
  if (!fs.existsSync(monthIndexPath)) {
    const monthIndexTemplatePath = path.join(__dirname, '..', 'templates', 'common', 'memory', 'YYYY-MM', 'INDEX.md.template');
    if (fs.existsSync(monthIndexTemplatePath)) {
      const template = loadTemplate(monthIndexTemplatePath);
      const content = renderTemplate(template, variables);
      fs.writeFileSync(monthIndexPath, content);
    } else {
      fs.writeFileSync(monthIndexPath, `# ${year}-${month} 月度索引

## 每日文件

- [${date}](${date}-完整.md) - Agent 创建

---

*创建日期：${date}*
`);
    }
  }
  
  // 生成今日完整文件
  const todayPath = path.join(monthDir, `${date}-完整.md`);
  if (!fs.existsSync(todayPath)) {
    const todayTemplatePath = path.join(__dirname, '..', 'templates', 'common', 'memory', 'YYYY-MM', 'YYYY-MM-DD-完整.md.template');
    if (fs.existsSync(todayTemplatePath)) {
      const template = loadTemplate(todayTemplatePath);
      const content = renderTemplate(template, variables);
      fs.writeFileSync(todayPath, content);
    } else {
      fs.writeFileSync(todayPath, `# ${date} Durable Memory

## 工作记录

### Agent 创建

- **Agent 名称**：${agentConfig.name}
- **Agent ID**：${agentConfig.id}
- **模板**：${agentConfig.template}
- **模型**：${agentConfig.model}

---

*创建日期：${date}*
`);
    }
  }
  
  return true;
}

/**
 * 生成 config.json
 * @param {object} agentConfig - Agent 配置
 * @returns {string} JSON 字符串
 */
function generateConfigJson(agentConfig) {
  const config = {
    identity: {
      name: agentConfig.name,
      emoji: agentConfig.emoji,
      theme: 'default'
    },
    model: agentConfig.model,
    workspace: agentConfig.workspace,
    skills: agentConfig.skills
  };
  
  return JSON.stringify(config, null, 2);
}

/**
 * 执行质量验证
 * @param {string} workspaceDir - 工作区目录
 * @returns {object} 验证结果
 */
function validateQuality(workspaceDir) {
  const validateScript = path.join(__dirname, 'validate-core-files.js');
  
  if (!fs.existsSync(validateScript)) {
    return { status: 'skipped', reason: '验证脚本不存在' };
  }
  
  try {
    const { execSync } = require('child_process');
    const output = execSync(`node "${validateScript}" "${workspaceDir}"`, {
      encoding: 'utf8',
      cwd: path.dirname(validateScript)
    });
    
    // 解析输出获取得分
    const scoreMatch = output.match(/平均得分:\s*([\d.]+)\/10/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    
    return {
      status: score >= 7 ? 'pass' : 'fail',
      score,
      output
    };
  } catch (error) {
    // 即使验证失败也返回输出
    return {
      status: 'fail',
      score: 0,
      output: error.stdout || error.message
    };
  }
}

module.exports = {
  renderTemplate,
  loadTemplate,
  getTemplatePath,
  generateCoreFiles,
  initMemoryDir,
  generateConfigJson,
  validateQuality,
  TEMPLATE_FORMAT,
  setDefaultFormat: (format) => { defaultFormat = format; },
  getDefaultFormat: () => defaultFormat
};
