#!/bin/bash
mkdir data 2>/dev/null
cd data
wget -O ballarat.geojson 'http://data.gov.au/geoserver/ballarat-garbage-collection/wfs?request=GetFeature&typeName=4a7a3e5b_a20c_431e_bd21_ada983b0566f&outputFormat=json'
wget -O geelong.geojson 'http://data.gov.au/geoserver/geelong-garbage-collection/wfs?request=GetFeature&typeName=4f2d6646_d246_433c_b537_ed0b09273cbb&outputFormat=json'
wget -O golden_plains.geojson 'http://data.gov.au/dataset/3ce108f9-ccbd-4ff9-8672-956d54dfe384/resource/c55095d7-1252-4722-83de-bde653335787/download/gpsgarbage.json'
wget -O wyndham.kml 'http://data.gov.au/dataset/c1b391aa-2990-4f12-9b3d-31ef9f72e24e/resource/ad28f1db-e81e-449b-a0ba-aa29baab4d71/download/wastecollectionzoneswyndham.kml'
wget -O manningham.geojson 'http://data.gov.au/geoserver/manningham-waste-collection/wfs?request=GetFeature&typeName=adb30341_4703_4050_b18b_5288e3cb0ba7&outputFormat=json'

wget -O colac_otway.geojson 'http://data.gov.au/geoserver/colac-otway-shire-waste-collection/wfs?request=GetFeature&typeName=a7de2474_abb0_4e18_a631_d5550962c89e&outputFormat=json'
wget -O corangamite.zip 'http://data.gov.au/dataset/327f1c0a-248e-4e8a-96d2-01f905315a03/resource/dd692107-517b-4418-bf45-76dcbdc83b0f/download/wastecollection.zip'
unzip -o -d corangamite corangamite.zip
#wget -O moonee_valley.kml 'https://www.dropbox.com/s/utqljv03xb7aj2s/MooneeValleyGarbage.kml?dl=1'

wget -O moonee_valley.zip 'https://www.dropbox.com/s/em4o2wn6mlynk1o/MV_Garbage_Recycling_Hard_Waste.zip?dl=1'
unzip -o -d moonee_valley moonee_valley.zip

wget -O wyndham.geojson 'http://data.gov.au/geoserver/wyndham-city-trees/wfs?request=GetFeature&typeName=57bca56b_1b4c_48fa_824d_1b4b5cbf7ce7&outputFormat=json'

wget -O hobsons_bay.geojson 'http://data.gov.au/geoserver/hobsons-bay-garbage-collection/wfs?request=GetFeature&typeName=d369f648_d885_47f5_844c_782d8c1a2e56&outputFormat=json'

wget -O surfcoast.geojson 'https://data.gov.au/dataset/6d6feae0-46df-4b5a-8dc9-83969d6a2eec/resource/1daa9c09-4e3e-4511-9485-ec662b498b46/download/SurfCoastShireGarbageCollectionZones.json'

wget -O alpine.geojson 'https://data.gov.au/dataset/fdb733a7-5f75-4e28-9856-a741b4c02c59/resource/9b49d0c3-8d21-4636-bea2-904f181c57b5/download/Alpine-Shire-Council-Garbage-Collection-Zones.json'
wget -O casey.geojson 'https://data.gov.au/dataset/97448f62-be9b-40b4-8cc7-d062edf47aa7/resource/16402c3b-769d-4e38-b6eb-62e14757362f/download/CaseyGarbageCollectionZones.geojson'

wget -O melbourne.zip 'https://data.melbourne.vic.gov.au/api/geospatial/dmpt-2xdw?method=export&format=Shapefile'
unzip -o -d melbourne melbourne.zip


#wget -O gold_coast.geojson 'http://data.gov.au/geoserver/waste-and-recycling-collection-services/wfs?request=GetFeature&typeName=1b853228_5bc4_


cd ..

