#!/bin/bash
DBNAME=bins
TABLE=allbins

mkdir export 2>/dev/null
rm -f export/*.topojson
rm -f export/*.geojson

ogr2ogr -f GeoJSON export/allbins.geojson -t_srs EPSG:4326  "PG:dbname=$DBNAME" -sql "select * from $TABLE;"
geo2topo export/allbins.geojson -o export/allbins.topojson
