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
-- Area 9, Friday, Week 1, means:
-- Rubbish: 17th  April
-- Recycling: 24th April
-- Green Waste: 17th April
INSERT INTO allbins(the_geom, source, rub_day, rub_start, rub_weeks, rec_day, rec_start, rec_weeks, grn_day, grn_start, grn_weeks, name)
SELECT the_geom, 
'Wyndham' AS source,
(regexp_split_to_array(description, '<[^>]+>'))[19] AS rub_day,
CASE (regexp_split_to_array(description, '<[^>]+>'))[19]
  WHEN 'Monday' THEN '2015-04-06'::date
  WHEN 'Tuesday' THEN '2015-04-07'::date
  WHEN 'Wednesday' THEN '2015-04-08'::date
  WHEN 'Thursday' THEN '2015-04-09'::date
  WHEN 'Friday' THEN '2015-04-10'::date
  WHEN 'Saturday' THEN '2015-04-11'::date -- no saturday or sunday fwiw
  WHEN 'Sunday' THEN '2015-04-12'::date
END AS rub_start, 
'1' AS rub_weeks, 

(regexp_split_to_array(description, '<[^>]+>'))[19] AS rec_day,
CASE (regexp_split_to_array(description, '<[^>]+>'))[19]
  WHEN 'Monday' THEN '2015-03-30'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Tuesday' THEN '2015-03-31'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Wednesday' THEN '2015-04-01'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Thursday' THEN '2015-04-02'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Friday' THEN '2015-04-03'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Saturday' THEN '2015-04-04'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Sunday' THEN '2015-04-05'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
END AS rec_start, 
'2' AS rec_weeks, 
(regexp_split_to_array(description, '<[^>]+>'))[19] AS grn_day,
CASE (regexp_split_to_array(description, '<[^>]+>'))[19]
  WHEN 'Monday' THEN '2015-04-06'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Tuesday' THEN '2015-04-07'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Wednesday' THEN '2015-04-08'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Thursday' THEN '2015-04-09'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Friday' THEN '2015-04-10'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Saturday' THEN '2015-04-11'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
  WHEN 'Sunday' THEN '2015-04-12'::date + 7 * (regexp_split_to_array(description, '<[^>]+>'))[25]
END AS grn_start, 
'2' AS grn_weeks, -- I think they're all weekly.
NULL AS rub_start, -- This gives week "1" or "2" but what do I do with that? (regexp_split_to_array(description, '<[^>]+>'))[25],
concat('Area ', (regexp_split_to_array(description, '<[^>]+>'))[13]) AS name
FROM wyndham;
