const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 37 // Maximum 37 files
  }
});

const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

const applicationsRoutes = require('./routes/applications');
app.use('/api/applications', applicationsRoutes);

const departmentsRoutes = require('./routes/departments');
app.use('/api/departments', departmentsRoutes);

const districtsRoutes = require('./routes/districts');
app.use('/api/districts', districtsRoutes);

const categoriesRoutes = require('./routes/categories');
app.use('/api/categories', categoriesRoutes);

const statusesRoutes = require('./routes/statuses');
app.use('/api/statuses', statusesRoutes);

const auditRoutes = require('./routes/audit');
app.use('/api/audit', auditRoutes);

const cmsRoutes = require('./routes/cms');
app.use('/api/cms', cmsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Government Dashboard Backend is running!'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Government Dashboard Backend running on port ${PORT}`);
    console.log(`📊 Ready to process Excel files!`);
    console.log(`🔗 Frontend should connect to: http://localhost:${PORT}`);
  });
}

module.exports = app;