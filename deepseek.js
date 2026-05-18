/**
 * DeepSeek API 调用模块
 * 强制使用 DeepSeek 大模型，不降级到模拟模式
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

/**
 * 调用DeepSeek API获取角色回复
 * @param {string} systemPrompt - 角色的系统提示词
 * @param {string} userMessage - 用户消息
 * @param {string} characterId - 角色ID
 * @param {Array} previousResponses - 之前角色的回复
 * @returns {Promise<string>} - AI回复内容
 */
async function getCharacterResponse(systemPrompt, userMessage, characterId = null, previousResponses = []) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未配置');
  }

  // 构建消息数组
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  console.log(`[DeepSeek] 正在为 ${characterId} 调用API...`);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 500,
      temperature: 0.8,
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = `DeepSeek API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`;
    console.error(`[DeepSeek] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const reply = data.choices[0]?.message?.content || '抱歉，我暂时无法回应。';
  
  console.log(`[DeepSeek] ${characterId} 回复成功: ${reply.substring(0, 50)}...`);
  return reply;
}

/**
 * 批量获取多个角色的回复
 */
async function getAllCharacterResponses(characters, userMessage, previousResponses = []) {
  const results = [];
  const localPreviousResponses = [];
  
  for (const char of characters) {
    let contextualMessage = userMessage;
    if (localPreviousResponses.length > 0) {
      const contextStr = localPreviousResponses.map(r => `${r.name}：${r.response}`).join('\n');
      contextualMessage = `用户问题：${userMessage}\n\n其他人的观点：\n${contextStr}\n\n请基于你的身份和价值观，给出你的分析和建议。可以赞同、补充或反驳其他人的观点。`;
    }
    
    try {
      const response = await getCharacterResponse(
        char.systemPrompt,
        contextualMessage,
        char.id,
        localPreviousResponses
      );
      
      results.push({ id: char.id, name: char.name, response });
      localPreviousResponses.push({ name: char.name, response });
      
    } catch (error) {
      console.error(`[DeepSeek] ${char.id} 调用失败:`, error.message);
      results.push({
        id: char.id,
        name: char.name,
        response: `抱歉，DeepSeek调用失败: ${error.message}`
      });
    }
  }
  
  return results;
}

module.exports = {
  getCharacterResponse,
  getAllCharacterResponses
};
