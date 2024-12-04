// ============================================================================
// Module      : mymapbox.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : MAPBOX EMBEDDING API
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 17-Oct-20 00:00 WIT   Denis  Deployment V. 2022 "ALEXANDRE DUMAS"
//
// ============================================================================

/*
	<!-- Import mapbox -->
	<link rel='stylesheet' href='https://api.tiles.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css'/>
	<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.js'></script>
	<style>
		.mymapbox-map    { position: absolute; top: 0; bottom: 0; width: 100%; }
		.mymapbox-marker { background-position: center center; background-size: cover; overflow: hidden; content:""; }
	</style>

<!-- Import mapbox -->
<!--
<link rel='stylesheet' href='https://api.tiles.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css'/>
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.js'></script>
<style>
.mymapbox-map    { position: absolute; top: 0; bottom: 0; width: 100%; }
.mymapbox-marker { background-position: center center; background-size: cover; overflow: hidden; content:""; }
</style>
-->
*/

// ****************************************************************************
//
// MAPBOX API
//
// ****************************************************************************

var mymapbox = {

	url_geocoding         : "https://api.mapbox.com/geocoding/v5/mapbox.places/[query].json?limit=[limit]&country=ID&access_token=pk.eyJ1IjoicmFkaWFodWIiLCJhIjoiY2tqbWk5ZDRuMHk4ZDJzczJtZ3hoZG81NCJ9.o8wQYD5YBnDdE2q6oCP-Yg",
	url_reverse_geocoding : "https://api.mapbox.com/geocoding/v5/mapbox.places/[longitude],[latitude].json?limit=[limit]&types=neighborhood&access_token=pk.eyJ1IjoicmFkaWFodWIiLCJhIjoiY2tqbWk5ZDRuMHk4ZDJzczJtZ3hoZG81NCJ9.o8wQYD5YBnDdE2q6oCP-Yg",
	token                 : "pk.eyJ1IjoicmFkaWFodWIiLCJhIjoiY2tqbWk5ZDRuMHk4ZDJzczJtZ3hoZG81NCJ9.o8wQYD5YBnDdE2q6oCP-Yg",

	/*
	Example:
	var query = URLEncode("blok M plaza Jakarta");
	https://api.mapbox.com/geocoding/v5/mapbox.places/blok%20M%20plaza%20Jakarta.json?country=id&proximity=ip&types=place%2Cpostcode%2Caddress&access_token=pk.eyJ1IjoicmFkaWFodWIiLCJhIjoiY2tqbWk5ZDRuMHk4ZDJzczJtZ3hoZG81NCJ9.o8wQYD5YBnDdE2q6oCP-Yg
	*/

	geocoding : (query,limit) => {
		if (typeof limit === "undefined") { limit = 1; }
		return new Promise(
			(resolve, reject) => {
				var url = str_replace("[query]", URLEncode(query), mymapbox.url_geocoding);
				url = str_replace("[limit]", limit, url);
				connect.get(url)
				.then ((res)=>{
					resolve(res);
				})
				.catch(()=>{
					console.log("Rejected by connect.get(url)");
					reject();
				});
			}
		);
	},

	reverse_geocoding : (longitude, latitude, limit) => {
		if (typeof limit === "undefined") { limit = 1; }
		return new Promise(
			(resolve, reject) => {
				var url = str_replace("[longitude]", longitude, mymapbox.url_reverse_geocoding);
				var url = str_replace("[latitude]", latitude, url);
				url = str_replace("[limit]", limit, url);
				connect.get(url)
				.then ((res)=>{

					var neighborhood = res.features[0].text;
					var arr = {
						neighborhood     : neighborhood,
						street_name_no   : "",
						postcode         : "",
						locality         : "",
						city             : "",
						region           : "",
						country          : "",
						approx_longitude : longitude,
						approx_latitude  : latitude
					};
					
					var context = res.features[0]["context"];
					for (var i = 0; i < context.length; i++) {
						var id = context[i]["id"]; id = id.substr(0,id.indexOf("."));
						switch(id) {
							case "postcode" : { arr["postcode"] = context[i]["text"]; break; }
							case "locality" : { arr["locality"] = context[i]["text"]; break; }
							case "place"    : { arr["city"    ] = context[i]["text"]; break; }
							case "region"   : { arr["region"  ] = context[i]["text"]; break; }
							case "country"  : { arr["country" ] = context[i]["text"]; break; }
						}
					}

					resolve(arr);
				})
				.catch(()=>{
					console.log("Rejected by C.get(url)");
					reject();
				});
			}
		);
	}

};


