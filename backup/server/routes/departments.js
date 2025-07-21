const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('departments').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get department by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('departments').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

module.exports = router;
