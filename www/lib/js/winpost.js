// ============================================================================
// Module      : winpost.js
// Version     : 2.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : window parent-to-iframe process communication
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var winpost = {

	// **************************************************************************
	// **************************************************************************
	//
	// Runtime events
	//
	// **************************************************************************
	// **************************************************************************

	onMessage : function(event) 
	{
		console.info("IN winpost.onMessage()");

		var message = event.data;

		if (is_json(message)) { message = JSON.parse(message); }
		message["data"] = payload_decode(message["data"]);
		console.log(JSON.stringify(message));
		//console.log(ipc.dispatcher.collection);
		var idx = ipc.dispatcher.indexOf(message["dataType"]);
		console.log(idx);
		if (idx >= 0) {
			ipc.dispatcher.collection[idx].onMessage(message, false, false)
			.then (()=>{
				console.log("Resolved by ipc.dispatcher(callback).onMessage()");
			})
			.catch(()=>{
				console.warn("Rejected by ipc.dispatcher(callback).onMessage()");
			});
		}
		else {
			console.warn("dataType '" + message["dataType"] + "' is undefined");
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Runtime API
	//
	// **************************************************************************
	// **************************************************************************

	toIFrame : function(iframeID, dataType, data) 
	{
		//console.info("IN winpost.toIFrame() iframeID='" + iframeID + "' dataType='" + dataType + "'");
		if (typeof data === "undefined") { data = {}; }
		if (document.getElementById(iframeID)) {
			var frameWindow = document.getElementById(iframeID).contentWindow;
			var message = { dataType : dataType, data : payload_encode(data) };
			//console.log(JSON.stringify(message));
			frameWindow.postMessage(JSON.stringify(message),"*");
		}
	},

	toParent : function(dataType, data) 
	{
		//console.info("IN winpost.toParent() dataType='" + dataType + "'");
		if (typeof data === "undefined") { data = {}; }
		var message = { dataType : dataType, data : payload_encode(data) };
		try {
			window.parent.postMessage(JSON.stringify(message), '*');
		}
		catch(e) {
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Initialization
	//
	// **************************************************************************
	// **************************************************************************

	init: function() {
		//console.info("IN winpost.init()");
		window.addEventListener("message", winpost.onMessage, false);		
	}

};


// End of file: winpost.js
// ============================================================================