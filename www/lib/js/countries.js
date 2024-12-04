// ============================================================================
// Module      : countries.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Countries and phone code support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var countries = {

	collection : null,

	// **************************************************************************
	// **************************************************************************
	//
	// SEARCH
	//
	// **************************************************************************
	// **************************************************************************

	indexOf : function(key)
	{
		console.info("IN countries.indexOf() key='" + key + "'");
		key = str_replace("+", "", key);
		key = str_replace("-", "", key);
		console.log(key);
		
		if (countries.collection === null) {
			countries.init();
		}

		if (is_num(key)) {
			for (var i = 0; i < countries.collection.length; i++) {
				var code = str_replace("-", "", countries.collection[i]["code"]);
				if (key === code) {
					return i;
				}
			}
		}
		else if (strlen(key) > 2) {
			for (var i = 0; i < countries.collection.length; i++) {
				if (strmatch(key, countries.collection[i]["country"])) {
					return i;
				}				
			}
		}
		else if (strlen(key) === 2) {
			for (var i = 0; i < countries.collection.length; i++) {
				if (strcasecmp(key, countries.collection[i]["iso"]) === 0) {
					return i;
				}
			}
		}

		return -1;
	},


	// **************************************************************************
	// **************************************************************************
	//
	// RUNTIME API
	//
	// **************************************************************************
	// **************************************************************************

	national_phone_code : function(phone_no)
	{
		console.info("IN countries.national_phone_code() phone_no='" + phone_no + "'");

		var get_sorted_list = function()
		{
			var compare = function(a, b) {
				//return strcmp(a.code, b.code);
				return strcmp(b.code, a.code);
			};

			var sorted = clone(countries.collection);
			sorted.sort(compare);
			//sorted.reverse();
			/*
			for (var i = 0; i < 5; i++) {
				console.log(JSON.stringify(sorted[i]));
			}
			*/
			return sorted;
		};

		if (countries.collection === null) {
			countries.init();
		}

		var sorted = get_sorted_list();
		for (var i = 0; i < 5; i++) {
			console.log(JSON.stringify(sorted[i]));
		}

		phone_no = msisdn.format(phone_no);
		if (phone_no.slice(0, 1) === "+") {
			phone_no = phone_no.slice(1);
		}

		for (var i = 0; i < sorted.length; i++) {
			if (strmatch(phone_no, sorted[i]["code"])) {
				return clone(sorted[i]);
			}
		}

		return null;
	},

	split_phone_number : function(phone_no) 
	{
		console.info("IN countries.split_phone_number() phone_no='" + phone_no + "'");

		var arr = countries.national_phone_code(phone_no);
		if (arr !== null) {

			phone_no = msisdn.format(phone_no);
			if (phone_no.slice(0, 1) === "+") {
				phone_no = phone_no.slice(1);
			}

			var number = phone_no.slice(strlen(arr["code"]));

			var result = {
				phone_no : phone_no,
				code     : arr["code"],
				country  : arr["country"],
				iso      : arr["iso"],
				number   : number
			};

			//console.log(JSON.stringify(result));
			return result;
		}

		return null;
	},


	// **************************************************************************
	// **************************************************************************
	//
	// INITIALIZATION
	//
	// **************************************************************************
	// **************************************************************************

	init : function()
	{
		console.info("IN countries.init()");
		var filename = "lib\countries.json";
		var json = file2bin(filename);
		if (is_json(json)) { json = JSON.parse(json); };
		for (var i = 0; i < json.length; i++) {
			json[i]["code"] = str_replace("-", "", json[i]["code"]);
		}
		countries.collection = clone(json);
		/*
		for (var i = 0; i < 5; i++) {
			console.log(JSON.stringify(countries.collection[i]));
		}
		*/
		jQuery.extend(
			val,
			{
				// id : DOM ID of the <select> control to receive the countries data
				// returnType: one of "ISO", "CODE", "COUNTRYNAME" string value
				//
				selectcountry : function(id, returnType)
				{
					if (typeof returnType === "undefined") { returnType = "ISO"; }
					console.info("IN val.selectcountry() id='" + id + "' returnType='" + returnType + "'");

					var htmlOption = '<option value="[value]">[caption]</option>';

					switch(returnType.toUpperCase()) {

						case "ISO" : {
							for (var i = 0; i < countries.collection.length; i++) {
								var html = htmlOption;
								html = str_replace("[value]",   countries.collection[i]["iso"],     html);
								html = str_replace("[caption]", countries.collection[i]["country"], html);
								jQuery("#" + id).append(html);
							}
							setTimeout(
								function() { val.select(id, COUNTRY_ISO_2LTR); },
								200
							);
							break;
						}

						case "CODE": {
							for (var i = 0; i < countries.collection.length; i++) {
								var html = htmlOption;
								var code = countries.collection[i]["code"];
								code = str_replace("-", "", code);
								//code = "+" + code;
								html = str_replace("[value]", code, html);
								html = str_replace("[caption]", countries.collection[i]["country"], html);
								jQuery("#" + id).append(html);
							}
							setTimeout(
								function() { 
									var dum = str_replace("+", "", ST_PHONE_CTRY_CODE);
									val.select(id, dum);
									
								},
								200
							);
							break;
						}

						case "COUNTRYNAME": 
						default : {
							for (var i = 0; i < countries.collection.length; i++) {
								var html = htmlOption;
								html = str_replace("[value]",   countries.collection[i]["country"], html);
								html = str_replace("[caption]", countries.collection[i]["country"], html);
								jQuery("#" + id).append(html);
							}
							setTimeout(
								function() { val.select(id, COUNTRY_NAME); },
								200
							);
							break;
						}
					}
				}
			}
		);

	}

};


// End of file: countries.js
// ============================================================================