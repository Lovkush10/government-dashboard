const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// Get all CMS content
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('cms_content').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add or update CMS content
router.post('/', async (req, res) => {
  const { key, value } = req.body;
  const { data, error } = await supabase.from('cms_content').upsert([{ key, value }], { onConflict: ['key'] });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
