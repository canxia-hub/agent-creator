@echo off
echo Agent Creator - OpenClaw Agent 创建向导
echo.
if "%~1"=="" (
  echo 用法: agent-creator [命令] [参数]
  echo.
  echo 命令:
  echo   create              交互式创建新 Agent
  echo   validate [agent-id] 验证 Agent 配置
  echo   install-skills [agent-id] 安装必备技能
  echo   feishu-setup [agent-id]   配置飞书应用
  echo   routing-setup [agents]    配置多 Agent 路由
  echo   register [agent-id]       注册 Agent
  echo.
  echo 示例:
  echo   agent-creator create
  echo   agent-creator validate my-bot
  echo   agent-creator feishu-setup my-bot
  exit /b 1
)

set SCRIPT_DIR=%~dp0scripts

if "%~1"=="create" (
  node "%SCRIPT_DIR%\create.js"
) else if "%~1"=="validate" (
  node "%SCRIPT_DIR%\validate.js" %2
) else if "%~1"=="install-skills" (
  node "%SCRIPT_DIR%\install-skills.js" %2
) else if "%~1"=="feishu-setup" (
  node "%SCRIPT_DIR%\feishu-setup.js" %2
) else if "%~1"=="routing-setup" (
  node "%SCRIPT_DIR%\routing-setup.js" %2
) else if "%~1"=="register" (
  node "%SCRIPT_DIR%\register.js" %2
) else if "%~1"=="list" (
  node "%SCRIPT_DIR%\list.js" %2 %3
) else (
  echo 未知命令: %~1
  exit /b 1
)

