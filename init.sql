-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop role if it exists
DROP ROLE IF EXISTS app_user;

-- Create role
CREATE ROLE app_user WITH LOGIN PASSWORD 'password';

-- Define types
CREATE TYPE activity AS ENUM ('login', 'logout', 'create', 'update', 'delete');
ALTER TYPE activity OWNER TO app_user;

CREATE TYPE role AS ENUM ('user', 'superuser');
ALTER TYPE role OWNER TO app_user;

-- Create table
CREATE TABLE users
(
    id              UUID DEFAULT uuid_generate_v4() NOT NULL unique,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(100),
    phone_number    VARCHAR(100) NOT NULL UNIQUE,
    role            role      DEFAULT 'user'::role,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_picture BYTEA,
    balance         DOUBLE PRECISION DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (email, id)
);

-- Grant permissions
GRANT INSERT, SELECT, UPDATE ON users TO app_user;

-- Insert admin user
INSERT INTO users (id, first_name, last_name, email, password, phone_number, role, created_at, profile_picture, balance, is_active) VALUES
(uuid_generate_v4(), 'admin', 'admin', 'admin@bpi.com', '$2b$10$Ow.zY1am7ACanZ6xyhdWVeTESdIpWSL2deoG224vqzPg5ITkC2lqy', '09176108252', 'superuser', NOW(), NULL, 0, TRUE);

-- Define and create types and tables
DROP TYPE IF EXISTS transaction_type;
CREATE TYPE transaction_type AS ENUM ('W', 'D', 'T');

DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    accountNumber UUID,
    amount DOUBLE PRECISION NOT NULL,
    type transaction_type NOT NULL,
    date TIMESTAMP NOT NULL
);

DROP TABLE IF EXISTS deposits;
CREATE TABLE deposits (
    id UUID DEFAULT uuid_generate_v4(),
    accountNumber UUID,
    amountDeposited DOUBLE PRECISION NOT NULL,
    chequeNum NUMERIC NOT NULL,
    date TIMESTAMP NOT NULL,

    PRIMARY KEY (id, accountNumber, date),

    FOREIGN KEY (accountNumber) REFERENCES users(id)
);

DROP TABLE IF EXISTS withdraw;
CREATE TABLE withdraw (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    accountNumber UUID,
    amountWithdrawn DOUBLE PRECISION NOT NULL,
    date TIMESTAMP NOT NULL,
    FOREIGN KEY (accountNumber) REFERENCES users(id)
);

DROP TABLE IF EXISTS transfers;
CREATE TABLE transfers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    accountNumber UUID,
    transferredTo UUID,
    amount DOUBLE PRECISION NOT NULL,
    date TIMESTAMP NOT NULL,

    FOREIGN KEY (accountNumber) REFERENCES users(id),
    FOREIGN KEY (transferredTo) REFERENCES users(id)
);

DROP TABLE IF EXISTS cheques;
CREATE TABLE cheques (
    chequeNum NUMERIC NOT NULL PRIMARY KEY,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Procedures
DROP PROCEDURE IF EXISTS createDeposit;
CREATE PROCEDURE createDeposit (IN P_accountNumber VARCHAR(100), IN chequeNumNew NUMERIC, IN amount_check NUMERIC, IN P_date DATE)
LANGUAGE plpgsql
AS $$
DECLARE
    userId UUID;
    P_amount DOUBLE PRECISION;
BEGIN
    -- Validate P_AccountNumber
    IF (SELECT is_active FROM users WHERE email = P_accountNumber) = FALSE THEN
        RAISE EXCEPTION 'User account is deactivated';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = P_accountNumber) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    END IF;

    -- Validate cheque number
    IF NOT EXISTS (SELECT 1 FROM cheques WHERE chequeNum = chequeNumNew AND used = FALSE) THEN
        RAISE EXCEPTION 'Cheque number % not found or has already been used', chequeNumNew;
    END IF;

    -- Get the id number
    SELECT id FROM users WHERE email = P_accountNumber INTO userId;

    -- Retrieve amount
    SELECT amount INTO P_amount
    FROM cheques
    WHERE chequeNum = chequeNumNew;

    IF amount_check != P_amount THEN
        RAISE EXCEPTION 'Amount in cheque does not match the amount in the cheque table';
    END IF;

    -- Create transaction record
    INSERT INTO transactions (accountNumber, amount, type, date) VALUES (userId, P_amount, 'D', NOW());

    -- Create deposit record
    INSERT INTO deposits (accountNumber, amountDeposited, chequeNum, date) VALUES (userId, P_amount, chequeNumNew, P_date);

    -- Update balance
    UPDATE users SET balance = balance + P_amount WHERE email = P_accountNumber;

    -- Update cheque record
    UPDATE cheques SET used = TRUE WHERE chequeNum = chequeNumNew;
