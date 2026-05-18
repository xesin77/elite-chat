/**
 * 精英群聊系统 - 后端服务器
 * 集成DeepSeek大模型 + Supabase多端同步
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const characterPrompts = require('./characters');
const { getCharacterResponse, getAllCharacterResponses } = require('./deepseek');
const { 
  saveMessage, 
  getMessages, 
  clearMessages, 
  subscribeToMessages,
  checkConnection 
} = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_VERSION = '2.0.0-deepseek-only';

// 中间件
app.use(cors());
app.use(express.json());

// 防缓存：静态文件加 no-cache 头
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// 角色顺序
const characterOrder = ['naval', 'jobs', 'munger', 'musk'];

/**
 * API: 获取会话历史消息
 * GET /api/messages/:sessionId
 */
app.get('/api/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await getMessages(sessionId);
    
    if (result.success) {
      res.json({ success: true, messages: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('获取消息API错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API: 保存消息
 * POST /api/messages
 */
app.post('/api/messages', async (req, res) => {
  try {
    const { session_id, is_user, character_id, text } = req.body;
    
    if (!session_id || !text) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    const result = await saveMessage({
      session_id,
      is_user: is_user || false,
      character_id,
      text
    });
    
    if (result.success) {
      res.json({ success: true, data: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('保存消息API错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API: 清空会话消息
 * DELETE /api/messages/:sessionId
 */
app.delete('/api/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await clearMessages(sessionId);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('清空消息API错误:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * API: 获取单个角色的回复
 * POST /api/chat/:characterId
 */
app.post('/api/chat/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { message, history, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }
    
    const character = characterPrompts[characterId];
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }
    
    const response = await getCharacterResponse(
      character.systemPrompt,
      message,
      characterId,
      history || []
    );
    
    // 保存AI回复到数据库
    if (session_id) {
      await saveMessage({
        session_id,
        is_user: false,
        character_id: characterId,
        text: response
      });
    }
    
    res.json({
      success: true,
      character: {
        id: characterId,
        name: character.name,
        avatar: character.avatar,
        color: character.color,
        gradient: character.gradient
      },
      response: response
    });
    
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: error.message 
    });
  }
});

/**
 * API: 流式获取角色回复（用于实时显示）
 * POST /api/chat/stream/:characterId
 */
app.post('/api/chat/stream/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { message, previousResponses, session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }
    
    const character = characterPrompts[characterId];
    if (!character) {
      return res.status(404).json({ error: '角色不存在' });
    }
    
    // 构建上下文消息
    let contextualMessage = message;
    if (previousResponses && previousResponses.length > 0) {
      const contextStr = previousResponses.map(r => `${r.name}：${r.response}`).join('\n');
      contextualMessage = `用户问题：${message}\n\n其他人的观点：\n${contextStr}\n\n请基于你的身份和价值观，给出你的分析和建议。可以赞同、补充或反驳其他人的观点。`;
    }
    
    const response = await getCharacterResponse(
      character.systemPrompt,
      contextualMessage,
      characterId,
      previousResponses || []
    );
    
    // 保存AI回复到数据库
    if (session_id) {
      await saveMessage({
        session_id,
        is_user: false,
        character_id: characterId,
        text: response
      });
    }
    
    // 返回JSON响应
    res.json({
      success: true,
      character: {
        id: characterId,
        name: character.name,
        avatar: character.avatar,
        color: character.color,
        gradient: character.gradient
      },
      response: response
    });
    
  } catch (error) {
    console.error('流式API错误:', error);
    res.status(500).json({ 
      error: '服务器错误', 
      message: error.message 
    });
  }
});

/**
 * API: 获取角色列表
 * GET /api/characters
 */
app.get('/api/characters', (req, res) => {
  const characters = characterOrder.map(id => ({
    id,
    name: characterPrompts[id].name,
    avatar: characterPrompts[id].avatar,
    color: characterPrompts[id].color,
    gradient: characterPrompts[id].gradient
  }));
  
  res.json({ characters });
});

/**
 * 健康检查
 * GET /api/health
 */
app.get('/api/health', async (req, res) => {
  const hasDeepseekKey = !!process.env.DEEPSEEK_API_KEY;
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  
  let supabaseConnected = false;
  if (hasSupabase) {
    supabaseConnected = await checkConnection();
  }
  
  res.json({ 
    status: 'ok', 
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    hasDeepseekKey,
    hasSupabase,
    supabaseConnected
  });
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     🚀 精英群聊系统已启动                    ║
╠════════════════════════════════════════════╣
║  本地地址: http://localhost:${PORT}            ║
║  DeepSeek: ${process.env.DEEPSEEK_API_KEY ? '✅ 已配置' : '❌ 未配置'}        ║
║  Supabase: ${process.env.SUPABASE_URL ? '✅ 已配置' : '❌ 未配置'}        ║
╚════════════════════════════════════════════╝

使用说明:
1. 确保 Supabase 数据库表已创建
2. 刷新页面开始使用
3. 多端同步已启用

API端点:
- GET  /api/messages/:sessionId  - 获取历史消息
- POST /api/messages             - 保存消息
- DELETE /api/messages/:sessionId - 清空消息
- POST /api/chat/:characterId    - 单角色对话
  `);
});
