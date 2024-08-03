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
    id              VARCHAR(50)  NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(100),
    phone_number    VARCHAR(100) NOT NULL UNIQUE,
    role            role      DEFAULT 'user'::role,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_picture BYTEA,
    PRIMARY KEY (email, id)
);

-- Grant permissions
GRANT INSERT, SELECT, UPDATE ON users TO app_user;

-- Insert admin user
INSERT INTO users VALUES
('admin-123312','admin','admin','admin@bpi.com','$2b$10$Ow.zY1am7ACanZ6xyhdWVeTESdIpWSL2deoG224vqzPg5ITkC2lqy','09176108252','superuser',NOW(),NULL);

DROP TYPE IF EXISTS transaction_type;
CREATE TYPE transaction_type AS ENUM ('W','D','T');

DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    accountNumber VARCHAR(50),
    amount DOUBLE PRECISION NOT NULL,
    type transaction_type NOT NULL,
    date TIMESTAMP NOT NULL
);

ALTER TABLE users ADD CONSTRAINT users_unique_id UNIQUE (id);

DROP TABLE IF EXISTS deposits;
CREATE TABLE deposits (
    id SERIAL,
    accountNumber VARCHAR(50),
    amountDeposited DOUBLE PRECISION NOT NULL,
    chequeNum NUMERIC NOT NULL,
    date TIMESTAMP NOT NULL,

    PRIMARY KEY (id, accountNumber, date),

    FOREIGN KEY (id) REFERENCES transactions(id),
    FOREIGN KEY (accountNumber) REFERENCES users(id)
);

DROP TABLE IF EXISTS withdraw;
CREATE TABLE withdraw (
    id SERIAL PRIMARY KEY,
    accountNumber VARCHAR(50),
    amountWithdrawn DOUBLE PRECISION NOT NULL,
    date TIMESTAMP NOT NULL,
    FOREIGN KEY (id) REFERENCES transactions(id),
    FOREIGN KEY (accountNumber) REFERENCES users(id)
);

DROP TABLE IF EXISTS transfers;
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    accountNumber VARCHAR(50),
    transferredTo VARCHAR(50),
    amount DOUBLE PRECISION NOT NULL,
    date TIMESTAMP NOT NULL,

    FOREIGN KEY (id) REFERENCES transactions(id),
    FOREIGN KEY (accountNumber) REFERENCES users(id)
);

DROP TABLE IF EXISTS cheques;
CREATE TABLE cheques (
    chequeNum NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL
);

ALTER TABLE cheques
ADD COLUMN used BOOLEAN DEFAULT FALSE;

ALTER TABLE users ADD COLUMN balance DOUBLE PRECISION DEFAULT 0;

DROP PROCEDURE IF EXISTS createDeposit;
CREATE PROCEDURE createDeposit (IN P_accountNumber VARCHAR(50), IN chequeNumNew NUMERIC, IN amount_check NUMERIC ,IN P_date DATE)
LANGUAGE plpgsql
AS $$
DECLARE transacID NUMERIC;
DECLARE P_amount DOUBLE PRECISION;
BEGIN
    -- First create a transaction
    SELECT MAX(id) INTO transacID
    FROM transactions;

    IF transacID IS NULL THEN
        transacID = 700000;
    end if;

    -- Validate P_AccountNumber

    IF P_accountNumber NOT IN (SELECT id FROM users) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    end if;

    -- Validate cheque number
    IF chequeNumNew NOT IN (SELECT chequeNum FROM cheques) THEN
        RAISE EXCEPTION 'Cheque number % not found in cheques table', chequeNumNew;
    ELSEIF (SELECT used FROM cheques WHERE chequeNum = chequeNumNew) = TRUE THEN
        RAISE EXCEPTION 'Cheque number % has been already used', chequeNumNew;
    end if;

    -- Validate amount

    -- Retrieve amount
    SELECT amount INTO P_amount
    FROM cheques
    WHERE chequeNum = chequeNumNew;

    IF amount_check != P_amount THEN
        RAISE EXCEPTION 'Amount in cheque does not match the amount in the cheque table';
    end if;

    -- Create transaction record
    INSERT INTO transactions VALUES (transacID + 1, P_accountNumber, P_amount, 'D', NOW());

    -- Create deposit record
    INSERT INTO deposits VALUES (transacID + 1, P_accountNumber, P_amount, chequeNumNew, P_date);

    -- Update balance
    UPDATE users SET balance = balance + P_amount WHERE id = P_accountNumber;

    -- Update cheque record
    UPDATE cheques SET used = TRUE WHERE chequeNum = chequeNumNew;