END; $$;

DROP PROCEDURE IF EXISTS createWithdraw;
CREATE PROCEDURE createWithdraw (IN P_accountNumber VARCHAR(100), IN P_amount DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
DECLARE
    userId UUID;
BEGIN
    -- Validate P_AccountNumber
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = P_accountNumber) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    END IF;

    -- Validate amount
    IF P_amount <= 0 THEN
        RAISE EXCEPTION 'Amount cannot be negative';
    END IF;

    -- Validate balance
    IF (SELECT balance FROM users WHERE email = P_accountNumber) < P_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Get the id number
    SELECT id FROM users WHERE email = P_accountNumber INTO userId;

    -- Create transaction record
    INSERT INTO transactions (accountNumber, amount, type, date) VALUES (userId, P_amount, 'W', NOW());

    -- Create withdraw record
    INSERT INTO withdraw (accountNumber, amountWithdrawn, date) VALUES (userId, P_amount, NOW());

    -- Update balance
    UPDATE users SET balance = balance - P_amount WHERE email = P_accountNumber;
END; $$;

DROP PROCEDURE IF EXISTS createTransfer;
CREATE PROCEDURE createTransfer (IN P_accountNumber VARCHAR(100), IN P_transferredTo VARCHAR(100), IN P_amount DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
DECLARE
    userId UUID;
    transferredToId UUID;
BEGIN
    -- Validate P_AccountNumber
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = P_accountNumber) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    END IF;

    -- Validate P_transferredTo
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = P_transferredTo) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    END IF;

    -- Check role restriction
    IF (SELECT role FROM users WHERE email = P_transferredTo) = 'superuser' THEN
        RAISE EXCEPTION 'Not allowed to transfer to superuser';
    END IF;

    -- Validate amount
    IF P_amount <= 0 THEN
        RAISE EXCEPTION 'Amount cannot be negative';
    END IF;

    -- Validate balance
    IF (SELECT balance FROM users WHERE email = P_accountNumber) < P_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Get the id number
    SELECT id FROM users WHERE email = P_accountNumber INTO userId;
    SELECT id FROM users WHERE email = P_transferredTo INTO transferredToId;

    -- Create transaction record
    INSERT INTO transactions (accountNumber, amount, type, date) VALUES (userId, P_amount, 'T', NOW());

    -- Create transfer record
    INSERT INTO transfers (accountNumber, transferredto, amount, date) VALUES (userId, transferredTo, P_amount, NOW());

    -- Update balance
    UPDATE users SET balance = balance - P_amount WHERE email = P_accountNumber;

    -- Update balance (TransferredTo)
    UPDATE users SET balance = balance + P_amount WHERE email = P_transferredTo;
END; $$;

DROP TYPE IF EXISTS user_activity_type;
CREATE TYPE user_activity_type AS ENUM ('SUCCESS', 'FAILURE', 'ATTEMPT', 'LOGOUT', 'REGISTRATION', 'UPDATE', 'DEACTIVATED');

DROP TABLE IF EXISTS audit_activity;
CREATE TABLE audit_activity (
    userID UUID NOT NULL,
    type user_activity_type NOT NULL,
    activity VARCHAR(50) NOT NULL,
    activity_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (userID, activity_timestamp)
);

-- Creating triggers for user activity
CREATE OR REPLACE FUNCTION log_registration_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_activity (userID, type, activity, activity_timestamp) VALUES (NEW.id, 'REGISTRATION', 'User registration through website', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_after_insert_trigger ON users;
CREATE TRIGGER users_after_insert_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION log_registration_activity();

ALTER TABLE cheques
    ALTER COLUMN date SET DEFAULT CURRENT_DATE;

CREATE OR REPLACE FUNCTION log_update_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_activity (userID, type, activity, activity_timestamp) VALUES (NEW.id, 'UPDATE', 'User updated profile', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_after_update_trigger ON users;
CREATE TRIGGER users_after_update_trigger
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION log_update_activity();

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO app_user;
GRANT SELECT,UPDATE,INSERT ON ALL TABLES IN SCHEMA public to app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
