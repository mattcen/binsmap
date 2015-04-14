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
SELECT DISTINCT the_geom, 
'Wyndham' AS source,
day AS rub_day,
CASE day
  WHEN 'Monday' THEN '2015-04-06'::date
  WHEN 'Tuesday' THEN '2015-04-07'::date
  WHEN 'Wednesday' THEN '2015-04-08'::date
  WHEN 'Thursday' THEN '2015-04-09'::date
  WHEN 'Friday' THEN '2015-04-10'::date
  WHEN 'Saturday' THEN '2015-04-11'::date -- no saturday or sunday fwiw
  WHEN 'Sunday' THEN '2015-04-12'::date
END AS rub_start, 
'1' AS rub_weeks, 

day AS rec_day,
CASE day
  WHEN 'Monday' THEN '2015-03-30'::date + 7 * week::int
  WHEN 'Tuesday' THEN '2015-03-31'::date + 7 * week::int
  WHEN 'Wednesday' THEN '2015-04-01'::date + 7 * week::int
  WHEN 'Thursday' THEN '2015-04-02'::date + 7 * week::int
  WHEN 'Friday' THEN '2015-04-03'::date + 7 * week::int
  WHEN 'Saturday' THEN '2015-04-04'::date + 7 * week::int
  WHEN 'Sunday' THEN '2015-04-05'::date + 7 * week::int
END AS rec_start, 
'2' AS rec_weeks, 
day AS grn_day,
CASE day
  WHEN 'Monday' THEN '2015-04-06'::date + 7 * week::int
  WHEN 'Tuesday' THEN '2015-04-07'::date + 7 * week::int
  WHEN 'Wednesday' THEN '2015-04-08'::date + 7 * week::int
  WHEN 'Thursday' THEN '2015-04-09'::date + 7 * week::int
  WHEN 'Friday' THEN '2015-04-10'::date + 7 * week::int
  WHEN 'Saturday' THEN '2015-04-11'::date + 7 * week::int
  WHEN 'Sunday' THEN '2015-04-12'::date + 7 * week::int
END AS grn_start, 
'2' AS grn_weeks, -- I think they're all weekly.
concat('Area ', area_no) AS name
FROM wyndham;

\echo "Colac Otway"
-- Monday Week 1 = April 6 for recyclables, April 13 for green waste
INSERT INTO allbins(the_geom, source, rub_day, rub_start, rub_weeks, rec_day, rec_start, rec_weeks, grn_day, grn_start, grn_weeks, name)
SELECT DISTINCT the_geom, 
'Colac Otway' AS source,
split_part(dayweek,' ', 1) AS rub_day,
CASE split_part(dayweek,' ', 1)
  WHEN 'Monday' THEN '2015-04-06'::date
  WHEN 'Tuesday' THEN '2015-04-07'::date
  WHEN 'Wednesday' THEN '2015-04-08'::date
  WHEN 'Thursday' THEN '2015-04-09'::date
  WHEN 'Friday' THEN '2015-04-10'::date
  WHEN 'Saturday' THEN '2015-04-11'::date -- no saturday or sunday fwiw
  WHEN 'Sunday' THEN '2015-04-12'::date
END AS rub_start, 
'1' AS rub_weeks, 

split_part(dayweek,' ', 1) AS rec_day,
CASE split_part(dayweek,' ', 1)
  WHEN 'Monday' THEN '2015-03-30'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Tuesday' THEN '2015-03-31'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Wednesday' THEN '2015-04-01'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Thursday' THEN '2015-04-02'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Friday' THEN '2015-04-03'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Saturday' THEN '2015-04-04'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Sunday' THEN '2015-04-05'::date + 7 * (right(dayweek, 1)::int)
END AS rec_start, 
'2' AS rec_weeks, 
split_part(dayweek,' ', 1) AS grn_day,
CASE split_part(dayweek,' ', 1)
  WHEN 'Monday' THEN '2015-04-06'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Tuesday' THEN '2015-04-07'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Wednesday' THEN '2015-04-08'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Thursday' THEN '2015-04-09'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Friday' THEN '2015-04-10'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Saturday' THEN '2015-04-11'::date + 7 * (right(dayweek, 1)::int)
  WHEN 'Sunday' THEN '2015-04-12'::date + 7 * (right(dayweek, 1)::int)
END AS grn_start, 
'2' AS grn_weeks, -- I think they're all weekly.
dayweek AS name
FROM colac_otway;

\echo 'Moonee Valley'
INSERT INTO allbins(the_geom, source, name, rub_day, rub_start, rub_weeks, rec_day, rec_start, rec_weeks,grn_day, grn_start, grn_weeks)
SELECT
the_geom,
'Moonee Valley' AS source, 
collection AS name,
collecti00 AS rub_day,
CASE collecti00
  WHEN 'Monday' THEN '2015-04-06'::date
  WHEN 'Tuesday' THEN '2015-04-07'::date
  WHEN 'Wednesday' THEN '2015-04-08'::date
  WHEN 'Thursday' THEN '2015-04-09'::date
  WHEN 'Friday' THEN '2015-04-10'::date
END AS rub_start, 
'1' as rub_weeks,
collecti00 AS rec_day,
-- Monday 13 April is green waste for Area 1
CASE collecti00
  WHEN 'Monday' THEN '2015-03-30'::date + 7 * (collecti01::int)
  WHEN 'Tuesday' THEN '2015-03-31'::date + 7 * (collecti01::int)
  WHEN 'Wednesday' THEN '2015-04-01'::date + 7 * (collecti01::int)
  WHEN 'Thursday' THEN '2015-04-02'::date + 7 * (collecti01::int)
  WHEN 'Friday' THEN '2015-04-03'::date + 7 * (collecti01::int)
END AS rec_start, 
'2' AS rec_weeks,
collecti00 AS grn_day,
CASE collecti00
  WHEN 'Monday' THEN '2015-03-30'::date + 7 + 7 * (collecti01::int)
  WHEN 'Tuesday' THEN '2015-03-31'::date + 7 + 7 * (collecti01::int)
  WHEN 'Wednesday' THEN '2015-04-01'::date + 7 + 7 * (collecti01::int)
  WHEN 'Thursday' THEN '2015-04-02'::date + 7 + 7 * (collecti01::int)
  WHEN 'Friday' THEN '2015-04-03'::date + 7 + 7 * (collecti01::int)
END AS grn_start,
'2' AS grn_weeks,
FROM moonee_valley;