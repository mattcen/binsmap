DBNAME=bins
psql -d $DBNAME < mergebins.sql
showcount 
psql -d $DBNAME < cleanbins.sql
date

