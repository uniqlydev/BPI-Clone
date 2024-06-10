--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS bpi;
--
-- Name: bpi; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE bpi WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE bpi OWNER TO postgres;

\connect bpi

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: activity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.activity AS ENUM (
    'login',
    'logout',
    'create',
    'update',
    'delete'
);


ALTER TYPE public.activity OWNER TO postgres;

--
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'user',
    'superuser'
);


ALTER TYPE public.role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_activity_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_activity_audit (
    id integer NOT NULL,
    user_id character varying(50),
    activity public.activity DEFAULT 'login'::public.activity,
    end_point character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_activity_audit OWNER TO postgres;

--
-- Name: user_activity_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_activity_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_activity_audit_id_seq OWNER TO postgres;

--
-- Name: user_activity_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_activity_audit_id_seq OWNED BY public.user_activity_audit.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(100) NOT NULL,
    password character varying(100),
    phone_number character varying(100) NOT NULL,
    role public.role DEFAULT 'user'::public.role,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: user_activity_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_audit ALTER COLUMN id SET DEFAULT nextval('public.user_activity_audit_id_seq'::regclass);


--
-- Data for Name: user_activity_audit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_activity_audit (id, user_id, activity, end_point, created_at) FROM stdin;
1	user-sktwivi6lx8zomzq	create	/api/users/register	2024-06-10 21:08:48.625
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, email, password, phone_number, role, created_at) FROM stdin;
admin-33212	admin	admin	bpi@admin.com	$1$3XIkcbW1$z10j4ZQKsEMYSoLT3v4Ij0	08012345678	superuser	2024-06-10 13:07:11.238151
user-sktwivi6lx8zomzq	Brendan Nathaniel	Castillo	bomber8183@gmail.com	$2b$10$53lffDYOvRJBiDnowTH0k.FsAPPkAD8nhAFaTOh8euxtQFFtdRHke	09176108252	user	2024-06-10 13:08:48.623974
\.


--
-- Name: user_activity_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_activity_audit_id_seq', 1, false);


--
-- Name: user_activity_audit user_activity_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_activity_audit
    ADD CONSTRAINT user_activity_audit_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_password_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_password_key UNIQUE (password);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (email, phone_number, id);


--
-- Name: DATABASE bpi; Type: ACL; Schema: -; Owner: postgres
--

GRANT CONNECT ON DATABASE bpi TO app_user;


--
-- Name: TABLE user_activity_audit; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.user_activity_audit TO app_user;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT ON TABLE public.users TO app_user;


--
-- PostgreSQL database dump complete
--

