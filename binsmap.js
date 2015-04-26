/*
TODO:
- calculate "next bin night"
- special handling for the day after bin night - maybe it's not too late?
- when you zoom in far you lose your marker
- clickable areas - maybe instead of dragging marker
- update spec to allow per-type info
- add bookmarks like #wyndham, #tuesday
- "powered by OpenCouncilData tag"?
- cookies to set your home for future visits
- Google Calendar for your bin nights? I have no idea how to implement this.
- restructure loading so database table is dissolved and we have structures like { 'rubbish': { 'weeks' : ..., daystill: ...} }
  directly on the geojson leaflet layer.
- fix google analytics - getting no data

gold coast:
http://data.gov.au/dataset/waste-and-recycling-collection-services/resource/015c15c9-2500-495d-80d5-151531a44f9a

hobart:
http://data.gov.au/dataset/city-of-hobart-kerbside-collection-general-waste/resource/ff7c886a-2a46-4051-91a4-c6c2c3f5a43f

colac otway:
http://data.gov.au/dataset/colac-otway-shire-waste-collection/resource/a7a98278-91a9-4df9-acc6-ab4bc29c3027

Salisbury (SA):
https://data.sa.gov.au/dataset/01679c85-ea70-4fda-94e7-1ba5c4718e09
*/
var layer;
var map;
var overlays = {};
var tiles={};
var zoneGeo;
var locationMarker;
var CHANGEOVERHOUR = 9; // If it's after this hour, then we're talking about tomorrow's bin night.

var councilinfo = {
    'Geelong': 'http://www.geelongaustralia.com.au/residents/waste/default.aspx',
    'Wyndham': 'https://www.wyndham.vic.gov.au/waste/kerbside_collections',
    'Manningham': 'http://www.manningham.vic.gov.au/waste-and-recycling',
    'Golden Plains': 'http://www.goldenplains.vic.gov.au/garbageandrecycling',
    'Ballarat': 'http://www.ballarat.vic.gov.au/ps/waste.aspx',
    'Colac Otway': 'http://www.colacotway.vic.gov.au/Page/page.asp?Page_Id=3278&h=0',
    'Moonee Valley': 'http://www.mvcc.vic.gov.au/for-residents/waste-and-recycling/collections.aspx',
    'Corangamite': 'http://www.corangamite.vic.gov.au/index.php/council-services/waste-management/kerbside-collection'
}


function daysTillBinNight(startdate, weekinterval) {
   if (!startdate || !weekinterval) {
        return undefined;
    }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var tomorrow = today;
    
    if (now.getHours() > CHANGEOVERHOUR) {
       tomorrow = new Date(today.getTime() + 86400000);
    }   
    // loading a UTC YYYY-MM-DD date means getting UTC midnight. We don't want that.
    then = new Date(startdate.replace(/-/g, '/'));
    daysbetween = Math.floor((tomorrow-then)/86400000);
    dayinterval = 7 * weekinterval;
    daysTill = (dayinterval - daysbetween % (dayinterval)) % dayinterval ;
    return daysTill;

 }

function isBinNight(startdate, weekinterval) {
    if (!startdate || !weekinterval) {
        return false;
    }
    return daysTillBinNight(startdate, weekinterval) === 0; 
}

var nottonight = {
    fillOpacity: 0,
    color: '#333',
    weight: 1

}

rubbishstyle = function(f) {
    p = f.properties;
    if (isBinNight(p.rub_start, p.rub_weeks)) {
        return { color: "darkred", fillColor: "red", fillOpacity:0.5, weight: 2, }
    } else return nottonight;
}
recstyle = function(f) {
    p = f.properties;
    if (isBinNight(p.rec_start, p.rec_weeks)) {
        return { color: "brown", fillColor: "yellow", fillOpacity:0.5, weight: 2 }
    } else return nottonight;
}
greenstyle = function(f) {
    p = f.properties;
    if (isBinNight(p.grn_start, p.grn_weeks)) {
        return { color: "darkgreen", fillColor: "green", fillOpacity:0.7, weight: 2 }
    } else return nottonight;
}

