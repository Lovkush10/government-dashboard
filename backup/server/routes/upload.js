// temp-app/server/routes/upload.js
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const supabase = require('../supabaseClient');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Upload and process Excel files
router.post('/excel', upload.array('files', 37), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    for (const file of files) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      workbook.SheetNames.forEach(async (sheetName) => {
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        for (const row of jsonData) {
          // Insert into applications table (customize as needed for other tables)
          await supabase.from('applications').insert([row]);
        }
      });
    }

    res.json({ success: true, message: 'Files processed and data uploaded.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;