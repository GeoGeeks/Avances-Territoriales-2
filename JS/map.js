//URL prueba: 
//http://localhost/DNP2?sector=23&indicador=3348&periodo=2010
var map, legend, ballLayer, entro = false;
require([
		"esri/map",
		"esri/dijit/HomeButton",
		"esri/InfoTemplate",
		"esri/layers/FeatureLayer",
		"dojo/domReady!"
	], function(
			Map,
			HomeButton,
			InfoTemplate,
			FeatureLayer
	) {

	map = new Map("mapDiv", {
		basemap: "gray",
    	center: [-73.660568, 4.228752],
    	zoom: 5,
    	sliderStyle: "large",
    	sliderPosition: 'bottom-left',
    	maxZoom: 8,
  		minZoom: 4
	});
	
	var home = new HomeButton({
		map: map
	}, "HomeButton");
	home.startup();

	layer = new FeatureLayer("http://sig.dnp.gov.co/arcgis/rest/services/SINERGIA/DANE_POBLACIONTOTAL2010_2015/MapServer/0", {
		"mode": FeatureLayer.ONDEMAND,
		"outFields": [],
		"opacity": 0.5
	});
	map.addLayer(layer);
	cargarValores();
});

function getUrlParameter(sParam){
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) 
	{
	    var sParameterName = sURLVariables[i].split('=');
	    if (sParameterName[0] == sParam) 
	    {
	        return sParameterName[1];
	    }
	}
	return 0;
} 

function cargarValores(){
  var sector = getUrlParameter("sector");
  var indicador = getUrlParameter("indicador");
  var fecha = getUrlParameter("periodo");
  require([
    "esri/layers/FeatureLayer",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "dojo/parser",
    "esri/InfoTemplate",
    "dojo/number",
    "dojo/dom",
  	"dojo/domReady!"
  ], function(FeatureLayer, Query, QueryTask, parser, InfoTemplate, number, dom){
		if(entro)
			map.removeLayer(ballLayer);
		entro = true;
		var templateBalls = new InfoTemplate("${Nombre}", "${Indicador}" + " "+ fecha + ": ${Valor:NumberFormat(places:2)}");

		ballLayer = new FeatureLayer("http://sig.dnp.gov.co/arcgis/rest/services/SINERGIA/Capitales/MapServer/0",{
			mode: FeatureLayer.ONDEMAND,
			outFields: ["*"],
			infoTemplate: templateBalls
		});

		ballLayer.setDefinitionExpression("IdSector="+sector+" AND IdVariable="+indicador+" AND Año ="+fecha);

		myFeatureLayer = new QueryTask("http://sig.dnp.gov.co/arcgis/rest/services/SINERGIA/Capitales/MapServer/0");
		var query = new Query();
		query.returnGeometry = false;
		query.outFields = ["Valor"];
		query.orderByFields = ["Valor DESC"];
		query.where = "IdSector="+sector+" AND IdVariable="+indicador+" AND Año ="+fecha
		var MaxQuery  = myFeatureLayer.execute(query);
		MaxQuery.then(showResults1);

		function showResults1(results) {
			var max = results.features[0].attributes;
			var sizeInfo = {
				field:"Valor",
				valueUnit: "meters",
				minSize: 5,
				maxSize: 20,
				minDataValue: 0,
				maxDataValue: max.Valor,
			};

			ballLayer.renderer.setSizeInfo(sizeInfo);
			map.addLayer(ballLayer);
        }
	});
}