END; $$;

DROP PROCEDURE IF EXISTS createWithdraw;
CREATE PROCEDURE createWithdraw (IN P_accountNumber VARCHAR(50), IN P_amount DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
DECLARE transacID NUMERIC;
BEGIN
    -- First create a transaction
    SELECT MAX(id) INTO transacID
    FROM transactions;

    IF transacID IS NULL THEN
        transacID = 700000;
    end if;

    -- Validate P_AccountNumber
    IF P_accountNumber NOT IN (SELECT id FROM users) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    end if;

    -- Validate amount
    IF P_amount <= 0 THEN
        RAISE EXCEPTION 'Amount cannot be negative';
    end if;

    -- Validate balance
    IF (SELECT balance FROM users WHERE id = P_accountNumber) < P_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    end if;

    -- Create transaction record
    INSERT INTO transactions VALUES (transacID + 1, P_accountNumber, P_amount, 'W', NOW());

    -- Create withdraw record
    INSERT INTO withdraw VALUES (transacID + 1, P_accountNumber, P_amount, NOW());

    -- Update balance
    UPDATE users SET balance = balance - P_amount WHERE id = P_accountNumber;
END; $$;

DROP PROCEDURE IF EXISTS createTransfer;
CREATE PROCEDURE createTransfer (IN P_accountNumber VARCHAR(50), IN P_transferredTo VARCHAR(50), IN P_amount DOUBLE PRECISION)
LANGUAGE plpgsql
AS $$
DECLARE transacID NUMERIC;
BEGIN
    -- First create a transaction
    SELECT MAX(id) INTO transacID
    FROM transactions;

    IF (SELECT role FROM users WHERE id = p_transferredto = 'superuser') THEN
        RAISE EXCEPTION 'Not allowed';
    END IF;

    IF transacID IS NULL THEN
        transacID = 700000;
    end if;

    -- Validate P_AccountNumber
    IF P_accountNumber NOT IN (SELECT id FROM users) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    end if;

    -- Validate P_transferredTo
    IF P_transferredTo NOT IN (SELECT id FROM users) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    end if;

    -- Validate amount
    IF P_amount <= 0 THEN
        RAISE EXCEPTION 'Amount cannot be negative';
    end if;

    -- Validate balance
    IF (SELECT balance FROM users WHERE id = P_accountNumber) < P_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    end if;

    -- Create transaction record
    INSERT INTO transactions VALUES (transacID + 1, P_accountNumber, P_amount, 'T', NOW());

    -- Create transfer record
    INSERT INTO transfers VALUES (transacID + 1, P_accountNumber, P_transferredTo, P_amount, NOW());

    -- Update balance
    UPDATE users SET balance = balance - P_amount WHERE id = P_accountNumber;

    -- Update balance (TransferredTo)
    UPDATE users SET balance = balance + P_amount WHERE id = P_transferredTo;

END; $$;

DROP TYPE IF EXISTS user_activity_type;
CREATE TYPE user_activity_type AS ENUM ('SUCCESS','FAILURE','ATTEMPT','LOGOUT','REGISTRATION','UPDATE','DEACTIVATED');

DROP TABLE IF EXISTS audit_activity;
CREATE TABLE audit_activity (
    userID VARCHAR(50) NOT NULL,
    type user_activity_type NOT NULL,
    activity VARCHAR(50) NOT NULL,
    activity_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (userID, activity_timestamp)
);

-- Creating triggers for user activity
CREATE OR REPLACE FUNCTION log_registration_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_activity VALUES (NEW.id,'REGISTRATION','User registration through website',NOW());

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

ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

SELECT id, first_name, last_name, is_active
FROM users
WHERE role = 'user';

CREATE OR REPLACE FUNCTION log_update_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_activity VALUES (NEW.id,'UPDATE','User updated profile',NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_after_update_trigger ON users;
CREATE TRIGGER users_after_update_trigger
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION log_update_activity();

GRANT UPDATE, DELETE, INSERT, SELECT ON ALL TABLES IN SCHEMA public TO app_user;
