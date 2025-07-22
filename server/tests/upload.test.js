require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const app = require('../server');

describe('POST /api/upload/excel', () => {
  it('should upload and process a realistic Excel file with multiple rows', async () => {
    const filePath = path.join(__dirname, 'dummy_realistic.xlsx');
    // Generate a realistic Excel file if not present
    if (!fs.existsSync(filePath)) {
      const data = [
        { applicationId: 1, applicantName: 'Alice', status: 'Approved' },
        { applicationId: 2, applicantName: 'Bob', status: 'Pending' },
        { applicationId: 3, applicantName: 'Charlie', status: 'Rejected' },
        { applicationId: 4, applicantName: 'David', status: 'Approved' },
        { applicationId: 5, applicantName: 'Eve', status: 'Pending' }
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Applications');
      XLSX.writeFile(wb, filePath);
    }
    const res = await request(app)
      .post('/api/upload/excel')
      .attach('files', filePath);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });
}); 