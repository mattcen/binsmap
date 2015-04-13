/*
TODO:
- calculate "next bin night"
- special handling for the day after bin night - maybe it's not too late?
- when you zoom in far you lose your marker
- clickable areas - maybe instead of dragging marker
- have layer control always open?
- update spec to allow per-type info
- add bookmarks like #wyndham, #tuesday
- show suburb boundaries (per @mattcen)
- "powered by OpenCouncilData tag"?
*/
var layer;
var map;
var zone = {};
var tiles={};
var zoneGeo;
var locationMarker;

var councilinfo = {
    'Geelong': 'http://www.geelongaustralia.com.au/residents/waste/default.aspx',
    'Wyndham': 'https://www.wyndham.vic.gov.au/waste/kerbside_collections',
    'Manningham': 'http://www.manningham.vic.gov.au/waste-and-recycling',
    'Golden Plains': 'http://www.goldenplains.vic.gov.au/garbageandrecycling',
    'Ballarat': 'http://www.ballarat.vic.gov.au/ps/waste.aspx'
}




function isBinNight(startdate, weekinterval) {
    if (!startdate || !weekinterval) {
        return false;
    }
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //var today = new Date(now.getFullYear(), now.getMonth(), 14);
    var tomorrow = today;
    // If it's after 8am, then we're talking about tomorrow's bin night.
    if (now.getHours() > 8) {
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

mystyle = function(f) {
    if (!f.properties.rub_day) {
        return { opacity: 0, fillOpacity: 0 }; // probably should be a filter
    }
    p = f.properties;
    if (p.rub_start && isBinNight(p.rub_start, p.rub_weeks)) {
        return { color: "red", fillColor: "red" }
    } else if (p.rec_start && isBinNight(p.rec_start, p.rec_weeks)) {
        return { color: "yellow", fillColor: "yellow" }
    } else if (p.grn_start && isBinNight(p.grn_start, p.grn_weeks)) {
        return { color: "green", fillColor: "green" }
    } else{
        return { 
            color: '#333',
            fillColor: '#eee',
            opacity: 1,
            weight: 1
        };
    }
}

var nottonight = {
    fillOpacity: 0,
    color: '#333',
    weight: 1

}

rubbishstyle = function(f) {
    p = f.properties;
    if (isBinNight(p.rub_start, p.rub_weeks)) {
        return { color: "darkred", fillColor: "red", fillOpacity:0.7, weight: 2, }
    } else return nottonight;
}
recstyle = function(f) {
    p = f.properties;
    if (isBinNight(p.rec_start, p.rec_weeks)) {
        return { color: "brown", fillColor: "yellow", fillOpacity:0.7, weight: 2 }
    } else return nottonight;
}
greenstyle = function(f) {
    p = f.properties;
    if (isBinNight(p.grn_start, p.grn_weeks)) {
        return { color: "darkgreen", fillColor: "green", fillOpacity:0.7, weight: 2 }
    } else return nottonight;
}

function loadTopoJson(t) {
    zone['Rubbish'] = L.geoJson(zoneGeo, {

        style: rubbishstyle,
        filter: function(f) {
            return !!f.properties.rub_day;
        }
        
    });
    zone['Recycling'] = L.geoJson(zoneGeo, {
        style: recstyle,
        filter: function(f) {
            return !!f.properties.rec_day;
        }
        
    });
    zone['Green waste'] = L.geoJson(zoneGeo, {
        style: greenstyle,
        filter: function(f) {
            return !!f.properties.grn_day;
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
                daynames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                text = daynames[new Date().getDay()] +  " night is bin night!<br/>Put out your ";
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

    tiles['Rubbish'] = L.tileLayer('http://guru.cycletour.org/tilelive/binzones/{z}/{x}/{y}.png?updated=1', { 
        maxZoom: 18, attribution: attribution });
    tiles['Recycling'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-recycling/{z}/{x}/{y}.png?updated=1', { 
        maxZoom: 18, attribution: attribution });
    tiles['Green waste'] = L.tileLayer('http://guru.cycletour.org/tile/openbins-green/{z}/{x}/{y}.png?updated=1', { 
        maxZoom: 18, attribution: attribution });
    tiles['Mapbox'] = L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.map-i87786ca/{z}/{x}/{y}.png', {
        attribution: 'Mapbox, OpenStreetMap'});
    map = L.map('map', {layers: [tiles.Mapbox]}).setView([-37.81, 144.5], 10);
    $.getJSON('export/allbins.topojson', null, function(topo) {
        //console.log(e);
         
        zoneGeo = topojson.feature(topo, topo.objects.allbins);
        checkLocation();
        loadTopoJson(topo);
        L.control.layers(tiles, zone).addTo(map);
        zone['Rubbish'].addTo(map);
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