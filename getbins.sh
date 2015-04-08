#!/bin/bash
wget -O ballarat.geojson 'http://data.gov.au/geoserver/ballarat-garbage-collection/wfs?request=GetFeature&typeName=4a7a3e5b_a20c_431e_bd21_ada983b0566f&outputFormat=json'
wget -O geelong.geojson 'http://data.gov.au/geoserver/geelong-garbage-collection/wfs?request=GetFeature&typeName=4f2d6646_d246_433c_b537_ed0b09273cbb&outputFormat=json'
wget -O golden_plains.geojson 'http://data.gov.au/dataset/3ce108f9-ccbd-4ff9-8672-956d54dfe384/resource/c55095d7-1252-4722-83de-bde653335787/download/gpsgarbage.json'
wget -O wyndham.kml 'http://data.gov.au/dataset/c1b391aa-2990-4f12-9b3d-31ef9f72e24e/resource/ad28f1db-e81e-449b-a0ba-aa29baab4d71/download/wastecollectionzoneswyndham.kml'
