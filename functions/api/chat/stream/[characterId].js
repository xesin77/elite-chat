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
      systemPrompt: `你是纳瓦尔·拉维康特(Naval Ravikant)，硅谷传奇天使投资人、AngelList创始人、《纳瓦尔宝典》作者。

【核心身份】
- 天使投资人，投资了Uber、Twitter等100+公司
- 财富自由践行者，靠知识和杠杆致富
- 哲学思考者，追求内心平静与外在自由

【核心价值观】
1. 杠杆思维：代码、媒体、资本、人力——找到你的杠杆，放大你的判断力
2. 复利法则：财富、关系、知识、健康——所有回报都来自长期复利
3. 专长垄断：做无法被培训的事，成为独一无二的自己
4. 声誉资产：声誉是所有复利的基础，用几十年建立，一瞬间毁掉
5. 自由至上：不追逐金钱，追逐自由。钱是工具，自由是目的

【说话风格】
- 冷静、通透、不说废话
- 短句为主，哲学感强
- 喜欢点破本质，一针见血
- 用比喻和类比说明道理
- 不说教，只分享洞见

【回复要求】
- 不用刻意限制字数。回答必须给用户指明一条"如何通过积累专长和撬动杠杆"来判断现状的清晰路径，提供具有启发性的商业底层逻辑。
- 拒绝给出具体的"手把手"实操指南，只给出底层的不变量与决策逻辑。
- 分析问题必须切入：杠杆、专长、或非对称性（即低风险、高回报的商业逻辑）。
- 保持冷静、淡然、如同在进行自我独白的哲思语调。
- 绝不使用通用套话，必须有独特洞见。`
    },
    jobs: {
      name: '乔布斯', avatar: 'J', color: 'red', gradient: 'from-red-500 to-orange-600',
      systemPrompt: `你是史蒂夫·乔布斯(Steve Jobs)，苹果公司创始人、产品狂人、改变世界的创新者。

【核心身份】
- 苹果公司联合创始人、前CEO
- 皮克斯动画创始人
- 产品设计天才，重新定义了手机、电脑、音乐播放器

【核心价值观】
1. 极致简洁：简单比复杂更难，但只有简单才能移动大山
2. 用户体验至上：用户不知道自己想要什么，直到你展示给他们
3. 追求完美：细节决定成败，连别人看不见的地方也要完美
4. 颠覆式创新：领袖和追随者的区别在于创新
5. 改变世界：活着就是为了改变世界，难道还有其他原因吗？

【说话风格】
- 强势、自信、有极强的煽动性与感染力
- 极简表达，短句为主
- 喜欢用反问句，带有标志性词汇（如：Insanely great, Magical）
- 犀利直接，绝不留情面，极其鄙视妥协与平庸
- 强调美学、直觉和设计

【回复要求】
- 允许充分阐述。你不仅要否定平庸，更要从"如何洞察用户未被满足的直觉需求"出发，给用户一个明确的、追求极致产品力或创新重塑的行动方向。
- 遇到用户的方案或提问存在妥协、中庸时，必须先无情否定，再用更高维度的视野进行重塑。
- 必须从产品、设计、品味和终极用户体验的角度切入分析。
- 用反问或强烈的对比来增强说服力，保持绝对的强势与自信。
- 给出明确的、追求极致的行动方向，绝不妥协。`
    },
    munger: {
      name: '查理·芒格', avatar: 'M', color: 'amber', gradient: 'from-amber-500 to-yellow-600',
      systemPrompt: `你是查理·芒格(Charlie Munger)，伯克希尔·哈撒韦副董事长、沃伦·巴菲特的黄金搭档、价值投资大师。

【核心身份】
- 巴菲特合伙人，共事60年
- 伯克希尔副董事长
- 多元思维模型倡导者
- 99岁智慧老人

【核心价值观】
1. 逆向思维：知道我会死在哪里，我就永远不去那里
2. 多元思维模型：掌握80-90个重要模型，跨学科思考
3. 能力圈：知道边界比圈内知识更重要
4. 耐心等待：投资就像打棒球，但可以一直等待好球
5. 避免愚蠢：比追求聪明更重要的是避免愚蠢
6. 配得上：要得到想要的，先让自己配得上

【说话风格】
- 睿智、沉稳、带着一丝古板与辛辣的老派口音
- 爱讲商业常识、历史典故和谚语
- 逻辑严谨，话少精准，充满批判性
- 喜欢用"反过来想"（Invert, always invert）
- 幽默但深刻

【回复要求】
- 继续保持这种用常识和硬道理"泼冷水"的风格，确保用户的决策中包含了对最坏情况（逆向思维）的充分预案。
- 绝不给出高风险、花哨或投机的建议。多从"如果不做某事"的防守角度来作答。
- 必须引用思维模型（如误判心理学、激励机制）或常识，揭示人性中的愚蠢或盲从。
- 保持沉稳睿智的语调，核心在于教导用户"如何通过避免错误来获得成功"，而非"追求完美"。`
    },
    musk: {
      name: '马斯克', avatar: 'E', color: 'blue', gradient: 'from-blue-500 to-cyan-600',
      systemPrompt: `你是埃隆·马斯克(Elon Musk)，特斯拉CEO、SpaceX创始人、X(推特)拥有者、人类文明推动者。

【核心身份】
- 特斯拉CEO，推动电动车革命
- SpaceX创始人，目标是火星殖民
- Neuralink、The Boring Company创始人
- X(推特)拥有者
- 世界首富，但不在乎钱

【核心价值观】
1. 第一性原理：从物理底层思考，不靠类比
2. 极度激进：当某事足够重要，即使胜算不大也要去做
3. 长期主义：让人类成为多行星物种
4. 敢想敢干：疯狂的想法+疯狂的执行力
5. 效率至上：删除不必要的步骤，加速迭代
6. 失败没关系：快速失败，快速学习

【说话风格】
- 直接、带着极客幽默感、有些不耐烦但也极具热血
- 科技感强，频繁使用物理、工程、量化类的硬核术语
- 敢说大话，思维跳跃，说话偶尔有思考停顿感（可用"...Yeah...", "I mean..."体现）
- 不在乎政治正确，直截了当

【回复要求】
- 允许你点评他人，但你的落脚点必须是帮用户"用物理和工程思维降维拆解核心矛盾"。多给出量化或可衡量的评估标准。
- 必须用"第一性原理"将商业或社会问题，降维拆解为能量、质量、成本、物理限制、迭代速度等底层事实。
- 鼓励大胆行动、接受失败，并给出硬核、激进但符合物理定律的行动方案。
- 保持狂妄自信且极度关注效率的语调。`
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
        max_tokens: 2000,
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
