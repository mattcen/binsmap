DROP TABLE allbins;
CREATE TABLE allbins
(
  gid serial NOT NULL,
  the_geom geometry(Geometry,3857),
  source character varying,
  rub_sched character varying,
  rec_sched character varying,
  grn_sched character varying,
  name character varying,
  "desc" character varying,
  rub_cmt character varying,
  rec_cmt character varying,
  grn_cmt character varying,
  info_url character varying,
  missed_ph character varying,
  rub_day character varying,
  rec_day character varying,
  grn_day character varying,
  rub_start character varying,
  rec_start character varying,
  grn_start character varying,
  rub_weeks character varying,
  rec_weeks character varying,
  grn_weeks character varying,
  CONSTRAINT allbins_pkey PRIMARY KEY (gid)
);

\echo "Geelong"
INSERT INTO allbins(the_geom, source, rub_sched, rec_sched, grn_sched, name, "desc", rub_cmt, rec_cmt, grn_cmt, info_url, missed_ph)
SELECT the_geom, 'Geelong', rub_sched, rec_sched, grn_sched, name, "desc", rub_cmt, rec_cmt, grn_cmt, info_url, missed_ph
FROM geelong;

\echo "Golden Plains"
INSERT INTO allbins(the_geom, source, rub_sched, rec_sched, name)
SELECT the_geom, 'Golden Plains', rub_sched, rec_sched, name
FROM golden_plains;

\echo "Ballarat"
INSERT INTO allbins(the_geom, source, rub_sched, rec_sched, name)
SELECT the_geom, 'Ballarat', waste, recycle, collection 
FROM ballarat;

\echo "Manningham"
INSERT INTO allbins(the_geom, source, rub_sched, rec_sched,grn_sched, name,missed_ph,grn_cmt)
SELECT the_geom, 'Manningham', rub_sched, rec_sched, grn_sched,waste,missed_ph,grn_cmt
FROM manningham;

\echo "Wyndham"
INSERT INTO allbins(the_geom, source, rub_day, rub_start, rub_weeks, name)
SELECT the_geom, 
'Wyndham' AS source,
(regexp_split_to_array(description, '<[^>]+>'))[19] AS rub_day,
NULL AS rub_start, -- This gives week "1" or "2" but what do I do with that? (regexp_split_to_array(description, '<[^>]+>'))[25],
'1' AS rub_weeks, -- I think they're all weekly.
concat('Area ', (regexp_split_to_array(description, '<[^>]+>'))[13]) AS name
FROM wyndham;
