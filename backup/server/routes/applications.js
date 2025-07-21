const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// Get all applications
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('applications').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get application by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('applications').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// Basic analytics: count, status breakdown
router.get('/analytics/summary', async (req, res) => {
  const { data, error } = await supabase.rpc('applications_summary'); // You can create a Postgres function for this
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
