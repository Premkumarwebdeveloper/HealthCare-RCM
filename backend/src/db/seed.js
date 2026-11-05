const bcrypt = require('bcryptjs');
const { pool, withTransaction } = require('../config/db');

const PAYERS = [
  ['UnitedHealthcare', 'UHC'],
  ['Anthem BCBS', 'ANT'],
  ['Cigna', 'CIG'],
  ['Aetna', 'AET'],
  ['Humana', 'HUM'],
];
const ACTION_CODES = [
  ['RTS', 'Ready to Submit'],
  ['NFA', 'No Further Action'],
  ['FUR', 'Follow up Required'],
  ['MRR', 'Medical Records Required'],
  ['NRB', 'Need to Rebill'],
  ['CA', 'Coding Assistance'],
  ['AT', 'Allow Time'],
  ['VB', 'Verify Benefits'],
];
const STATUS_CODES = [
  ['A1', 'Acknowledged by payer'],
  ['A2', 'In adjudication'],
  ['F1', 'Finalized - paid'],
  ['D1', 'Finalized - denied'],
  ['P1', 'Pending - additional information requested'],
];
const STATUS_RULES = {
  Paid: { weight: 0.55, actions: ['RTS', 'NFA'], codes: ['F1'] },
  Pending: { weight: 0.25, actions: ['FUR', 'MRR'], codes: ['A1', 'P1'] },
  Denied: { weight: 0.1, actions: ['NRB', 'CA'], codes: ['D1'] },
  'In Process': { weight: 0.1, actions: ['AT', 'VB'], codes: ['A2'] },
};
const FIRST = ['John', 'Sarah', 'Robert', 'Emily', 'Michael', 'Laura', 'David', 'Sophia', 'James', 'Olivia'];
const LAST = ['Miller', 'Johnson', 'Williams', 'Davis', 'Brown', 'Wilson', 'Thompson', 'Martinez', 'Anderson', 'Clark'];
const PROVIDERS = [
  ['Riverside Family Medicine', '1234567893'],
  ['Lakeview Orthopedics', '1427384956'],
  ['Summit Cardiology Group', '1598473620'],
];

// Deterministic PRNG so seed data is reproducible.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const isoDate = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

function pickStatus() {
  let r = rand();
  for (const [status, rule] of Object.entries(STATUS_RULES)) {
    if ((r -= rule.weight) <= 0) return status;
  }
  return 'Paid';
}

async function seed() {
  const passwordHash = await bcrypt.hash('Password@123', 10);
  await withTransaction(async (c) => {
    await c.query(
      `INSERT INTO users (username, full_name, password_hash, role) VALUES
       ('deepa.k', 'Deepa K', $1, 'admin'), ('biller.demo', 'Billing Demo', $1, 'biller')
       ON CONFLICT (username) DO UPDATE SET
         full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [passwordHash],
    );
    for (const [code, label] of ACTION_CODES)
      await c.query(
        `INSERT INTO action_codes (code, label) VALUES ($1, $2)
         ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label`,
        [code, label],
      );
    for (const [code, desc] of STATUS_CODES)
      await c.query(
        `INSERT INTO status_codes (code, description) VALUES ($1, $2)
         ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description`,
        [code, desc],
      );
    const providerIds = [];
    for (const [name, npi] of PROVIDERS) {
      const r = await c.query(
        `INSERT INTO providers (name, npi) VALUES ($1, $2)
         ON CONFLICT (npi) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name, npi],
      );
      providerIds.push(r.rows[0].id);
    }
    const payerIds = [];
    for (const [name] of PAYERS) {
      const r = await c.query(
        `INSERT INTO payers (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [name],
      );
      payerIds.push(r.rows[0].id);
    }

    const patients = [];
    for (let i = 0; i < 40; i++) {
      const payerIdx = i % PAYERS.length;
      const memberId = `${PAYERS[payerIdx][1]}${String(10000000 + i * 7919).slice(0, 8)}`;
      const dob = `${int(1950, 2000)}-${String(int(1, 12)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`;
      const r = await c.query(
        `INSERT INTO patients (first_name, last_name, dob, member_id) VALUES ($1,$2,$3,$4)
         ON CONFLICT (member_id) DO UPDATE SET
           first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, dob = EXCLUDED.dob
         RETURNING id`,
        [FIRST[i % FIRST.length], LAST[(i * 3 + Math.floor(i / 10)) % LAST.length], dob, memberId],
      );
      patients.push({ id: r.rows[0].id, payerId: payerIds[payerIdx] });
    }

    for (let i = 0; i < 150; i++) {
      const status = pickStatus();
      const rule = STATUS_RULES[status];
      const patient = pick(patients);
      const billed = (int(15000, 90000) / 100).toFixed(2);
      const dosAge = int(5, 130);
      const updatedAge = Math.min(dosAge, int(0, 58));
      await c.query(
        `INSERT INTO claims (claim_number, patient_id, payer_id, provider_id, dos, billed_amount,
           paid_amount, status, action_code, status_code, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (claim_number) DO UPDATE SET
           patient_id = EXCLUDED.patient_id, payer_id = EXCLUDED.payer_id,
           provider_id = EXCLUDED.provider_id, dos = EXCLUDED.dos,
           billed_amount = EXCLUDED.billed_amount, paid_amount = EXCLUDED.paid_amount,
           status = EXCLUDED.status, action_code = EXCLUDED.action_code,
           status_code = EXCLUDED.status_code, updated_at = EXCLUDED.updated_at`,
        [
          `CLM${1004000 + i}`,
          patient.id,
          patient.payerId,
          pick(providerIds),
          isoDate(daysAgo(dosAge)),
          billed,
          status === 'Paid' ? billed : 0,
          status,
          pick(rule.actions),
          pick(rule.codes),
          daysAgo(updatedAge).toISOString(),
        ],
      );
    }
  });
  console.info('Seed complete. Login: deepa.k / Password@123');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
