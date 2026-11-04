const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/repositories/user.repository');
jest.mock('../src/repositories/claims.repository');
jest.mock('../src/repositories/dashboard.repository');

const userRepository = require('../src/repositories/user.repository');
const claimsRepository = require('../src/repositories/claims.repository');
const dashboardRepository = require('../src/repositories/dashboard.repository');
const app = require('../src/app');

const token = jwt.sign({ sub: 1, role: 'admin', username: 'deepa.k' }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };

describe('POST /api/auth/login', () => {
  let hash;
  beforeAll(async () => {
    hash = await bcrypt.hash('Password@123', 4);
  });
  const user = () => ({ id: 1, username: 'deepa.k', full_name: 'Deepa K', role: 'admin', password_hash: hash });

  it('returns a token for valid credentials', async () => {
    userRepository.findByUsername.mockResolvedValue(user());
    const res = await request(app).post('/api/auth/login').send({ username: 'deepa.k', password: 'Password@123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toMatchObject({ username: 'deepa.k', fullName: 'Deepa K' });
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('rejects a wrong password with 401', async () => {
    userRepository.findByUsername.mockResolvedValue(user());
    const res = await request(app).post('/api/auth/login').send({ username: 'deepa.k', password: 'nope' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown user with 401', async () => {
    userRepository.findByUsername.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ username: 'x', password: 'y' });
    expect(res.status).toBe(401);
  });

  it('validates the body with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('GET /api/claims', () => {
  it('requires authentication', async () => {
    expect((await request(app).get('/api/claims')).status).toBe(401);
  });

  it('rejects invalid query params', async () => {
    const res = await request(app).get('/api/claims?pageSize=7').set(auth);
    expect(res.status).toBe(400);
  });

  it('rejects an inverted DOS range', async () => {
    const res = await request(app).get('/api/claims?dosFrom=2026-09-01&dosTo=2026-08-01').set(auth);
    expect(res.status).toBe(400);
  });

  it('returns paginated data and passes filters to the repository', async () => {
    claimsRepository.list.mockResolvedValue({
      rows: [{ id: 1, claimNumber: 'CLM1' }],
      total: 25,
      statusCounts: { Paid: 10, Pending: 8, Denied: 4, 'In Process': 3 },
    });
    const res = await request(app).get('/api/claims?status=Paid&patientName=john&pageSize=10').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 });
    expect(claimsRepository.list.mock.calls[0][0]).toMatchObject({ status: 'Paid', patientName: 'john' });
  });

  it('returns 404 for a missing claim', async () => {
    claimsRepository.findById.mockResolvedValue(null);
    expect((await request(app).get('/api/claims/999').set(auth)).status).toBe(404);
  });
});

describe('GET /api/claims/export', () => {
  it('returns a CSV attachment', async () => {
    claimsRepository.findAll.mockResolvedValue([
      { claimNumber: 'CLM1', patientName: 'John Miller', dob: '1982-04-12', memberId: 'UHC1', dos: '2026-08-24',
        payer: 'Aetna', billedAmount: 328.02, paidAmount: 0, status: 'Pending', actionCode: 'Allow Time' },
    ]);
    const res = await request(app).get('/api/claims/export?format=csv').set(auth);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('claims.csv');
    expect(res.text).toContain('CLM1,John Miller,04/12/1982');
  });

  it('requires a valid format', async () => {
    expect((await request(app).get('/api/claims/export?format=exe').set(auth)).status).toBe(400);
  });
});

describe('GET /api/dashboard', () => {
  it('computes KPI changes and fills aging buckets', async () => {
    dashboardRepository.kpis.mockResolvedValue({
      cur_total: 110, cur_paid: 80, cur_denied: 10, cur_ar: 5000,
      prev_total: 100, prev_paid: 80, prev_denied: 0, prev_ar: 5000,
    });
    dashboardRepository.statusBreakdown.mockResolvedValue([{ status: 'Paid', count: 80 }]);
    dashboardRepository.arAging.mockResolvedValue([{ bucket: '0-30 Days', amount: 100 }]);
    claimsRepository.findRecent.mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard?days=30').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.kpis.totalClaims.change).toBe(10);
    expect(res.body.kpis.deniedClaims.change).toBeNull();
    expect(res.body.arAging).toHaveLength(4);
    expect(res.body.claimsByStatus.items[0]).toMatchObject({ status: 'Paid', percent: 72.7 });
  });
});
