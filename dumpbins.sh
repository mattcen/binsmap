#!/bin/bash
ogr2ogr -f GeoJSON allbins.geojson   "PG:host=localhost dbname=bins user=ubuntu password=ubuntu" -sql "select * from allbins;"
topojson allbins.geojson -o allbins.topojson
