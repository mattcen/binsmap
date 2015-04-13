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
var zone = {};
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
    'Colac Otway': 'http://www.colacotway.vic.gov.au/Page/page.asp?Page_Id=3278&h=0'
}




function isBinNight(startdate, weekinterval) {
    if (!startdate || !weekinterval) {
        return false;
    }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //var today = new Date(now.getFullYear(), now.getMonth(), 14);
    var tomorrow = today;
    
    if (now.getHours() > CHANGEOVERHOUR) {
       tomorrow = new Date(today.getTime() + 86400000);
    }   
    // loading a UTC YYYY-MM-DD date means getting UTC midnight. We don't want that.
    then = new Date(startdate.replace(/-/g, '/'));
    if (then.getDay() === tomorrow.getDay()) {
        // Math.floor to take care of possible 1-hour timezone shift.
        // TODO: worry about interstate garbage zones. Maybe UTC is better...
        weeks = Math.floor((tomorrow-then)/86400000)/7;
        if (weeks % weekinterval=== 0) {
            return true;
        }
        // probably next week, not today.

    }
    return false;
 
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

function loadTopoJson(t) {
    zone['Rubbish'] = L.geoJson(zoneGeo, {

        style: rubbishstyle,
        filter: function(f) {
            return !!f.properties.rub_day;
        },
        onEachFeature: function(f, l) {
            l.on('click', clickedAZone);
        }
        
    });
    
    zone['Recycling'] = L.geoJson(zoneGeo, {
        style: recstyle,
        filter: function(f) {
            return !!f.properties.rec_day;
        },
        onEachFeature: function(f, l) {
            l.on('click', clickedAZone);
        }
        
    });
    zone['Green waste'] = L.geoJson(zoneGeo, {
        style: greenstyle,
        filter: function(f) {
            return !!f.properties.grn_day;
        },
        onEachFeature: function(f, l) {
            l.on('click', clickedAZone);
        }
        
    });


}

function checkLocation() {
    if (!locationMarker || !zoneGeo) {
        return;
    }
    var collections=[];
    var collectioninfo = {};
    var hasdata = false;
    $(".info").hide();
    try {
        locationGeo = turf.point([locationMarker.getLatLng().lng, locationMarker.getLatLng().lat]);
        zoneGeo.features.forEach(function(zone) {
            p = zone.properties;
            if (!turf.inside(locationGeo, zone))
                return;
            hasdata = true;
            if (isBinNight(p.rub_start, p.rub_weeks)) {
                collectioninfo.rubbish = p;
            }
            if (isBinNight(p.rec_start, p.rec_weeks)) {
                collectioninfo.recycling = p;
            }
            if (isBinNight(p.grn_start, p.grn_weeks)) {
                collectioninfo.green = p;
            }
        });
    } catch (e) {
        console.log(e);
    }
    collections = Object.keys(collectioninfo);
    if (collections.length) {
        var collectionMeta = {
            rubbish: ['rubbish','rub_cmt', 'Rubbish bin', 'rub_day'], 
            recycling: ['recycling','rec_cmt', 'Recycling bin', 'rec_day'], 
            green: ['green','grn_cmt', 'Green waste', 'grn_day'] };
        $(".info p").html("");
        var text;
        //var text ="It's bin night!<br/>Put out your ";
        for (i=0; i < collections.length; i++) {
            c = collectionMeta[collections[i]];
            if (!text) {
                var d = new Date();
                d.setHours (d.getHours() - CHANGEOVERHOUR);
                daynames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                text = daynames[d.getDay()] +  " night is bin night!<br/>Put out your ";
            }
            text += c[2].toLowerCase();
            if (i == collections.length - 2) {
                text += ' & your ';
            } else if (i < collections.length - 2) {
                text += ', your ';
            } else {
                $("#statustext").html(text + "!");
            }
            $(".info." + c[0]).show();
            comment = collectioninfo[c[0]][c[1]];
            if (!comment) {
                comment = c[2];
            }
            $(".info." + c[0] + " p").html(comment);
            $(".info." + c[0] + " p").append('<br/><a href="' + councilinfo[collectioninfo[c[0]].source] +'">More info.</a>');
        };

        //alert ("It's bin night in " + zone.properties.source + "'s "+ zone.properties.name);
    } else if (!hasdata) {
        // If user lives in a no-data area, leave them with the 'move the marker' sign a bit longer.
        if (locationMarker.manuallyset) {
            $("#statustext").html("I have no idea if it's bin night.<br/> Ask your council to go to <a href='http://opencouncildata.org'>opencouncildata.org</a>.");
        }
    } else {
        $("#statustext").html("Relax. It's not bin night!");
    }
    
}


$(function() {
    $(".info").hide();
    
    attribution = 'Steve Bennett + Geelong, Wyndham, Golden Plains, Ballarat, Manningham councils';

    tiles['Rubbish'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-rubbish/{z}/{x}/{y}.png?updated=2', { 
        maxZoom: 18, attribution: attribution });
    tiles['Recycling'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-recycling/{z}/{x}/{y}.png?updated=2', { 
        maxZoom: 18, attribution: attribution });
    tiles['Green waste'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-green/{z}/{x}/{y}.png?updated=2', { 
        maxZoom: 18, attribution: attribution });
    tiles['Mapbox'] = L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png', {
        attribution: 'Mapbox, OpenStreetMap'});
    zone['Suburbs'] = L.tileLayer('http://115.146.94.49/tile/Suburbs/{z}/{x}/{y}.png?updated=1', {
        attribution: 'Steve Bennett, OpenStreetMap'});
    map = L.map('map', {layers: [tiles.Mapbox]}).setView([-37.81, 144.5], 10);
    $.getJSON('export/allbins.topojson', null, function(topo) {
        //console.log(e);
         
        zoneGeo = topojson.feature(topo, topo.objects.allbins);
        checkLocation();
        loadTopoJson(topo);

        L.control.layers(tiles, zone,  {"collapsed": false}).addTo(map);
        zone['Rubbish'].addTo(map);
        //zone['Suburbs'].addTo(map);
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