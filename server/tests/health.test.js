require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const app = require('../server');

describe('GET /api/health', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('message');
  });
}); 