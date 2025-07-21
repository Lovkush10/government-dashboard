require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Import the main Express app
const app = require('../server');

describe('POST /api/upload/excel', () => {
  it('should upload and process Excel files successfully', async () => {
    const filePath = path.join(__dirname, 'sample.xlsx');
    // Ensure the sample file exists
    if (!fs.existsSync(filePath)) {
      // Create a minimal Excel file if not present
      fs.writeFileSync(filePath, Buffer.from('UEsDBBQABgAIAAAAIQAAAAAAAAAAAAAAAAAJAAAAdGVzdC50eHRVVAkAAxwQZ2McEGd1eAsAAQT1AQAABBQAAABQSwUGAAAAAAEAAQBOAAAAUQAAAAAA', 'base64'));
    }
    const res = await request(app)
      .post('/api/upload/excel')
      .attach('files', filePath);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });
}); 