// ****************************************************************************
//
// MARKERS
//
// ****************************************************************************

function TMarker (options)
{
	var that = this;
	this.options = {
		TMap            : null,
		markerID        : "",
		longitude       : 0.0,
		latitude        : 0.0,
		initInCenter    : false,
		backgroundImage : "url('common/fw/img/marker-red.png')",
		backgroundColor : "",
		html            : "",
		width           : "35px",
		height          : "35px",
		anchor          : "bottom",
		borderRadius    : "50%",

		onclick : function(markerID) {
			console.log("IN TMarker.options.onclick() ID='" + markerID + "'");
		}
	};

	for (var i in options) { this.options[i] = options[i]; }
	if (this.options.markerID === "") {
		this.options.markerID = "TMARKER_" + rand_num_str(6);
	}

	console.log(JSON.stringify(this.options));

	this.div = null;

	this.LngLat = function() 
	{
		var result = [that.options.longitude, that.options.latitude];
		return result;
	};

	this.showOnTMap = function(make_it_center) 
	{
		if (typeof make_it_center === "undefined") { make_it_center = false; }
		console.log("IN TMarker.showOnTMap() ID='" + that.options.markerID + "' make_it_center=" + make_it_center);
		if (that.options.TMap !== null) {
			console.log("TMap IS NOT NULL");
			console.log(that.options.TMap.map);
			new mapboxgl.Marker(that.div,{anchor: that.options.anchor})
			.setLngLat(that.LngLat())
			.addTo(that.options.TMap.map);
			console.log("MARKER HAS BEEN SHOWN");
			if (make_it_center) {
				that.options.TMap.map.flyTo({ center: that.LngLat(), essential: false });
			}
		}
		else {
			console.log("TMap IS NULL: Nothing to do");
		}
	};

	this.remove = function() 
	{
		//console.log("IN TMarker.remove() ID='" + that.options.markerID + "'");
		if (that.div !== null) {
			jQuery("#" + that.options.markerID).remove();
			that.div = null;
		}
		else {
			//console.log("Nothing to do");
		}
	};

	this.onclick = function(e) 
	{
		e.stopPropagation(); 
		//console.log("IN TMarker.onclick this.id='" + this.id + "' that.options.markerID='" + that.options.markerID + "'");
		if (typeof that.options.onclick === "function") {
			that.options.onclick(that.options.markerID);
		}
	};

	this.init = function() 
	{
		if (that.div === null) {
			that.div              = document.createElement('div');
			that.div.id           = that.options.markerID;
			that.div.className    = "mymapbox-marker";
			that.div.style.width  = that.options.width;
			that.div.style.height = that.options.height;
			that.div.style.borderRadius = that.options.borderRadius;
			if (strlen(that.options.backgroundColor) > 0) {
				that.div.style.backgroundColor = that.options.backgroundColor;
			}
			if (strlen(that.options.backgroundImage) > 0) {
				that.div.style.backgroundImage = that.options.backgroundImage;
			}
			if (strlen(that.options.html) > 0) {
				that.div.innerHTML = that.options.html;
			}
			that.div.addEventListener("mousedown", that.onclick, false);
			that.showOnTMap(that.options.initInCenter);
		}
	};

	this.update = function(longitude, latitude, make_it_center) 
	{
		if (typeof make_it_center === "undefined") { make_it_center = false; }
		console.log("IN TMarker.update() ID='" + that.options.markerID + "' make_it_center=" + make_it_center);
		if ((longitude !== that.options.longitude) || (latitude !== that.options.latitude)) {
			that.remove();
			that.options.longitude    = longitude;
			that.options.latitude     = latitude;
			that.options.initInCenter = make_it_center;
			that.init();
		}
		else {
			console.log("Nothing to do");
		}
	};

	this.init();
}


