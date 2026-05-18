/**
 * Supabase 数据库模块
 * 实现消息存储、查询和实时订阅
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 配置缺失，请在 .env 文件中设置 SUPABASE_URL 和 SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 保存消息到 Supabase
 * @param {Object} messageData - 消息数据
 * @returns {Promise<Object>} - 保存结果
 */
async function saveMessage(messageData) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        session_id: messageData.session_id,
        is_user: messageData.is_user,
        character_id: messageData.character_id || null,
        text: messageData.text,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('保存消息失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取会话的历史消息
 * @param {string} sessionId - 会话ID
 * @param {number} limit - 限制数量（默认100）
 * @returns {Promise<Array>} - 消息列表
 */
async function getMessages(sessionId, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('获取消息失败:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * 清空会话消息
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} - 删除结果
 */
async function clearMessages(sessionId) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('清空消息失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 订阅消息实时更新
 * @param {string} sessionId - 会话ID
 * @param {Function} callback - 回调函数
 * @returns {Object} - 订阅对象
 */
function subscribeToMessages(sessionId, callback) {
  const subscription = supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * 生成唯一会话ID
 * @returns {string} - 会话ID
 */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 检查 Supabase 连接
 * @returns {Promise<boolean>}
 */
async function checkConnection() {
  try {
    const { data, error } = await supabase.from('messages').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase 连接检查失败:', error);
    return false;
  }
}

module.exports = {
  supabase,
  saveMessage,
  getMessages,
  clearMessages,
  subscribeToMessages,
  generateSessionId,
  checkConnection
};
