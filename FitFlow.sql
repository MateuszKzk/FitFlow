--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_workout_plans_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_workout_plans_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_workout_plans_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: workout_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_plans (
    id text NOT NULL,
    name text NOT NULL,
    focus text,
    notes text,
    muscle_group text,
    exercises jsonb DEFAULT '[]'::jsonb NOT NULL,
    photo_data_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workout_plans OWNER TO postgres;

--
-- Data for Name: workout_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workout_plans (id, name, focus, notes, muscle_group, exercises, photo_data_url, created_at, updated_at) FROM stdin;
\.


--
-- Name: workout_plans workout_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_pkey PRIMARY KEY (id);


--
-- Name: idx_workout_plans_exercises_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_plans_exercises_gin ON public.workout_plans USING gin (exercises);


--
-- Name: idx_workout_plans_muscle_group; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_plans_muscle_group ON public.workout_plans USING btree (muscle_group);


--
-- Name: idx_workout_plans_updated_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_plans_updated_at ON public.workout_plans USING btree (updated_at DESC);


--
-- Name: workout_plans trg_workout_plans_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.set_workout_plans_updated_at();


--
-- PostgreSQL database dump complete
--