// ****************************************************************************
//
// MAPS
//
// ****************************************************************************

function TMap (options)
{
	var that = this;
	this.options = {
		style           : "mapbox://styles/mapbox/streets-v11",
		domID           : "DIVTMap",
		longitude       : 0.0,
		latitude        : 0.0,
		initZoom        : 8
	};

	for (var i in options) { this.options[i] = options[i]; }

	this.map = null;


	this.LngLat = function() {
		var result = [that.options.longitude, that.options.latitude];
		return result;
	};


	this.markers = {
		
		collection : [],

		reset : function() {
			if (that.markers.collection.length > 0) {
				for (var i = 0; i < that.markers.collection.length; i++) {
					var current = 0;
					that.markers.collection[current].remove();
					that.markers.collection.splice(current,1);
				}
				that.markers.collection = [];
			}
		},

		indexOf : function(markerID) {
			for (var i = 0; i < that.markers.collection.length; i++) {
				if (that.markers.collection[i].options.markerID === markerID) {
					return i;
				}
			}
			return -1;
		},

		get : function(markerID) {
			var idx = that.markers.indexOf(markerID);
			if (idx >= 0) {
				return that.markers.collection[idx];
			}
			return null;
		},

		// M : instance of TMarker
		//
		push : function(M, make_it_center) {
			if (typeof make_it_center === "undefined") { make_it_center = false; }
			console.log("IN TMap.markers.push() make_it_center=" + make_it_center);
			//console.log(JSON.stringify(M.options));
			var idx = that.markers.indexOf(M.options.markerID);
			if (idx < 0) {
				M.options.TMap = that;
				that.markers.collection.push(M);
				M.showOnTMap(make_it_center);
			}
		},

		LngLatBounds: function() {
			var bounds = new mapboxgl.LngLatBounds();
			for (var i = 0; i < that.markers.collection.length; i++) {
				bounds.extend(that.markers.collection[i].LngLat());
			}
			return bounds;
		}		

	};


	this.showInCenter = function(markerID) 
	{
		//console.log("IN TMap.markers.showInCenter()");
		var M = that.markers.get(markerID);
		if (M !== null) {
			for (var i = 0; i < that.markers.collection.length; i++) {
				that.markers.collection[i].options.initInCenter = false;
			}
			M.options.initInCenter = true;
			that.map.flyTo({ center: M.LngLat(), essential: false });
		}
	};

	this.setCenter = function(longitude,latitude)
	{
		that.options.longitude = longitude;
		that.options.latitude  = latitude ;
		that.map.flyTo({ center: that.LngLat(), essential: false });
	};

	this.fitBounds = function(padding)
	{
		if (typeof padding === "undefined") { padding = 50; }
		that.map.fitBounds(that.markers.LngLatBounds(), {padding : padding });
	};

	this.on = function(eventName, listener)
	{
		that.map.on(eventName, listener);
	};

	this.off = function(eventName, listener)
	{
		that.map.off(eventName, listener);
	};


	this.init = function() 
	{
		console.log("IN TMap.init()");
		var map_options = {
			container : that.options.domID,
			style     : that.options.style,
			center    : that.LngLat(),
			zoom      : that.options.initZoom
		};
		try {
			console.log(JSON.stringify(map_options));
			console.log(JSON.stringify(mapboxgl));
			that.map = new mapboxgl.Map(map_options);
			console.log("I AM HERE");
			console.log(JSON.stringify(that.map));
		}
		catch(e) {
			console.log("Exception occured");
		}
	};

	this.init();
}