function clickedAZone(e)  {
    var ordinals = {'1': '', '2': 'second ', '3': 'third ', '4': 'fourth '};
    p = e.target.feature.properties;
    t = '<h5>' + p.source + ' ' + p.name + '</h5>';
    if (p.rub_weeks)
        t += '<b>Rubbish</b>: Every ' + ordinals[p.rub_weeks] + p.rub_day + '<br/>';
    if (p.rec_weeks)
        t += '<b>Recycling</b>: Every ' + ordinals[p.rec_weeks] + p.rec_day + '<br/>';
    if (p.grn_weeks)
        t += '<b>Green waste</b>: Every ' + ordinals[p.grn_weeks] + p.rec_day + '<br/>';
    map.openPopup(L.popup().setLatLng(e.latlng).setContent(t));
    locationMarker.setLatLng(e.latlng);
    checkLocation();
}

function processLayer(f, l) {
    cs = { rubbish: 'rub', recycling: 'rec', green: 'grn' }
    Object.keys(cs).forEach(function(k) {
        p = f.properties;
        if (!f.collection) f.collection = {};
        f.collection[k] = {};
        if (p[cs[k]+'_weeks']) {
            f.collection[k].weeks = p[cs[k] + '_weeks'];
            f.collection[k].start = p[cs[k] + '_start'];
            f.collection[k].day =   p[cs[k] + '_day'];
            f.collection[k].label = { rubbish: 'Rubbish', recycling: 'Recycling', green: 'Green waste' }[k];
            f.collection[k].comment = p[cs[k] + '_cmt'];
            f.collection[k].daysTill = daysTillBinNight(f.collection[k].start, f.collection[k].weeks);
        }
        f.collection[k].source = f.properties.source;
    });
}

function loadTopoJson(t) {
    overlays['Rubbish'] = L.geoJson(zoneGeo, {

        filter: function(f) {
            return !!f.properties.rub_day;
        },
        onEachFeature: function(f, l) {
            l.on('click', clickedAZone);
            processLayer(f,l);
        },
        style: rubbishstyle
        
    });
    
    overlays['Recycling'] = L.geoJson(zoneGeo, {
        style: recstyle,
        filter: function(f) {
            return !!f.properties.rec_day;
        },
        onEachFeature: function(f, l) {
            l.on('click', clickedAZone);
            processLayer(f,l);
        }
        
    });
    overlays['Green waste'] = L.geoJson(zoneGeo, {
        style: greenstyle,
        filter: function(f) {
            return !!f.properties.grn_day;
        },
        onEachFeature: function(f, l) {
            l.on('click', clickedAZone);
            processLayer(f,l);
        }
        
    });


}

function collectionsAtMarker() {
    var collections={}
    var locationGeo = turf.point([locationMarker.getLatLng().lng, locationMarker.getLatLng().lat]);
    zoneGeo.features.forEach(function(zone) {
        //p = zone.properties;
        if (!turf.inside(locationGeo, zone))
            return;
        //collections.push(zone.collection);
        collections = zone.collection; // disallowing overlapping polygons here.
    });

    return collections;
}


