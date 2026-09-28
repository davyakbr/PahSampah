--
-- PostgreSQL database dump
--

\restrict DjeOYTc5F6eCDPpektSfOlYr2usmRTfDqbLEx9rNkCYt8vyFVPSRNZjLK0ANea1

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: WasteCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WasteCategory" AS ENUM (
    'ORGANIK',
    'ANORGANIK',
    'B3'
);


ALTER TYPE public."WasteCategory" OWNER TO postgres;

--
-- Name: WasteStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WasteStatus" AS ENUM (
    'PENDING',
    'DIPROSES',
    'SELESAI'
);


ALTER TYPE public."WasteStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: foto_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foto_sampah (
    id text NOT NULL,
    "urlFoto" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "laporanId" text NOT NULL
);


ALTER TABLE public.foto_sampah OWNER TO postgres;

--
-- Name: jenis_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jenis_sampah (
    id text NOT NULL,
    "namaJenis" text NOT NULL,
    category public."WasteCategory" DEFAULT 'ORGANIK'::public."WasteCategory" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.jenis_sampah OWNER TO postgres;

--
-- Name: laporan_sampah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laporan_sampah (
    id text NOT NULL,
    deskripsi text NOT NULL,
    berat double precision NOT NULL,
    status public."WasteStatus" DEFAULT 'PENDING'::public."WasteStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "jenisSampahId" text NOT NULL,
    "wilayahId" text NOT NULL
);


ALTER TABLE public.laporan_sampah OWNER TO postgres;

--
-- Name: log_aktivitas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_aktivitas (
    id text NOT NULL,
    aktivitas text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.log_aktivitas OWNER TO postgres;

--
-- Name: log_poin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.log_poin (
    id text NOT NULL,
    "jumlahPoin" integer NOT NULL,
    tipe text NOT NULL,
    keterangan text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public.log_poin OWNER TO postgres;

--
-- Name: penukaran_vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.penukaran_vouchers (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "voucherId" text NOT NULL
);


ALTER TABLE public.penukaran_vouchers OWNER TO postgres;

--
-- Name: ulasan_laporan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ulasan_laporan (
    id text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    komentar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "laporanId" text NOT NULL
);


ALTER TABLE public.ulasan_laporan OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    nama text NOT NULL,
    email text NOT NULL,
    "noHp" text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vouchers (
    id text NOT NULL,
    judul text NOT NULL,
    deskripsi text,
    "kodeVoucher" text NOT NULL,
    "biayaPoin" integer NOT NULL,
    stok integer DEFAULT 100 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vouchers OWNER TO postgres;

--
-- Name: wilayah; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wilayah (
    id text NOT NULL,
    "namaWilayah" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wilayah OWNER TO postgres;

--
-- Data for Name: foto_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foto_sampah (id, "urlFoto", "createdAt", "laporanId") FROM stdin;
03f92acc-09f8-486a-aaca-bd1b2678f80d	https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500	2026-07-31 11:46:27.037	4b085bdd-3689-41b4-a42b-674b34c6f7ab
bd80eb72-35ba-4e60-b19c-32b1131cf383	https://images.unsplash.com/photo-1604186837056-8e7c286756f2?w=500	2026-07-31 11:46:27.039	f6d8caa4-732a-48bf-89d9-7a6216882999
\.


--
-- Data for Name: jenis_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jenis_sampah (id, "namaJenis", category, "createdAt", "updatedAt") FROM stdin;
bff6e547-58d6-4b9f-85c4-01f25c0784c2	Organik - Sisa Makanan & Dapur	ORGANIK	2026-07-31 11:46:26.906	2026-07-31 11:46:26.906
e1ea248b-ec2a-4854-adec-a175fcd17d43	Organik - Daun & Ranting	ORGANIK	2026-07-31 11:46:26.906	2026-07-31 11:46:26.906
b8556484-fa47-429e-aea6-f1c550d90449	Non Organik - Botol & Wadah Plastik	ANORGANIK	2026-07-31 11:46:26.906	2026-07-31 11:46:26.906
b40e4da4-f294-484d-8eed-a3c8e14bf76b	Non Organik - Kardus & Kertas	ANORGANIK	2026-07-31 11:46:26.906	2026-07-31 11:46:26.906
1c8d36e2-122f-43cb-be9f-bac8d358cfea	Non Organik - Kaleng & Logam	ANORGANIK	2026-07-31 11:46:26.906	2026-07-31 11:46:26.906
4d8d051a-3bf1-46cf-a49a-2c20fc364900	B3 - Baterai & Elektronik Bekas	B3	2026-07-31 11:46:26.906	2026-07-31 11:46:26.906
\.


--
-- Data for Name: laporan_sampah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laporan_sampah (id, deskripsi, berat, status, "createdAt", "updatedAt", "userId", "jenisSampahId", "wilayahId") FROM stdin;
4b085bdd-3689-41b4-a42b-674b34c6f7ab	Botol Aqua 1.5L dan botol soda bekas 10 buah	1.2	SELESAI	2026-07-31 11:46:27.03	2026-07-31 11:46:27.03	97cdba00-0f54-4b1b-ab48-d935d4d944c3	b8556484-fa47-429e-aea6-f1c550d90449	59fd27b8-c060-47de-883c-6e47c99e86aa
f6d8caa4-732a-48bf-89d9-7a6216882999	Sisa sayuran dan buah dapur kemarin	0.8	PENDING	2026-07-31 11:46:27.034	2026-07-31 11:46:27.034	97cdba00-0f54-4b1b-ab48-d935d4d944c3	bff6e547-58d6-4b9f-85c4-01f25c0784c2	5198d324-d74f-4821-add8-c0e2b79d60cb
f017c630-9c20-4d6f-96c7-18f243f43292	Baterai bekas remote dan laptop mati	0.1	PENDING	2026-07-31 11:46:27.035	2026-07-31 11:46:27.035	e028bf61-9f5f-4868-83dc-afa16a24d79f	4d8d051a-3bf1-46cf-a49a-2c20fc364900	4dee2a84-1a13-4373-8804-986455693630
\.


--
-- Data for Name: log_aktivitas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.log_aktivitas (id, aktivitas, "createdAt", "userId") FROM stdin;
7df7ec4e-deb2-4c78-b349-677eea0ba73e	Membuat laporan sampah baru di wilayah Jakarta Pusat	2026-07-31 11:46:27.052	97cdba00-0f54-4b1b-ab48-d935d4d944c3
3f4b73f8-d76b-44de-8090-3f339038842a	Menyelesaikan status laporan sampah ID: 4b085bdd-3689-41b4-a42b-674b34c6f7ab	2026-07-31 11:46:27.054	71864959-0b04-48d3-a8e9-163f1f9b9972
\.


--
-- Data for Name: log_poin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.log_poin (id, "jumlahPoin", tipe, keterangan, "createdAt", "userId") FROM stdin;
f300d716-3afb-47ec-9fdc-fe6307052ddb	12	MASUK	Poin dari laporan sampah botol bekas (1.2 kg)	2026-07-31 11:46:27.046	97cdba00-0f54-4b1b-ab48-d935d4d944c3
0d8a0dc0-57fc-4264-bca7-0b2f043ffc85	100	KELUAR	Penukaran Voucher Alfamart Rp 10.000	2026-07-31 11:46:27.048	97cdba00-0f54-4b1b-ab48-d935d4d944c3
\.


--
-- Data for Name: penukaran_vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.penukaran_vouchers (id, "createdAt", "userId", "voucherId") FROM stdin;
b5cdf93d-2274-461f-8155-e629c183d40a	2026-07-31 11:46:27.043	97cdba00-0f54-4b1b-ab48-d935d4d944c3	5bec3cab-5b00-43ea-bfb6-8ea9bc4df307
\.


--
-- Data for Name: ulasan_laporan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ulasan_laporan (id, rating, komentar, "createdAt", "userId", "laporanId") FROM stdin;
c517b255-1be4-489e-b1c2-0e8723fecfd2	5	Pengambilan sangat cepat dan petugas ramah!	2026-07-31 11:46:27.05	97cdba00-0f54-4b1b-ab48-d935d4d944c3	4b085bdd-3689-41b4-a42b-674b34c6f7ab
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nama, email, "noHp", password, role, points, "createdAt", "updatedAt") FROM stdin;
71864959-0b04-48d3-a8e9-163f1f9b9972	Admin PahSampah	admin@pahsampah.com	081234567890	$2b$10$XnPxJhg0LEVSsrv5iLysie1WdMG5Y7fpLd02orxKcusrkWqALy7xa	ADMIN	0	2026-07-31 11:46:26.896	2026-07-31 11:46:26.896
97cdba00-0f54-4b1b-ab48-d935d4d944c3	Budi Santoso	budi@pahsampah.com	081298765432	$2b$10$XnPxJhg0LEVSsrv5iLysie1WdMG5Y7fpLd02orxKcusrkWqALy7xa	USER	150	2026-07-31 11:46:26.903	2026-07-31 11:46:26.903
e028bf61-9f5f-4868-83dc-afa16a24d79f	Ani Rahayu	ani@pahsampah.com	081311223344	$2b$10$XnPxJhg0LEVSsrv5iLysie1WdMG5Y7fpLd02orxKcusrkWqALy7xa	USER	50	2026-07-31 11:46:26.904	2026-07-31 11:46:26.904
\.


--
-- Data for Name: vouchers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vouchers (id, judul, deskripsi, "kodeVoucher", "biayaPoin", stok, "createdAt", "updatedAt") FROM stdin;
5bec3cab-5b00-43ea-bfb6-8ea9bc4df307	Voucher Alfamart Rp 10.000	Dapat digunakan untuk belanja di seluruh outlet Alfamart	PAH-ALFA-10K	100	50	2026-07-31 11:46:27.04	2026-07-31 11:46:27.04
12a7e111-f722-456c-b1bb-acf26d7264da	Voucher Indomaret Rp 25.000	Potongan belanja Rp 25.000 tanpa minimal transaksi	PAH-INDO-25K	250	30	2026-07-31 11:46:27.042	2026-07-31 11:46:27.042
\.


--
-- Data for Name: wilayah; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wilayah (id, "namaWilayah", "createdAt", "updatedAt") FROM stdin;
59fd27b8-c060-47de-883c-6e47c99e86aa	Jakarta Pusat	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
5198d324-d74f-4821-add8-c0e2b79d60cb	Jakarta Selatan	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
4dee2a84-1a13-4373-8804-986455693630	Jakarta Barat	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
def582bd-e743-4d0f-b1b2-615c3925336a	Jakarta Timur	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
afc68045-a6d5-458c-9c8b-2f3ed56c706b	Bogor	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
5d5b449a-ea65-4727-95c8-de38df739b76	Jakarta Utara	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
6eb5e627-35ee-4f1c-82e4-4df987347362	Depok	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
23310b1d-71fe-42a5-8a19-1514bb429d3b	Tangerang	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
31232f23-7b59-4125-ad29-b558741cf0ca	Bekasi	2026-07-31 11:46:26.975	2026-07-31 11:46:26.975
\.


--
-- Name: foto_sampah foto_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foto_sampah
    ADD CONSTRAINT foto_sampah_pkey PRIMARY KEY (id);


--
-- Name: jenis_sampah jenis_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jenis_sampah
    ADD CONSTRAINT jenis_sampah_pkey PRIMARY KEY (id);


--
-- Name: laporan_sampah laporan_sampah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT laporan_sampah_pkey PRIMARY KEY (id);


--
-- Name: log_aktivitas log_aktivitas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_aktivitas
    ADD CONSTRAINT log_aktivitas_pkey PRIMARY KEY (id);


--
-- Name: log_poin log_poin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_poin
    ADD CONSTRAINT log_poin_pkey PRIMARY KEY (id);


--
-- Name: penukaran_vouchers penukaran_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penukaran_vouchers
    ADD CONSTRAINT penukaran_vouchers_pkey PRIMARY KEY (id);


--
-- Name: ulasan_laporan ulasan_laporan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan_laporan
    ADD CONSTRAINT ulasan_laporan_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (id);


--
-- Name: wilayah wilayah_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wilayah
    ADD CONSTRAINT wilayah_pkey PRIMARY KEY (id);


--
-- Name: foto_sampah_laporanId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "foto_sampah_laporanId_key" ON public.foto_sampah USING btree ("laporanId");


--
-- Name: jenis_sampah_namaJenis_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "jenis_sampah_namaJenis_key" ON public.jenis_sampah USING btree ("namaJenis");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_noHp_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_noHp_key" ON public.users USING btree ("noHp");


--
-- Name: vouchers_kodeVoucher_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vouchers_kodeVoucher_key" ON public.vouchers USING btree ("kodeVoucher");


--
-- Name: wilayah_namaWilayah_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wilayah_namaWilayah_key" ON public.wilayah USING btree ("namaWilayah");


--
-- Name: foto_sampah foto_sampah_laporanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foto_sampah
    ADD CONSTRAINT "foto_sampah_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES public.laporan_sampah(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: laporan_sampah laporan_sampah_jenisSampahId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT "laporan_sampah_jenisSampahId_fkey" FOREIGN KEY ("jenisSampahId") REFERENCES public.jenis_sampah(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: laporan_sampah laporan_sampah_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT "laporan_sampah_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: laporan_sampah laporan_sampah_wilayahId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laporan_sampah
    ADD CONSTRAINT "laporan_sampah_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES public.wilayah(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: log_aktivitas log_aktivitas_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_aktivitas
    ADD CONSTRAINT "log_aktivitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: log_poin log_poin_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.log_poin
    ADD CONSTRAINT "log_poin_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: penukaran_vouchers penukaran_vouchers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penukaran_vouchers
    ADD CONSTRAINT "penukaran_vouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: penukaran_vouchers penukaran_vouchers_voucherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.penukaran_vouchers
    ADD CONSTRAINT "penukaran_vouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public.vouchers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ulasan_laporan ulasan_laporan_laporanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan_laporan
    ADD CONSTRAINT "ulasan_laporan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES public.laporan_sampah(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ulasan_laporan ulasan_laporan_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ulasan_laporan
    ADD CONSTRAINT "ulasan_laporan_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DjeOYTc5F6eCDPpektSfOlYr2usmRTfDqbLEx9rNkCYt8vyFVPSRNZjLK0ANea1

