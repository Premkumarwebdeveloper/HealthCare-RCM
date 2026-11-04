CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  full_name     VARCHAR(100) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'biller' CHECK (role IN ('admin', 'biller')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payers (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE providers (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  npi  CHAR(10) NOT NULL UNIQUE
);

CREATE TABLE patients (
  id         SERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name  VARCHAR(80) NOT NULL,
  dob        DATE NOT NULL,
  member_id  VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE action_codes (
  code  VARCHAR(10) PRIMARY KEY,
  label VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE status_codes (
  code        VARCHAR(10) PRIMARY KEY,
  description VARCHAR(150) NOT NULL
);

CREATE TABLE claims (
  id            SERIAL PRIMARY KEY,
  claim_number  VARCHAR(20) NOT NULL UNIQUE,
  patient_id    INTEGER NOT NULL REFERENCES patients(id),
  payer_id      INTEGER NOT NULL REFERENCES payers(id),
  provider_id   INTEGER NOT NULL REFERENCES providers(id),
  dos           DATE NOT NULL,
  billed_amount NUMERIC(12, 2) NOT NULL CHECK (billed_amount >= 0),
  paid_amount   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status        VARCHAR(20) NOT NULL CHECK (status IN ('Paid', 'Pending', 'Denied', 'In Process')),
  action_code   VARCHAR(10) NOT NULL REFERENCES action_codes(code),
  status_code   VARCHAR(10) NOT NULL REFERENCES status_codes(code),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (paid_amount <= billed_amount)
);

CREATE INDEX idx_claims_dos ON claims (dos);
CREATE INDEX idx_claims_status ON claims (status);
CREATE INDEX idx_claims_payer ON claims (payer_id);
CREATE INDEX idx_claims_provider ON claims (provider_id);
CREATE INDEX idx_claims_patient ON claims (patient_id);
CREATE INDEX idx_claims_updated_at ON claims (updated_at DESC);
CREATE INDEX idx_patients_name ON patients (LOWER(last_name), LOWER(first_name));
