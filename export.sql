--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: activity; Type: TYPE; Schema: public; Owner: app_user
--

CREATE TYPE public.activity AS ENUM (
    'login',
    'logout',
    'create',
    'update',
    'delete'
);


ALTER TYPE public.activity OWNER TO app_user;

--
-- Name: role; Type: TYPE; Schema: public; Owner: app_user
--

CREATE TYPE public.role AS ENUM (
    'user',
    'transacad',
    'acctad'
);


ALTER TYPE public.role OWNER TO app_user;

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'W',
    'D',
    'T'
);


ALTER TYPE public.transaction_type OWNER TO postgres;

--
-- Name: user_activity_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_activity_type AS ENUM (
    'SUCCESS',
    'FAILURE',
    'ATTEMPT',
    'LOGOUT',
    'REGISTRATION',
    'UPDATE',
    'DEACTIVATED'
);


ALTER TYPE public.user_activity_type OWNER TO postgres;

--
-- Name: createdeposit(character varying, numeric, numeric, date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.createdeposit(IN p_accountnumber character varying, IN chequenumnew numeric, IN amount_check numeric, IN p_date date)
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


ALTER PROCEDURE public.createdeposit(IN p_accountnumber character varying, IN chequenumnew numeric, IN amount_check numeric, IN p_date date) OWNER TO postgres;

--
-- Name: createtransfer(character varying, character varying, double precision); Type: PROCEDURE; Schema: public; Owner: app_user
--

CREATE PROCEDURE public.createtransfer(IN p_transferredfrom character varying, IN p_transferredto character varying, IN p_amount double precision)
    LANGUAGE plpgsql
    AS $$
DECLARE
    sender_id UUID;
    sender_balance DOUBLE PRECISION;
BEGIN
    -- Validate sender account and get sender ID
    SELECT id, balance INTO sender_id, sender_balance FROM users 
    WHERE email = p_transferredfrom AND is_active = true;

    IF sender_id IS NULL THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    END IF;

    -- Validate recipient account
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = p_transferredto AND is_active = true) THEN
        RAISE EXCEPTION 'Not an existing or deactivated user account';
    END IF;

    -- Prevent transfers to superuser
    IF (SELECT role FROM users WHERE email = p_transferredto) = 'superuser' THEN
        RAISE EXCEPTION 'Not allowed to transfer to superuser';
    END IF;

    -- Validate transfer amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero';
    END IF;

    -- Check sender's balance
    IF sender_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Record the transaction using sender's ID
    INSERT INTO transactions (accountNumber, amount, type, date)
    VALUES (sender_id, p_amount, 'T', NOW());

    -- Insert into transfers table using sender's email
    INSERT INTO transfers (transferredFrom, transferredTo, amount, date)
    VALUES (p_transferredfrom, p_transferredto, p_amount, NOW());

    -- Deduct balance from sender
    UPDATE users SET balance = balance - p_amount WHERE id = sender_id;

    -- Add balance to recipient
    UPDATE users SET balance = balance + p_amount WHERE email = p_transferredto;
END;
$$;


ALTER PROCEDURE public.createtransfer(IN p_transferredfrom character varying, IN p_transferredto character varying, IN p_amount double precision) OWNER TO app_user;

--
-- Name: createwithdraw(character varying, double precision); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.createwithdraw(IN p_accountnumber character varying, IN p_amount double precision)
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


ALTER PROCEDURE public.createwithdraw(IN p_accountnumber character varying, IN p_amount double precision) OWNER TO postgres;

