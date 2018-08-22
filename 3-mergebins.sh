#!/bin/bash
DBNAME=bins
TABLE=allbins
function showcount() {
  t=$TABLE
  total=" in total."
  if [[ -n "$1" ]]; then
    t=$1
    total=""
  fi
  psql -d $DBNAME -c "select concat(count(*), ' $TABLE $total') from $t;" | grep "$TABLE"
}

psql -d $DBNAME < 3a-mergebins.sql
showcount 
psql -d $DBNAME < 3b-cleanbins.sql
date

