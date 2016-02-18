DBNAME=bins
psql -d $DBNAME < 3a-mergebins.sql
showcount 
psql -d $DBNAME < 3b-cleanbins.sql
date