if (typeof mapboxgl !== "undefined") {
	mapboxgl.accessToken = mymapbox.token;
}


// ****************************************************************************
// ****************************************************************************
//
// PICK A LOCATION MANUALLY
//
// ****************************************************************************
// ****************************************************************************

if (typeof mylocation !== "undefined") {
	jQuery.extend(
		mymapbox,
		{
			pick_a_location : function()
			{
				return new Promise(
					(resolve, reject) => {

						let mypage = null, images = [], my_location_map = null, my_location_marker = null;

						let hide = function() 
						{
							console.log("IN mylocation.confirm()->hide()");
							if (mypage !== null) {
								jQuery("#DIV_LOCATION_ON_MYMAPBOX").animate({ "left":"100vw" }, 150, function(){
									delete(images);
									mypage.remove();
								});								
							}
						};

						let cancel = () => { 
							hide();
							reject();
							return false;
						};

						let success = () => {
							var arr = {
								neighborhood     : jQuery("#INP_LOCATION_NEIGHBORHOOD").val(),
								street_name_no   : jQuery("#INP_LOCATION_STREET_NAME_NO").val(),
								postcode         : jQuery("#INP_POSTCODE").val(),
								locality         : jQuery("#INP_LOCATION_LOCALITY").val(),
								city             : jQuery("#INP_LOCATION_CITY").val(),
								region           : jQuery("#INP_LOCATION_REGION").val(),
								country          : jQuery("#INP_COUNTRY").val(),
								approx_longitude : jQuery("#INP_APPROX_LONGITUDE").val(),
								approx_latitude  : jQuery("#INP_APPROX_LATITUDE").val()
							};
							console.log(JSON.stringify(arr));
							hide();
							resolve(arr);
						};

						let clear = function()
						{
							jQuery("#INP_LOCATION_NEIGHBORHOOD").val("");
							jQuery("#INP_LOCATION_STREET_NAME_NO").val("");
							jQuery("#INP_POSTCODE").val("");
							jQuery("#INP_LOCATION_LOCALITY").val("");
							jQuery("#INP_LOCATION_CITY").val("");
							jQuery("#INP_LOCATION_REGION").val("");
							jQuery("#INP_APPROX_LONGITUDE").val("");
							jQuery("#INP_APPROX_LATITUDE").val("");
							jQuery("#INP_COUNTRY").val("");
						};

						let show_step = function(step)
						{
							jQuery(".row-step").removeClass("bg-yellow");
							var id = "DIV_CONT_STEP_" + step;
							jQuery("#" + id).addClass("bg-yellow");
							if (step === "1") {
								clear();
							}
						};

						let do_the_reverse_geocoding = function(longitude,latitude)
						{
							mymapbox.reverse_geocoding(longitude,latitude)
							.then ((arr) => {
								console.log(JSON.stringify(arr));
											
								show_step("2");

								jQuery("#INP_LOCATION_NEIGHBORHOOD").val(arr["neighborhood"]);
								jQuery("#INP_LOCATION_STREET_NAME_NO").val(arr["street_name_no"]);
								jQuery("#INP_POSTCODE").val(arr["postcode"]);
								jQuery("#INP_LOCATION_LOCALITY").val(arr["locality"]);
								jQuery("#INP_LOCATION_CITY").val(arr["city"]);
								jQuery("#INP_LOCATION_REGION").val(arr["region"]);
								jQuery("#INP_APPROX_LONGITUDE").val(arr["approx_longitude"]);
								jQuery("#INP_APPROX_LATITUDE").val(arr["approx_latitude"]);
								jQuery("#INP_COUNTRY").val(arr["country"]);

							})
							.catch(()=>{
								console.log("Rejected by mymapbox.reverse_geocoding()");
							});
						};

						let onshow = function()
						{
							console.log("IN mylocation.confirm().on_show()");
							console.log(pagestack.dump());
							var images = [];
							preload(images)
							.then ((arr) => {
								images = arr;
								var content = file2bin(globalizedFileUri("common/fw/html/location_picker.html"));
								mypage.load.fromHtml(content)
								.then (() => {
									jQuery("#DIV_LOCATION_ON_MYMAPBOX").animate({ "left":"0px" }, 150, function(){

										show_step("1");

										var arr = mylocation.read();
										var mapoptions = {
											style        : "mapbox://styles/mapbox/streets-v11",
											domID        : "MY_LOCATION_MAP",
											longitude    : arr["LngLat"][0],
											latitude     : arr["LngLat"][1],
											initZoom     : 14
										};
										//console.log(JSON.stringify(mapoptions));
										my_location_map = new TMap(mapoptions);

										var markeroptions = {
											TMap         : my_location_map,
											markerID     : "MY_SELECTED_LOCATION",
											longitude    : arr["LngLat"][0],
											latitude     : arr["LngLat"][1],
											initInCenter : false,
											borderRadius : "0px",
											onclick : function(markerID) {
												options.marker.onclick(markerID);
											}
										};
										//console.log(JSON.stringify(mapoptions));
										my_location_map.markers.push(new TMarker(markeroptions), false);

										my_location_map.on("click",function(e){
											var longitude = e.lngLat["lng"];
											var latitude  = e.lngLat["lat"];
											console.log(longitude + "," + latitude);
											var idx = my_location_map.markers.indexOf("MY_SELECTED_LOCATION");
											if (idx >= 0) {
												my_location_map.markers.collection[idx].update(longitude, latitude, true);
											}
										});

										my_location_map.on("dragstart",function(){
											show_step("1");
										});
										/*
										var list = "BTN_GO_LOCATION_OK,"
														 + "#BTN_GO_LOCATION_CLOSE,"
														 + "#BTN_PICK_MY_LOCATION,"
														 + "#BTN_PICK_MARKER_LOCATION";

										jQuery(list).ripple();
										*/
										jQuery("#BTN_GO_LOCATION_OK").off("click").on("click",function(){
											ripple("BTN_GO_LOCATION_OK", success, 200);
										});

										jQuery("#BTN_GO_LOCATION_CLOSE").off("click").on("click",function(){
											ripple("BTN_GO_LOCATION_CLOSE", cancel, 200);
										});

										jQuery("#BTN_PICK_MY_LOCATION").off("click").on("click",function(){
											ripple(
												"BTN_PICK_MY_LOCATION",
												function() {
													var idx = my_location_map.markers.indexOf("MY_SELECTED_LOCATION");
													if (idx >= 0) {
														my_location_map.markers.collection[idx].update(arr["LngLat"][0], arr["LngLat"][1], true);
														var my_selected_location = my_location_map.markers.collection[idx].LngLat();
														console.log(JSON.stringify(my_selected_location));
														do_the_reverse_geocoding(my_selected_location[0],my_selected_location[1]);
													}
												},
												200
											);
										});

										jQuery("#BTN_PICK_MARKER_LOCATION").off("click").on("click",function(){
											ripple(
												"BTN_PICK_MARKER_LOCATION",
												function() {
													var idx = my_location_map.markers.indexOf("MY_SELECTED_LOCATION");
													if (idx >= 0) {
														var my_selected_location = my_location_map.markers.collection[idx].LngLat();
														console.log(JSON.stringify(my_selected_location));
														do_the_reverse_geocoding(my_selected_location[0],my_selected_location[1]);
													}
												},
												200
											);
										});

									});
								})
								.catch(() => {
									console.log("Rejected by page.load.fromHtml()");
								});
							})
							.catch(()=>{
								console.log("Rejected by preload()");
							});
						};

						mypage = new page({
							page_id      : "PAGE_LOCATION_PICKER",
							onshow       : onshow,
							onrefresh    : noop,
							onremove     : noop,
							onbackbutton : cancel,
							usetranslate : false
						});
						mypage.show();

					}
				);
			}
		}
	);
}


