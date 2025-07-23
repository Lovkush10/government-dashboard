import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('cms_content').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const { key, value } = req.body;
    const { data, error } = await supabase.from('cms_content').upsert([{ key, value }], { onConflict: ['key'] });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
  res.status(405).json({ error: 'Method not allowed' });
} 