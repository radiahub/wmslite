var mylocation = {

	initialized: false, updated: "", position: null,


	LngLat: function (longitude, latitude)
	{
		return [longitude, latitude];
	},


	// mylocation stores a JSON-stringified plain object with 2 elements:
	// updated : instant, at which the location was updated,
	// LngLat  : array with longitude, latitude information
	//
	read : function()
	{
		try {
			var arr = storage.get("mylocation");
			if (val.isset(arr) && (arr !== false)) {
				if (is_json(arr)) { arr = JSON.parse(arr); }
				return arr;
			}
			else {
				return null;
			}
		}
		catch(e) {
			console.log("Runtime error");
			console.log(JSON.stringify(e));
			return null;
		}
	},


	// mylocation stores a JSON-stringified plain object with 2 elements:
	// updated : instant, at which the location was updated,
	// LngLat  : array with longitude, latitude information
	//
	write : function(longitude, latitude)
	{
		try {
			var arr = {
				updated : datetime.sql(),
				LngLat  : mylocation.LngLat(longitude, latitude)
			};
			storage.set("mylocation", JSON.stringify(arr));
			return arr;
		}
		catch(e) {
			console.log("Runtime error");
			console.log(JSON.stringify(e));
			return null;
		}
	},


	// Resolve mylocation.position object with structure as defined in plugin
	// cordova-plugin-geolocation
	// Stores the location information in local storage if long,lat info is available
	// Returns promise containing simple location object as stored locally
	//
	get : function() {

		return new Promise(
			(resolve, reject) => {

				console.log("IN mylocation.get()");

				navigator.geolocation.getCurrentPosition(
					function(GeolocationPosition) {

						var position = {};

						if ('coords' in GeolocationPosition) {
							position.coords = {};
							if ('latitude' in GeolocationPosition.coords) {
								position.coords.latitude = GeolocationPosition.coords.latitude;
							}
							if ('longitude' in GeolocationPosition.coords) {
								position.coords.longitude = GeolocationPosition.coords.longitude;
							}
							if ('accuracy' in GeolocationPosition.coords) {
								position.coords.accuracy = GeolocationPosition.coords.accuracy;
							}
							if ('altitude' in GeolocationPosition.coords) {
								position.coords.altitude = GeolocationPosition.coords.altitude;
							}
							if ('altitudeAccuracy' in GeolocationPosition.coords) {
								position.coords.altitudeAccuracy = GeolocationPosition.coords.altitudeAccuracy;
							}
							if ('heading' in GeolocationPosition.coords) {
								position.coords.heading = GeolocationPosition.coords.heading;
							}
							if ('speed' in GeolocationPosition.coords) {
								position.coords.speed = GeolocationPosition.coords.speed;
							}
						}

						if ('timestamp' in GeolocationPosition) {
							position.timestamp = GeolocationPosition.timestamp;
						}

					//console.log(JSON.stringify(position)); 

						mylocation.initialized = true;
						mylocation.updated = datetime.sql();
						mylocation.position = position;

						var result = null;
						if ((val.isset(position.coords)) && (val.isset(position.coords.longitude)) && (val.isset(position.coords.latitude))) {
							mylocation.write(position.coords.longitude,position.coords.latitude);
							result = mylocation.LngLat(position.coords.longitude,position.coords.latitude);
						}
						resolve(result);
					},
					function (error) {
						try {
							console.log ('navigator.geolocation.getCurrentPosition error ' + error.code + ': ' + error.message);
							reject();
						}
						catch(e) {
							console.log("Runtime error");
							reject();
						}
      		},
      		{ 
						enableHighAccuracy : true 
					}
				);
			}
		);
	},


	watch : {

		timer : null, timeout : (1 * 10000),

		ongoing : function() {
			return (mylocation.watch.timer !== null);
		},

		stop : function() {
			clearTimeout(mylocation.watch.timer);
			mylocation.watch.timer = null;
		},

		start : function(intervalInMilliseconds) {
			mylocation.watch.timeout = intervalInMilliseconds;
			mylocation.get()
			.then (() => { mylocation.watch.timer = setTimeout(mylocation.watch.start, mylocation.watch.timeout); })
			.catch(() => { mylocation.watch.timer = setTimeout(mylocation.watch.start, mylocation.watch.timeout); });
		}

	},


	// Compute a list of closest cities near the current geographical 
	// location using ip2location data table
	//
	// Returns array of row cities and distances in KM
	//
	nearby : function(longitude, latitude, db5_tablename)
	{
		return new Promise(
			(resolve, reject) => {

				if (typeof db5_tablename === "undefined") { db5_tablename = "db5_indonesia"; }
				console.log("IN mylocation.nearby() db5_tablename='" + db5_tablename + "'");
				console.log(longitude, latitude);

				var do_the_search = function(lnglat) {
					console.log("IN mylocation.nearby()->do_the_search()");
					console.log(JSON.stringify(lnglat));
					var lon = lnglat[0], lat = lnglat[1];

					var q = "SELECT latitude, longitude, ctrycode, ctryname, region, city, "
								+ "ACOS(SIN(RADIANS(latitude))*SIN(RADIANS(" + lat + "))+COS(RADIANS(latitude))*COS(RADIANS(" + lat + "))*COS(RADIANS(" + lon + ")-RADIANS(longitude)))*6371 as distance "
								+ "FROM " + db5_tablename + " "
								+ "ORDER BY distance LIMIT 5 ";

					console.log(q);

					xdbref.rows("radiahub", q)
					.then ((rows)=>{
						resolve(rows);
					})
					.catch(()=>{
						console.log("Rejected by xdbref.rows()");
						reject();
					});
				};

				if ((typeof longitude !== "undefined") && (typeof latitude !== "undefined")) {
					console.log("LngLat defined");
					var lnglat = mylocation.LngLat(longitude, latitude);
					console.log(JSON.stringify(lnglat));
					do_the_search(lnglat);
				}
				else {
					mylocation.get()
					.then ((lnglat)=>{
						do_the_search(lnglat);
					})
					.catch(()=>{
						console.log("Rejected by mylocation.get()");
						reject();
					});
				}

			}
		);
	},


	// Resolves an initial LngLat [long,lat] array as following:
	//
	// if (force === true) : the latest accurate location information as acquired from
	// the device, and the mylocation.position object is initialized,
	// else : the latest stored (acquired) location information by the application, and 
	// the mylocation.position object is NOT initialized
	//
	// Updates mylocation.updated accordingly
	//
	// Returns Promise, parameter of "resolve" callback is the initial LngLat[long,lat] 
	// array as described above
	//
	init : (force) => {

		if (typeof force === "undefined") { force = false; }

		return new Promise(
			(resolve, reject) => {

				var cancel = function() {
					reject();
				};

				var acquire = function() {
					mylocation.get()
					.then((LngLat) => { 
					//console.log("Resolved by mylocation.get()");
						console.log(JSON.stringify(LngLat));
						resolve(LngLat); 
					})
					.catch(()=>{
						console.log("Rejected by mylocation.get()");
						confirm(R.get("turn_on_location"),R.get("required"),R.get("retry"),R.get("cancel"),acquire,cancel);							
					});
				};

				if (force) {
					acquire();
				}
				else {
					var arr = mylocation.read();
					if (arr !== null) {
						mylocation.updated = arr["updated"];
						resolve(arr["LngLat"]);
					}
					else {
						acquire();
					}
				}
			}
		);
	}

}


// End of file: mylocation.js
