export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    version: '2.0.0-deepseek-only',
    timestamp: new Date().toISOString(),
    hasDeepseekKey: !!context.env.DEEPSEEK_API_KEY,
    hasSupabase: !!(context.env.SUPABASE_URL && context.env.SUPABASE_ANON_KEY)
  }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