function checkLocation() {

    try {

        if (!locationMarker || !zoneGeo) {
            return;
        }
        var hasdata = false;
        $(".info").hide();
        $(".nocoverage").hide();
        var collections = collectionsAtMarker();
        var collectionsTonight = Object.keys(collections).filter(function(k) {
            return collections[k].daysTill === 0;
        });

        
        if (collectionsTonight.length) {
            /*var collectionMeta = {
                rubbish: ['rubbish','rub_cmt', 'Rubbish bin', 'rub_day'], 
                recycling: ['recycling','rec_cmt', 'Recycling bin', 'rec_day'], 
                green: ['green','grn_cmt', 'Green waste', 'grn_day'] };*/
            $(".info p").html("");
            var text;
            
            for (i=0; i < collectionsTonight.length; i++) {
                //c = collectionMeta[collectionsTonight[i]];
                var cname = collectionsTonight[i];
                var c = collections[cname];
                if (!text) {
                    var d = new Date();
                    d.setHours (d.getHours() - CHANGEOVERHOUR);
                    daynames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                    text = daynames[d.getDay()] +  " night is bin night!<br/>Put out your ";
                }
                var binNames = { 'rubbish': 'Rubbish bin', 'recycling': 'Recycling bin', 'green': 'Green waste' };
                text += binNames[cname].toLowerCase();
                if (i < collectionsTonight.length - 2) {
                    text += ', your ';
                } else if (i == collectionsTonight.length - 2) {
                    text += ' & your ';
                } else {
                    $("#statustext").html(text + "!");
                }
                $(".info." + cname).show();
                comment = c.comment;
                if (!comment) {
                    comment = binNames[cname];
                }
                $(".info." + cname + " p").html(comment);
                $(".info." + cname + " p").append('<br/><a href="' + councilinfo[c.source] +'">More info.</a>');
            };

        } else if (Object.keys(collections).length === 0) {
            // If user lives in a no-data area, leave them with the 'move the marker' sign a bit longer.
            if (locationMarker.manuallyset) {
                $("#statustext").html("Your council's bin nights aren't open data");
                $(".nocoverage").show();
            }
        } else {
            var soonest=999;
            Object.keys(collections).forEach(function (d) {
                if (collections[d].daysTill < soonest) {
                    soonest = collections[d].daysTill;
                    soonestcollection = d;
                }
            });
            if (soonest === 1) {
                $("#statustext").html("Relax. Bin night's <em>tomorrow</em> night!");
            // todo: funny text if bin night was last night.
            } else if (soonest === 999 || soonest === 0) {
                
                $("#statustext").html("Panic. This site is broken.");
            } else {
                $("#statustext").html("Relax. Bin night is " + soonest + " days away.");
            }
        }
    } catch (e) {
        console.log(e);
    }
    
}


$(function() {
    $(".info").hide();
    
    attribution = 'Steve Bennett + Geelong, Wyndham, Golden Plains, Ballarat, Manningham councils';

    tiles['Rubbish'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-rubbish/{z}/{x}/{y}.png?updated=4', { 
        maxZoom: 18, attribution: attribution });
    tiles['Recycling'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-recycling/{z}/{x}/{y}.png?updated=2', { 
        maxZoom: 18, attribution: attribution });
    tiles['Green waste'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-green/{z}/{x}/{y}.png?updated=2', { 
        maxZoom: 18, attribution: attribution });
    tiles['Mapbox'] = L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png', {
        attribution: 'Mapbox, OpenStreetMap'});
    overlays['Suburbs'] = L.tileLayer('http://guru.cycletour.org/tile/Suburbs/{z}/{x}/{y}.png?updated=1', {
        attribution: 'Steve Bennett, OpenStreetMap'});
    overlays['Tips and landfills'] = L.tileLayer('http://guru.cycletour.org/tile/openbinmap-national-db/{z}/{x}/{y}.png');
    overlays['Coverage'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-nocoverage/{z}/{x}/{y}.png?updated=4', {
     opacity: 0.5 });
    map = L.map('map', {layers: [tiles.Mapbox]}).setView([-37.81, 144.5], 9);

    $.getJSON('export/allbins.topojson', null, function(topo) {
        zoneGeo = topojson.feature(topo, topo.objects.allbins);
        checkLocation();
        loadTopoJson(topo);

        L.control.layers(tiles, overlays,  {"collapsed": false}).addTo(map);
        overlays['Rubbish'].addTo(map);
        overlays['Coverage'].addTo(map);
    });
        
    map.locate();
    locationMarker = L.marker(L.latLng(-37.8,144.9), { draggable: true});
    locationMarker.addTo(map);
    locationMarker.on('dragend', function() { locationMarker.manuallyset = true; checkLocation(); });
    map.on('locationfound', function(e) {
        if (locationMarker.manuallyset)
            return;
        locationMarker.setLatLng(e.latlng);
        checkLocation();
    });

});
