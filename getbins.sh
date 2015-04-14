#!/bin/bash
wget -O ballarat.geojson 'http://data.gov.au/geoserver/ballarat-garbage-collection/wfs?request=GetFeature&typeName=4a7a3e5b_a20c_431e_bd21_ada983b0566f&outputFormat=json'
wget -O geelong.geojson 'http://data.gov.au/geoserver/geelong-garbage-collection/wfs?request=GetFeature&typeName=4f2d6646_d246_433c_b537_ed0b09273cbb&outputFormat=json'
wget -O golden_plains.geojson 'http://data.gov.au/dataset/3ce108f9-ccbd-4ff9-8672-956d54dfe384/resource/c55095d7-1252-4722-83de-bde653335787/download/gpsgarbage.json'
wget -O wyndham.kml 'http://data.gov.au/dataset/c1b391aa-2990-4f12-9b3d-31ef9f72e24e/resource/ad28f1db-e81e-449b-a0ba-aa29baab4d71/download/wastecollectionzoneswyndham.kml'
wget -O manningham.geojson 'http://data.gov.au/geoserver/manningham-waste-collection/wfs?request=GetFeature&typeName=adb30341_4703_4050_b18b_5288e3cb0ba7&outputFormat=json'

wget -O colac_otway.geojson 'http://data.gov.au/geoserver/colac-otway-shire-waste-collection/wfs?request=GetFeature&typeName=a7de2474_abb0_4e18_a631_d5550962c89e&outputFormat=json'

#wget -O moonee_valley.kml 'https://www.dropbox.com/s/utqljv03xb7aj2s/MooneeValleyGarbage.kml?dl=1'
wget -O moonee_valley.zip 'https://www.dropbox.com/s/em4o2wn6mlynk1o/MV_Garbage_Recycling_Hard_Waste.zip?dl=1'
unzip moonee_valley.zip