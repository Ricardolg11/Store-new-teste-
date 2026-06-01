--
-- PostgreSQL database dump
--

\restrict jzHVqAlZzQIIqsMxwTLKqT8b0A3X3Z6uxJZCmBhQDeBeYMuboU029GRi4qbHbSF

-- Dumped from database version 17.10 (Debian 17.10-0+deb13u1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-0+deb13u1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tb_lote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_lote (
    cod_lote integer NOT NULL,
    cod_produto integer,
    dat_validade date NOT NULL,
    int_quantidade integer DEFAULT 0
);


ALTER TABLE public.tb_lote OWNER TO postgres;

--
-- Name: tb_lote_cod_lote_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_lote_cod_lote_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_lote_cod_lote_seq OWNER TO postgres;

--
-- Name: tb_lote_cod_lote_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_lote_cod_lote_seq OWNED BY public.tb_lote.cod_lote;


--
-- Name: tb_movimentacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_movimentacao (
    cod_mov integer NOT NULL,
    cod_produto integer,
    chr_tipo character(1),
    dat_mov timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    int_qtd integer NOT NULL,
    vch_motivo character varying(200),
    CONSTRAINT tb_movimentacao_chr_tipo_check CHECK ((chr_tipo = ANY (ARRAY['E'::bpchar, 'S'::bpchar])))
);


ALTER TABLE public.tb_movimentacao OWNER TO postgres;

--
-- Name: tb_movimentacao_cod_mov_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_movimentacao_cod_mov_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_movimentacao_cod_mov_seq OWNER TO postgres;

--
-- Name: tb_movimentacao_cod_mov_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_movimentacao_cod_mov_seq OWNED BY public.tb_movimentacao.cod_mov;


--
-- Name: tb_produto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_produto (
    cod_produto integer NOT NULL,
    vch_nome character varying(100) NOT NULL,
    vch_marca character varying(50),
    num_preco numeric(10,2) DEFAULT 0.00,
    vch_categoria character varying(50)
);


ALTER TABLE public.tb_produto OWNER TO postgres;

--
-- Name: tb_produto_cod_produto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_produto_cod_produto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_produto_cod_produto_seq OWNER TO postgres;

--
-- Name: tb_produto_cod_produto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_produto_cod_produto_seq OWNED BY public.tb_produto.cod_produto;


--
-- Name: tb_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tb_usuario (
    cod_usuario integer NOT NULL,
    vch_email character varying(100) NOT NULL,
    vch_senha character varying(255) NOT NULL
);


ALTER TABLE public.tb_usuario OWNER TO postgres;

--
-- Name: tb_usuario_cod_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tb_usuario_cod_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tb_usuario_cod_usuario_seq OWNER TO postgres;

--
-- Name: tb_usuario_cod_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tb_usuario_cod_usuario_seq OWNED BY public.tb_usuario.cod_usuario;


--
-- Name: tb_lote cod_lote; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote ALTER COLUMN cod_lote SET DEFAULT nextval('public.tb_lote_cod_lote_seq'::regclass);


--
-- Name: tb_movimentacao cod_mov; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_movimentacao ALTER COLUMN cod_mov SET DEFAULT nextval('public.tb_movimentacao_cod_mov_seq'::regclass);


--
-- Name: tb_produto cod_produto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_produto ALTER COLUMN cod_produto SET DEFAULT nextval('public.tb_produto_cod_produto_seq'::regclass);


--
-- Name: tb_usuario cod_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_usuario ALTER COLUMN cod_usuario SET DEFAULT nextval('public.tb_usuario_cod_usuario_seq'::regclass);


--
-- Data for Name: tb_lote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_lote (cod_lote, cod_produto, dat_validade, int_quantidade) FROM stdin;
1	1	2026-12-30	50
2	1	2026-06-15	20
3	2	2027-05-20	10
4	4	2026-08-10	15
\.


--
-- Data for Name: tb_movimentacao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_movimentacao (cod_mov, cod_produto, chr_tipo, dat_mov, int_qtd, vch_motivo) FROM stdin;
1	1	E	2026-05-31 22:28:43.009331	70	Entrada de fornecedor - Reposição Mensal
2	1	S	2026-05-31 22:28:43.009331	5	Venda realizada via WhatsApp
3	4	S	2026-05-31 22:28:43.009331	1	Produto danificado no transporte
\.


--
-- Data for Name: tb_produto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_produto (cod_produto, vch_nome, vch_marca, num_preco, vch_categoria) FROM stdin;
2	Natura Chronos Firming Cream	Natura	125.00	Skincare
4	Eudora Matefix Lipstick	Eudora	39.90	Maquiagem
5	Base Matte	Obsidian	45.00	Maquiagem
7	Batom Matte Fix	Eudora	35.90	Maquiagem
8	Creme Chronos Antissinais	Natura	120.00	Skincare
1	Esmalte Rosa Neon 	Impala	19.90	Esmaltes
6	Esmalte Gel Premium	Marca X	18.50	Unhas
3	Boticário Floratta Red	Boticário	149.90	Perfumaria
\.


--
-- Data for Name: tb_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tb_usuario (cod_usuario, vch_email, vch_senha) FROM stdin;
1	erica.sna@email.com	senha_criptografada_123
2	teste-email@email.com	senha_123
\.


--
-- Name: tb_lote_cod_lote_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_lote_cod_lote_seq', 4, true);


--
-- Name: tb_movimentacao_cod_mov_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_movimentacao_cod_mov_seq', 3, true);


--
-- Name: tb_produto_cod_produto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_produto_cod_produto_seq', 8, true);


--
-- Name: tb_usuario_cod_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tb_usuario_cod_usuario_seq', 2, true);


--
-- Name: tb_lote tb_lote_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote
    ADD CONSTRAINT tb_lote_pkey PRIMARY KEY (cod_lote);


--
-- Name: tb_movimentacao tb_movimentacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_movimentacao
    ADD CONSTRAINT tb_movimentacao_pkey PRIMARY KEY (cod_mov);


--
-- Name: tb_produto tb_produto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_produto
    ADD CONSTRAINT tb_produto_pkey PRIMARY KEY (cod_produto);


--
-- Name: tb_usuario tb_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_usuario
    ADD CONSTRAINT tb_usuario_pkey PRIMARY KEY (cod_usuario);


--
-- Name: tb_usuario tb_usuario_vch_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_usuario
    ADD CONSTRAINT tb_usuario_vch_email_key UNIQUE (vch_email);


--
-- Name: idx_lote_validade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lote_validade ON public.tb_lote USING btree (dat_validade);


--
-- Name: idx_produto_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produto_categoria ON public.tb_produto USING btree (vch_categoria);


--
-- Name: idx_produto_marca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_produto_marca ON public.tb_produto USING btree (vch_marca);


--
-- Name: tb_lote tb_lote_cod_produto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_lote
    ADD CONSTRAINT tb_lote_cod_produto_fkey FOREIGN KEY (cod_produto) REFERENCES public.tb_produto(cod_produto) ON DELETE RESTRICT;


--
-- Name: tb_movimentacao tb_movimentacao_cod_produto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tb_movimentacao
    ADD CONSTRAINT tb_movimentacao_cod_produto_fkey FOREIGN KEY (cod_produto) REFERENCES public.tb_produto(cod_produto);


--
-- PostgreSQL database dump complete
--

\unrestrict jzHVqAlZzQIIqsMxwTLKqT8b0A3X3Z6uxJZCmBhQDeBeYMuboU029GRi4qbHbSF

