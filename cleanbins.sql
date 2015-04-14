\echo 'Running clean-up processes'
UPDATE allbins
SET rub_start=(regexp_matches(rub_sched,'(\d\d\d\d-\d\d-\d\d)'))[1]
WHERE rub_start IS NULL;
UPDATE allbins
SET rec_start=(regexp_matches(rec_sched,'(\d\d\d\d-\d\d-\d\d)'))[1]
WHERE rec_start IS NULL;
UPDATE allbins
SET grn_start=(regexp_matches(grn_sched,'(\d\d\d\d-\d\d-\d\d)'))[1]
WHERE grn_start IS NULL;


--,
--hw_start=(regexp_matches(hw_sched,'(\d\d\d\d-\d\d-\d\d)'))[1]

UPDATE allbins
SET rub_weeks=(regexp_matches(rub_sched,'\/P(\d)W'))[1]
WHERE rub_weeks IS NULL;

UPDATE allbins
SET rec_weeks=(regexp_matches(rec_sched,'\/P(\d)W'))[1]
WHERE rec_weeks IS NULL;


UPDATE allbins
SET grn_weeks=(regexp_matches(grn_sched,'\/P(\d)W'))[1]
WHERE grn_weeks IS NULL;

--hw_weeks=(regexp_matches(hw_sched,'\/P(\d)W'))[1]


UPDATE allbins
SET rub_day=trim(to_char(rub_start::date,'Day'))
WHERE rub_day IS NULL;

UPDATE allbins
SET rec_day=trim(to_char(rec_start::date,'Day'))
WHERE rec_day IS NULL;

UPDATE allbins
SET grn_day=trim(to_char(grn_start::date,'Day'))
WHERE grn_day IS NULL;
