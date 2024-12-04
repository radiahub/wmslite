// ============================================================================
// Module      : globalization.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Globalization support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var globalizedSupport = ["EN","ID"];
var globalizedDefault = "EN";

const globalizedLang = () => {
	var lang = globalizedDefault;
	if (window.Intl && typeof window.Intl === 'object') {
		lang = navigator.language;
		lang = lang.toUpperCase(); lang = lang.slice(0,2);
		if (globalizedSupport.indexOf(lang) < 0) { lang = globalizedDefault; }
	}
	//console.log(lang);
	return lang;
};

const globalizedFileUri = (fileURI) => {
	var result = fileURI;
	var lang_ = globalizedLang();
	let p = fileURI.lastIndexOf("/");
	if (p > 0) {
		result = fileURI.substr(0,p) + "/" + lang_ + fileURI.substr(p);
	}
	else if (p === 0) {
		result = lang_ + fileURI;
	}
	else {
		result = lang_ + "/" + fileURI;
	}
	return result;
};


var R = {

	collection : [],

	indexOf : (id) => {
		//console.info("IN R.indexOf() id='" + id + "'");
		for (var i = 0; i < R.collection.length; i++) {
			//console.log(JSON.stringify(R.collection[i]));
			if (R.collection[i]["id"] === id) {
				return i;
			}
		}
		return -1;
	},


	reg : (fileURL, host) => {

		//console.info("IN R.reg() fileURL='" + fileURL + "' host='" + host + "'");
		var result = true;
		
		try {
			fileURL = globalizedFileUri(fileURL);
			//console.log(fileURL);			
			var content = fgets(fileURL, host);
			if (is_json(content)) { content = JSON.parse(content); }
			if (content !== null) {
				for (var i = 0; i < content.length; i++) {
					if (i < 5) {
						//console.log(JSON.stringify(content[i]));
					}
					var idx = R.indexOf(content[i]["id"]);
					if (idx >= 0) {
						R.collection[idx]["value"] = content[i]["value"];
					}
					else {
						R.collection.push(content[i]);
					}
				}
			}
			else {
				result = false;
			}
		}
		catch(e) {
			result = false;
		}

		return result;
	},


	get : (id) => {
		//console.log(id);
		let idx = R.indexOf(id);
		//console.log(idx);
		if (idx >= 0) { return R.collection[idx]["value"]; }
		return id;
	}

};


// End of file: globalization.js
// ============================================================================