#!/bin/bash
mkdir export 2>/dev/null
rm -f export/*.topojson
rm -f export/*.geojson

ogr2ogr -f GeoJSON export/allbins.geojson -t_srs EPSG:4326  "PG:host=localhost dbname=bins user=ubuntu password=ubuntu" -sql "select * from allbins;"
topojson export/allbins.geojson --properties -o export/allbins.topojson