--
-- Name: log_registration_activity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_registration_activity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_activity (userID, type, activity, activity_timestamp) VALUES (NEW.id, 'REGISTRATION', 'User registration through website', NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_registration_activity() OWNER TO postgres;

--
-- Name: log_update_activity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_update_activity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_activity (userID, type, activity, activity_timestamp) VALUES (NEW.id, 'UPDATE', 'User updated profile', NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_update_activity() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_activity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_activity (
    userid uuid NOT NULL,
    type public.user_activity_type NOT NULL,
    activity character varying(50) NOT NULL,
    activity_timestamp timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_activity OWNER TO postgres;

--
-- Name: cheques; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cheques (
    chequenum numeric NOT NULL,
    amount numeric NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    used boolean DEFAULT false
);


ALTER TABLE public.cheques OWNER TO postgres;

--
-- Name: deposits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deposits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    accountnumber uuid NOT NULL,
    amountdeposited double precision NOT NULL,
    chequenum numeric NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE public.deposits OWNER TO postgres;

--
-- Name: flagged_transactions; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.flagged_transactions (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    accountnumber uuid NOT NULL,
    transaction_id uuid NOT NULL,
    type public.transaction_type NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.flagged_transactions OWNER TO app_user;

--
-- Name: flagged_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: app_user
--

CREATE SEQUENCE public.flagged_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flagged_transactions_id_seq OWNER TO app_user;

--
-- Name: flagged_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: app_user
--

ALTER SEQUENCE public.flagged_transactions_id_seq OWNED BY public.flagged_transactions.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    accountnumber uuid,
    amount double precision NOT NULL,
    type public.transaction_type NOT NULL,
    date timestamp without time zone NOT NULL,
    flagged boolean DEFAULT false
);


ALTER TABLE public.transactions OWNER TO app_user;

--
-- Name: transfers; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.transfers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    transferredfrom character varying(100),
    transferredto character varying(100),
    amount double precision NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE public.transfers OWNER TO app_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: app_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(100) NOT NULL,
    password character varying(100),
    phone_number character varying(100) NOT NULL,
    role text DEFAULT 'user'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    profile_picture bytea,
    balance double precision DEFAULT 0,
    is_active boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO app_user;

--
-- Name: withdraw; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdraw (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    accountnumber uuid,
    amountwithdrawn double precision NOT NULL,
    date timestamp without time zone NOT NULL
);


ALTER TABLE public.withdraw OWNER TO postgres;

--
-- Name: flagged_transactions id; Type: DEFAULT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.flagged_transactions ALTER COLUMN id SET DEFAULT nextval('public.flagged_transactions_id_seq'::regclass);


--
-- Data for Name: audit_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_activity (userid, type, activity, activity_timestamp) FROM stdin;
45a77f68-3bcb-4a1c-93b6-de4597837356	REGISTRATION	User registration through website	2025-03-17 03:28:31.197351
ad191b73-76e0-4816-8557-d45af41c99cf	UPDATE	User updated profile	2025-03-17 03:35:51.021469
f69b7ff2-ffd7-4802-9445-371d09bde59f	REGISTRATION	User registration through website	2025-03-17 03:41:02.933026
ad191b73-76e0-4816-8557-d45af41c99cf	UPDATE	User updated profile	2025-03-17 03:41:19.474309
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-17 03:41:19.474309
f69b7ff2-ffd7-4802-9445-371d09bde59f	UPDATE	User updated profile	2025-03-21 06:25:07.489088
ad191b73-76e0-4816-8557-d45af41c99cf	UPDATE	User updated profile	2025-03-21 06:25:07.489088
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 06:22:26.381167
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 06:23:24.887353
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 06:51:28.409251
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 06:57:31.29561
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 07:02:45.775237
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 07:03:04.150438
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 07:05:08.565652
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 07:05:29.657226
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 13:05:59.978103
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 13:07:00.453705
fd3dc80a-a92b-493e-9904-cff014f94c7f	REGISTRATION	User registration through website	2025-03-22 15:07:07.80303
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 15:42:31.320532
fd3dc80a-a92b-493e-9904-cff014f94c7f	UPDATE	User updated profile	2025-03-22 15:42:31.320532
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 15:43:58.122362
fd3dc80a-a92b-493e-9904-cff014f94c7f	UPDATE	User updated profile	2025-03-22 15:43:58.122362
fd3dc80a-a92b-493e-9904-cff014f94c7f	UPDATE	User updated profile	2025-03-22 15:47:16.565929
fd3dc80a-a92b-493e-9904-cff014f94c7f	UPDATE	User updated profile	2025-03-22 15:47:32.30049
45a77f68-3bcb-4a1c-93b6-de4597837356	UPDATE	User updated profile	2025-03-22 15:47:32.30049
d9fc19c6-e3b2-45b7-ac58-b55d03bde5b9	REGISTRATION	User registration through website	2025-03-22 15:49:50.980647
deede1ac-3174-453a-9263-5597bac1ffb9	REGISTRATION	User registration through website	2025-03-22 15:55:47.661836
\.


--
-- Data for Name: cheques; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cheques (chequenum, amount, date, used) FROM stdin;
2137921	200	2025-03-22	t
1234567	500	2025-03-22	t
2345678	1000	2025-03-22	t
3456789	10000	2025-03-22	f
\.


--
-- Data for Name: deposits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deposits (id, accountnumber, amountdeposited, chequenum, date) FROM stdin;
344ed106-817d-4202-9e7b-09324f2c04a1	45a77f68-3bcb-4a1c-93b6-de4597837356	200	2137921	2025-03-22 00:00:00
c62ddaf8-7130-4918-920d-297ffdae05ed	45a77f68-3bcb-4a1c-93b6-de4597837356	200	2137921	2025-03-22 00:00:00
444fbea0-6429-46d5-a120-64f78c7867da	45a77f68-3bcb-4a1c-93b6-de4597837356	500	1234567	2025-03-22 00:00:00
5fe9db2a-6c3f-41c0-bd47-7f5715d75fb9	45a77f68-3bcb-4a1c-93b6-de4597837356	1000	2345678	2025-03-22 00:00:00
\.


--
-- Data for Name: flagged_transactions; Type: TABLE DATA; Schema: public; Owner: app_user
--

COPY public.flagged_transactions (id, email, accountnumber, transaction_id, type, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: app_user
--

COPY public.transactions (id, accountnumber, amount, type, date, flagged) FROM stdin;
8e741125-4654-4d10-89fa-3fae4d55c1af	45a77f68-3bcb-4a1c-93b6-de4597837356	200	D	2025-03-22 06:51:28.409251	f
cbd37950-2379-4948-bb90-cd71be466a2f	45a77f68-3bcb-4a1c-93b6-de4597837356	200	D	2025-03-22 06:57:31.29561	f
41f6e6da-7435-470a-a0b2-84abf0336973	45a77f68-3bcb-4a1c-93b6-de4597837356	500	D	2025-03-22 07:02:45.775237	f
ce9e8956-549d-4f56-952d-433555e30e75	45a77f68-3bcb-4a1c-93b6-de4597837356	1000	D	2025-03-22 13:07:00.453705	f
1668a9ca-408e-488f-9a7a-d7b0fdefc630	45a77f68-3bcb-4a1c-93b6-de4597837356	500	W	2025-03-22 06:23:24.887353	t
59d3fcb0-8ae2-44c9-9a41-6dc8a1ef6a26	45a77f68-3bcb-4a1c-93b6-de4597837356	500	W	2025-03-22 13:05:59.978103	t
50d07f96-69ff-452f-a1ac-3259904a1848	45a77f68-3bcb-4a1c-93b6-de4597837356	5000	T	2025-03-22 15:42:31.320532	f
f177b4f7-c0ab-468a-a485-2b7f73f12a8a	45a77f68-3bcb-4a1c-93b6-de4597837356	300	T	2025-03-22 15:43:58.122362	f
9d784618-658e-4723-8201-cc6c190cea95	fd3dc80a-a92b-493e-9904-cff014f94c7f	200	T	2025-03-22 15:47:32.30049	f
\.


--
-- Data for Name: transfers; Type: TABLE DATA; Schema: public; Owner: app_user
--

COPY public.transfers (id, transferredfrom, transferredto, amount, date) FROM stdin;
ecbfbc01-458f-4dcd-a24f-1b2c05a9ef2e	nanasijera@gmail.com	rick@gmail.com	5000	2025-03-22 15:42:31.320532
a573e14e-21a1-403d-95d9-a5b22d11dd6f	nanasijera@gmail.com	rick@gmail.com	300	2025-03-22 15:43:58.122362
4e32598b-3770-4921-b652-971a08353548	rick@gmail.com	nanasijera@gmail.com	200	2025-03-22 15:47:32.30049
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: app_user
--

COPY public.users (id, first_name, last_name, email, password, phone_number, role, created_at, profile_picture, balance, is_active) FROM stdin;
f69b7ff2-ffd7-4802-9445-371d09bde59f	test	user	test@gmail.com	$2b$10$iF1GwwCxw4k4SfVKkn31w.03uVbMmUiYczXdtDkN7ZaZXlkAJofVe	09055548240	acctad	2025-03-17 03:41:02.933026	\N	0	t
ad191b73-76e0-4816-8557-d45af41c99cf	admin	admin	admin@bpi.com	$2b$10$iF1GwwCxw4k4SfVKkn31w.03uVbMmUiYczXdtDkN7ZaZXlkAJofVe	09176108252	transacad	2025-03-17 03:22:37.666062	\N	0	t
fd3dc80a-a92b-493e-9904-cff014f94c7f	Rick	Grimes	rick@gmail.com	$2b$10$2edgUOJH1.ONkl8Jf9QVA.vX5MVHnfA2NLe1lVb6U44kU02P9qNCe	09055548241	user	2025-03-22 15:07:07.80303	\N	5100	t
45a77f68-3bcb-4a1c-93b6-de4597837356	Christina	Sijera	nanasijera@gmail.com	$2b$10$iF1GwwCxw4k4SfVKkn31w.03uVbMmUiYczXdtDkN7ZaZXlkAJofVe	9626893376	user	2025-03-17 03:28:31.197351	\N	15800	t
d9fc19c6-e3b2-45b7-ac58-b55d03bde5b9	carl	grimes	carl@gmail.com	$2b$10$Bx8HlHbKYSb4E/AdRKy.euF2DLA0zEiDFz/imt99G0bpYPQmm2jte	09055548243	app_user	2025-03-22 15:49:50.980647	\N	0	t
deede1ac-3174-453a-9263-5597bac1ffb9	lori	grimes	lori@gmail.com	$2b$10$lUaoaKu.nrW29VRPHiz2iOGKTTRkjR8YgCngswJLjCEx5cM0mLBbu	09055548245	user	2025-03-22 15:55:47.661836	\N	0	t
\.


--
-- Data for Name: withdraw; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdraw (id, accountnumber, amountwithdrawn, date) FROM stdin;
2ea2e602-536f-4112-a7f3-742aa68f6a96	45a77f68-3bcb-4a1c-93b6-de4597837356	500	2025-03-22 06:23:24.887353
5b718856-a86e-4207-b913-fc439003e1f3	45a77f68-3bcb-4a1c-93b6-de4597837356	500	2025-03-22 13:05:59.978103
\.


--
-- Name: flagged_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: app_user
--

SELECT pg_catalog.setval('public.flagged_transactions_id_seq', 1, false);


--
-- Name: audit_activity audit_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_activity
    ADD CONSTRAINT audit_activity_pkey PRIMARY KEY (userid, activity_timestamp);


--
-- Name: cheques cheques_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cheques
    ADD CONSTRAINT cheques_pkey PRIMARY KEY (chequenum);


--
-- Name: deposits deposits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_pkey PRIMARY KEY (id, accountnumber, date);


--
-- Name: flagged_transactions flagged_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.flagged_transactions
    ADD CONSTRAINT flagged_transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transfers transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_id_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_key UNIQUE (id);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (email, id);


--
-- Name: withdraw withdraw_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdraw
    ADD CONSTRAINT withdraw_pkey PRIMARY KEY (id);


--
-- Name: users users_after_insert_trigger; Type: TRIGGER; Schema: public; Owner: app_user
--

CREATE TRIGGER users_after_insert_trigger AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_registration_activity();


--
-- Name: users users_after_update_trigger; Type: TRIGGER; Schema: public; Owner: app_user
--

CREATE TRIGGER users_after_update_trigger AFTER UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_update_activity();


--
-- Name: deposits deposits_accountnumber_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deposits
    ADD CONSTRAINT deposits_accountnumber_fkey FOREIGN KEY (accountnumber) REFERENCES public.users(id);


--
-- Name: transfers transfers_users_email_fk; Type: FK CONSTRAINT; Schema: public; Owner: app_user
--

ALTER TABLE ONLY public.transfers
    ADD CONSTRAINT transfers_users_email_fk FOREIGN KEY (transferredfrom) REFERENCES public.users(email);


--
-- Name: withdraw withdraw_accountnumber_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdraw
    ADD CONSTRAINT withdraw_accountnumber_fkey FOREIGN KEY (accountnumber) REFERENCES public.users(id);


--
-- Name: PROCEDURE createdeposit(IN p_accountnumber character varying, IN chequenumnew numeric, IN amount_check numeric, IN p_date date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON PROCEDURE public.createdeposit(IN p_accountnumber character varying, IN chequenumnew numeric, IN amount_check numeric, IN p_date date) TO app_user;


--
-- Name: PROCEDURE createwithdraw(IN p_accountnumber character varying, IN p_amount double precision); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON PROCEDURE public.createwithdraw(IN p_accountnumber character varying, IN p_amount double precision) TO app_user;


--
-- Name: FUNCTION log_registration_activity(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.log_registration_activity() TO app_user;


--
-- Name: FUNCTION log_update_activity(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.log_update_activity() TO app_user;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO app_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO app_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO app_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO app_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO app_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_nil() TO app_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO app_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO app_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO app_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO app_user;


--
-- Name: TABLE audit_activity; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.audit_activity TO app_user;


--
-- Name: TABLE cheques; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.cheques TO app_user;


--
-- Name: TABLE deposits; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.deposits TO app_user;


--
-- Name: TABLE withdraw; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,UPDATE ON TABLE public.withdraw TO app_user;


--
-- PostgreSQL database dump complete
--

