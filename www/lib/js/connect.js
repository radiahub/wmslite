// ============================================================================
// Module      : connect.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : General
// Description : AJAX connector
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var connect = {

	// **************************************************************************
	// **************************************************************************
	//
	// online/offline messages
	//
	// **************************************************************************
	// **************************************************************************

	toast : {

		time : 7500,

		html : '<div id="DIV_CONNECT_TOAST" class="page-docking-bottom flex-middle [bg-color] fg-white h5" style="height:2.0rem; z-index:25510;">'
				 + '[caption]'
				 + '</div>',

		showing: false,

		show : function(bg_color, caption) {
			//console.info("IN connect.toast.show()");
			if (connect.toast.showing) {
				jQuery("#DIV_CONNECT_TOAST").remove();
			}
			var _html = connect.toast.html;
			_html = str_replace("[bg-color]", bg_color, _html);
			_html = str_replace("[caption]",  caption,  _html);
			//console.log(strlen(_html));
			jQuery("body").append(_html);
			connect.toast.showing = true;
			setTimeout(
				function(){ 
					//console.log("Removing connect.toast");
					jQuery("#DIV_CONNECT_TOAST").remove(); 
					connect.toast.showing = false; 
				}, 
				connect.toast.time
			);
		},

		offline : function() {
			//console.info("IN connect.toast.offline()");
			var bg_color = "bg-black";
			var caption  = "No connection";
			connect.toast.show(bg_color, caption);
		},

		online : function() {
			//console.info("IN connect.toast.online()");
			var bg_color = "bg-green";
			var caption  = "Back online";
			connect.toast.show(bg_color, caption);
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// connection
	//
	// **************************************************************************
	// **************************************************************************
	/*
	Returns one of following constants:
	
	Connection.UNKNOWN, Connection.ETHERNET, Connection.WIFI, Connection.CELL_2G,
	Connection.CELL_3G, Connection.CELL_4G,  Connection.CELL, Connection.NONE

	or null on error
	*/
	connection: function()
	{
		//console.info("IN connect.connection()");
		if ((typeof cordova == "object") || (window.hasOwnProperty("cordova"))) {
			if ((typeof navigator.connection !== "undefined") && (typeof Connection !== "undefined")) {
				try {
					switch (navigator.connection.type) {
						case Connection.NONE:     { return "NONE";     }
						case Connection.ETHERNET: { return "ETHERNET"; }
						case Connection.WIFI:     { return "WIFI";     }
						case Connection.CELL_2G:  { return "CELL_2G";  }
						case Connection.CELL_3G:  { return "CELL_3G";  }
						case Connection.CELL_4G:  { return "CELL_4G";  }
						case Connection.CELL:     { return "CELL";     }
						case Connection.UNKNOWN:  { return "UNKNOWN";  }
					}
					return null;
				}
				catch(e) {
					return null;
				}
			}
			else {
				return "UNKNOWN";
			}
		}
		else {
			return "UNKNOWN";
		}
	},

	connected : function()
	{
		//console.info("IN connect.connected()");
		var dummy = connect.connection();
		//console.log(dummy);
		if ((dummy !== null) && (strcasecmp(dummy, "NONE") !== 0)) {
			return true;
		}
		else {
			return false;
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// runtime remote execution
	//
	// **************************************************************************
	// **************************************************************************

	headers: null,

	header_reset : function()
	{
		//console.info("IN connect.header_reset()");
		connect.headers = null;
	},

	header : function(key, value)
	{
		//console.info("IN connect.header() key='" + key + "' value='" + value + "'");
		if (connect.headers === null) { connect.headers = {}; }
		connect.headers[key] = value;
	},

	basic_auth : function(clientID, secret)
	{
		//console.info("IN connect.basic_auth() clientID='" + clientID + "' secret='" + secret + "'");
		var token = clientID + ":" + secret;
		connect.header("Authorization", "Basic " + window.btoa(token));
	},

	randomizeURL : function(url)
	{
		//console.info("IN connect.randomizeURL() url='" + url + "'");
		if (url.indexOf("?") > 0) { url += "&r=" + Math.random(); } else { url += "?r=" + Math.random(); }
		//console.log(url);
		return url;
	},


	// --------------------------------------------------------------------------
	// --------------------------------------------------------------------------
	//
	// Synchronous GET
	//
	// --------------------------------------------------------------------------
	// --------------------------------------------------------------------------

	rawget : function(url)
	{
		url = connect.randomizeURL(url);
		//console.info("IN connect.rawget() url='" + url + "'");
    var result = (function() {
	    var result = null;
			var args = {
		    url      : url,
			  async    : false,
				method   : "GET",
				global   : false,
				datatype : false,
				success  : (data) => { result = data; }
			};
		  jQuery.ajax(args);
			return result;
		})();
		return result;
	},


	// --------------------------------------------------------------------------
	// --------------------------------------------------------------------------
	//
	// Asynchronous API
	//
	// --------------------------------------------------------------------------
	// --------------------------------------------------------------------------

	get : function(url, verify_connection)
	{
		return new Promise(
			(resolve, reject) => {

				if (typeof verify_connection === "undefined") {
					verify_connection = false;
				}

				var do_the_job = function() {

					url = connect.randomizeURL(url);
					//console.info("IN connect.get() url='" + url + "'");

					var args = {
						url      : url,
						async    : true,
						method   : "GET",
						global   : false,
						dataType : false
					};

					jQuery.ajax(args)
					.done ((result) => {
						if (is_json(result)) { 
							result = JSON.parse(result); 
						}
						//console.log(JSON.stringify(result));
						resolve(result);
					})
					.fail (() => { 
						reject(); 
					});

				};

				if (verify_connection) {
					if (connect.connected()) {
						do_the_job();
					}
					else {
						connect.toast.offline();
						reject();
					}
				}
				else {
					do_the_job();
				}

			}
		);
	},

	post : function(url, data, verify_connection) 
	{
		return new Promise(
			(resolve, reject) => {

				if (typeof verify_connection === "undefined") {
					verify_connection = false;
				}

				var do_the_job = function() {

					url = connect.randomizeURL(url);
					//console.info("IN connect.post() url='" + url + "'");
					//console.log(JSON.stringify(data));

					var args = {
						url         : url,
						async       : true,
						method      : "POST",
						data        : data,
						dataType    : "text",
						crossDomain : true
					};

					if (connect.headers !== null) { 
						args.headers = connect.headers;
						connect.header_reset();
					}

					jQuery.ajax(args)
					.done ((result) => {
						if (is_json(result)) { 
							result = JSON.parse(result); 
						}
						resolve(result);
					})
					.fail (() => { 
						reject(); 
					});

				};

				if (verify_connection) {
					if (connect.connected()) {
						do_the_job();
					}
					else {
						connect.toast.offline();
						reject();
					}
				}
				else {
					do_the_job();
				}

			}
		);
	}

};


// ****************************************************************************
// ****************************************************************************
//
// Utils around connect
//
// ****************************************************************************
// ****************************************************************************

function file2bin (filename)
{
	//console.log("IN file2bin() filename='" + filename + "'");
	var buffer = connect.rawget(filename);
	return buffer;
}


// End of file: connect.js
// ============================================================================