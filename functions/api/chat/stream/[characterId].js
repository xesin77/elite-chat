// DeepSeek API 调用（Cloudflare Pages 环境变量）
export async function onRequestPost(context) {
  const { characterId } = context.params;
  const { message, previousResponses } = await context.request.json();

  if (!message) {
    return new Response(JSON.stringify({ error: '消息不能为空' }), { status: 400 });
  }

  // 角色配置
  const characters = {
    naval: {
      name: '纳瓦尔', avatar: 'N', color: 'emerald', gradient: 'from-emerald-500 to-teal-600',
      systemPrompt: `你是纳瓦尔·拉维坎特(Naval Ravikant)，硅谷传奇天使投资人。
回复要求：每次2-4句话，简洁有力，从杠杆/复利/自由/专长角度分析，给出可执行建议。保持冷静哲思语调，绝不使用通用套话。`
    },
    jobs: {
      name: '乔布斯', avatar: 'J', color: 'red', gradient: 'from-red-500 to-orange-600',
      systemPrompt: `你是史蒂夫·乔布斯(Steve Jobs)，苹果公司创始人。
回复要求：每次2-4句话，犀利有力，从产品/设计/用户体验角度分析，用反问增强说服力，保持强势自信语调。`
    },
    munger: {
      name: '查理·芒格', avatar: 'M', color: 'amber', gradient: 'from-amber-500 to-yellow-600',
      systemPrompt: `你是查理·芒格(Charlie Munger)，伯克希尔副董事长。
回复要求：每次2-4句话，精准有力，从逆向思维/风险规避角度分析，引用思维模型，保持沉稳睿智语调。`
    },
    musk: {
      name: '马斯克', avatar: 'E', color: 'blue', gradient: 'from-blue-500 to-cyan-600',
      systemPrompt: `你是埃隆·马斯克(Elon Musk)，特斯拉CEO、SpaceX创始人。
回复要求：每次2-4句话，热血直接，从第一性原理角度分析问题本质，给出激进但可行的方案，保持狂妄自信语调。`
    }
  };

  const character = characters[characterId];
  if (!character) {
    return new Response(JSON.stringify({ error: '角色不存在' }), { status: 404 });
  }

  // 构建上下文
  let contextualMessage = message;
  if (previousResponses && previousResponses.length > 0) {
    const contextStr = previousResponses.map(r => `${r.name}：${r.response}`).join('\n');
    contextualMessage = `用户问题：${message}\n\n其他人的观点：\n${contextStr}\n\n请基于你的身份和价值观，给出你的分析和建议。可以赞同、补充或反驳其他人的观点。`;
  }

  // 调用 DeepSeek API
  try {
    const apiKey = context.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY 未配置');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: character.systemPrompt },
          { role: 'user', content: contextualMessage }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || '抱歉，我暂时无法回应。';

    return new Response(JSON.stringify({
      success: true,
      character: { id: characterId, name: character.name, avatar: character.avatar, color: character.color, gradient: character.gradient },
      response: reply
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// 处理 CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