// ****************************************************************************
// ****************************************************************************
//
// EDIT AND CONFIRM CURRENT LOCATION
//
// ****************************************************************************
// ****************************************************************************

if (typeof mylocation !== "undefined") {
	jQuery.extend(
		mylocation,
		{
			/*
				options : { logo, marker: { icon, width, height, title, onclick }, data : [text1, text2, ...] }
			*/
			confirm: function(options)
			{
				console.log("IN mylocation.confirm()");
				console.log(JSON.stringify(options));

				return new Promise(
					(resolve, reject) => {

						let mypage = null, images = [], my_location_map = null;

						let hide = function() 
						{
							console.log("IN mylocation.confirm()->hide()");
							if (mypage !== null) {
								jQuery("#DIV_LOCATION_ON_MYMAPBOX").animate({ "left":"100vw" }, 150, function(){
									delete(images);
									mypage.remove();
								});								
							}
						};

						let cancel = () => { 
							hide();
							reject();
							return false;
						};

						let success = () => {
							var arr = {
								neighborhood     : jQuery("#INP_LOCATION_NEIGHBORHOOD").val(),
								street_name_no   : jQuery("#INP_LOCATION_STREET_NAME_NO").val(),
								postcode         : jQuery("#INP_POSTCODE").val(),
								locality         : jQuery("#INP_LOCATION_LOCALITY").val(),
								city             : jQuery("#INP_LOCATION_CITY").val(),
								region           : jQuery("#INP_LOCATION_REGION").val(),
								country          : jQuery("#INP_COUNTRY").val(),
								approx_longitude : jQuery("#INP_APPROX_LONGITUDE").val(),
								approx_latitude  : jQuery("#INP_APPROX_LATITUDE").val()
							};
							console.log(JSON.stringify(arr));
							hide();
							resolve(arr);
						};

						let onshow = function()
						{
							console.log("IN mylocation.confirm().on_show()");
							console.log(pagestack.dump());
							var images = [];
							preload(images)
							.then ((arr) => {
								images = arr;
								var content = file2bin(globalizedFileUri("common/fw/html/location_on_mymapbox.html"));
								mypage.load.fromHtml(content)
								.then (() => {
									jQuery("#DIV_LOCATION_ON_MYMAPBOX").animate({ "left":"0px" }, 150, function(){

										var arr = mylocation.read();
										var mapoptions = {
											style           : "mapbox://styles/mapbox/streets-v11",
											domID           : "MY_LOCATION_MAP",
											longitude       : arr["LngLat"][0],
											latitude        : arr["LngLat"][1],
											initZoom        : 14
										};
										console.log(JSON.stringify(mapoptions));
										my_location_map = new TMap(mapoptions);

										var markeroptions = {
											TMap            : my_location_map,
											markerID        : "ME_AT_MY_LOCATION",
											longitude       : arr["LngLat"][0],
											latitude        : arr["LngLat"][1],
											initInCenter    : true,
											backgroundImage : "url('" + options.marker.icon + "')",
											backgroundColor : "",
											html            : "",
											width           : "80px",
											height          : "48px",
											anchor          : "bottom",
											borderRadius    : "0px",

											onclick : function(markerID) {
												options.marker.onclick(markerID);
											}
										};

										my_location_map.markers.push(new TMarker(markeroptions), false);
										/*
										var list = "#BTN_GO_LOCATION_OK,"
														 + "#BTN_GO_LOCATION_CLOSE,"
														 + "#DIV_CONT_INP_LOCATION_NEIGHBORHOOD,"
														 + "#DIV_CONT_INP_LOCATION_STREET_NAME_NO,"
														 + "#INP_LOCATION_LOCALITY,"
														 + "#INP_LOCATION_CITY,"
														 + "#INP_LOCATION_REGION";
										jQuery(list).ripple();
										*/
										jQuery("#BTN_GO_LOCATION_OK").off("click").on("click",function(){
											ripple("BTN_GO_LOCATION_OK", success, 200);
										});
										jQuery("#BTN_GO_LOCATION_CLOSE").off("click").on("click",function(){
											ripple("BTN_GO_LOCATION_CLOSE", cancel, 200);
										});
										jQuery("#DIV_CONT_INP_LOCATION_NEIGHBORHOOD").off("click").on("click",function(){
											ripple(
												"DIV_CONT_INP_LOCATION_NEIGHBORHOOD",
												function(){ input("INP_LOCATION_NEIGHBORHOOD").then(()=>{}).catch(()=>{});
												},
												200
											);
										});
										jQuery("#DIV_CONT_INP_LOCATION_STREET_NAME_NO").off("click").on("click",function(){
											ripple(
												"DIV_CONT_INP_LOCATION_STREET_NAME_NO",
												function(){ input("INP_LOCATION_STREET_NAME_NO").then(()=>{}).catch(()=>{});
												},
												200
											);
										});
										jQuery("#DIV_CONT_INP_LOCATION_LOCALITY").off("click").on("click",function(){
											ripple(
												"DIV_CONT_INP_LOCATION_LOCALITY",
												function(){ input("INP_LOCATION_LOCALITY").then(()=>{}).catch(()=>{});
												},
												200
											);
										});
										jQuery("#DIV_CONT_INP_LOCATION_CITY").off("click").on("click",function(){
											ripple(
												"DIV_CONT_INP_LOCATION_CITY",
												function(){ input("INP_LOCATION_CITY").then(()=>{}).catch(()=>{});
												},
												200
											);
										});
										jQuery("#DIV_CONT_INP_LOCATION_REGION").off("click").on("click",function(){
											ripple(
												"DIV_CONT_INP_LOCATION_REGION",
												function(){ input("INP_LOCATION_REGION").then(()=>{}).catch(()=>{});
												},
												200
											);
										});

										/*
										var arr = JSON.parse('{"neighborhood":"Pondok Cabe Ilir","street_name_no":"","postcode":"15418","locality":"Pamulang","city":"Tangerang Selatan","region":"Banten","country":"Indonesia","approx_longitude":106.7746961,"approx_latitude":-6.3294574}');
										*/
										mymapbox.reverse_geocoding(arr["LngLat"][0], arr["LngLat"][1])
										.then ((arr) => {
											console.log(JSON.stringify(arr));
											
											jQuery("#INP_LOCATION_NEIGHBORHOOD").val(arr["neighborhood"]);
											jQuery("#INP_LOCATION_STREET_NAME_NO").val(arr["street_name_no"]);
											jQuery("#INP_POSTCODE").val(arr["postcode"]);
											jQuery("#INP_LOCATION_LOCALITY").val(arr["locality"]);
											jQuery("#INP_LOCATION_CITY").val(arr["city"]);
											jQuery("#INP_LOCATION_REGION").val(arr["region"]);
											jQuery("#INP_APPROX_LONGITUDE").val(arr["approx_longitude"]);
											jQuery("#INP_APPROX_LATITUDE").val(arr["approx_latitude"]);
											jQuery("#INP_COUNTRY").val(arr["country"]);

										})
										.catch(()=>{
											console.log("Rejected by mymapbox.reverse_geocoding()");
										});
									});
								})
								.cach(() => {
									console.log("Rejected by page.load.fromHtml()");
								});
							})
							.catch(()=>{
								console.log("Rejected by preload()");
							});
						};

						mypage = new page({
							page_id      : "PAGE_LOCATION_ON_MYMAPBOX",
							onshow       : onshow,
							onrefresh    : noop,
							onremove     : noop,
							onbackbutton : cancel,
							usetranslate : false
						});
						mypage.show();
					}
				);
			}
		}
	);
}



// End of file: mymapbox.js
// ============================================================================