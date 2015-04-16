#createdb -T template_gis bins
DBNAME=bins
TABLE=allbins
TABLEOPTIONS="-lco GEOMETRY_NAME=the_geom -lco FID=gid -nlt GEOMETRY"
function showcount() {
  t=$TABLE
  total=" in total."
  if [[ -n "$1" ]]; then
    t=$1
    total=""
  fi
  psql -d $DBNAME -c "select concat(count(*), ' $TABLE $total') from $t;" | grep "$TABLE"
}

date
psql -d $DBNAME -c "drop table $TABLE;"

pushd data

for file in *.geojson; do
echo "Loading $file"
ogr2ogr --config PG_USE_COPY YES -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 $file -overwrite $TABLEOPTIONS -nln ${file/.geojson}
showcount ${file/.geojson}
done



ogr2ogr -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 wyndham.kml -overwrite $TABLEOPTIONS -nln wyndham
#ogr2ogr -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 moonee_valley.kml -overwrite $TABLEOPTIONS -nln moonee_valley
ogr2ogr -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 moonee_valley/mvcc_GarbageRecyclingHardWaste_region.shp -overwrite $TABLEOPTIONS -nln moonee_valley
ogr2ogr -f "PostgreSQL" PG:"dbname=$DBNAME" -t_srs EPSG:3857 corangamite/*.shp -overwrite $TABLEOPTIONS -nln corangamite

popd

psql -d $DBNAME < mergebins.sql
psql -d $DBNAME < cleanbins.sql
./dumpbins.sh
date

