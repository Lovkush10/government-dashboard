const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// Get all audit logs
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('audit_logs').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add a new audit log
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('audit_logs').insert([req.body]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
