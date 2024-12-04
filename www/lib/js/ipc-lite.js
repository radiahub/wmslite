// ============================================================================
// Module      : ipc.js
// Version     : 2.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : IPC Inter-Process Communication
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var ipc = {

	// **************************************************************************
	// **************************************************************************
	//
	// IPC DISPATCHER
	//
	// **************************************************************************
	// **************************************************************************

	dispatcher : {

		// collection : array of {
		//   dataType  : IPC data type,
		//   onMessage : function(message, isBackgroundMessage, isClickedMessage) { 
		//                 return new Promise (...); 
		//               }
		// } objects
		//
		// onMessage parameters:
		//
		// message             : plain object { dataType:..., data:{...} }
		//                       where data is the DECODED payload of the message
		// isBackgroundMessage : true = the message has been delivered in background
		// isClickedMessage    : true = the message has been clicked on statusbar
		//
		collection: [],

		indexOf : function(dataType, strict)
		{

			if (typeof strict === "undefined") { strict = false; }

			//console.info("IN ipc.dispatcher.indexOf() dataType='" + dataType + "' strict=" + String(strict));

			for (var i = 0; i < ipc.dispatcher.collection.length; i++) {
				//console.log("" + i + ": " + ipc.dispatcher.collection[i].dataType);
				if (ipc.dispatcher.collection[i].dataType === dataType) {
					//console.log("We have a match");
					return i;
				}
			}

			//console.info("IN ipc.dispatcher.indexOf() dataType='" + dataType + "' not explicitly registered");
			
			if (! strict) {
				for (var i = 0; i < ipc.dispatcher.collection.length; i++) {
					if (ipc.dispatcher.collection[i].dataType === "*") {
						//console.log("Found default callback for dataType='*'");
						return i;
					}
				}
			}

			return -1;
		},

		unreg : function(dataType)
		{
			//console.info("IN ipc.dispatcher.unreg() dataType='" + dataType + "'");
			let idx = ipc.dispatcher.indexOf(dataType, true);
			if (idx >= 0) {
				ipc.dispatcher.collection.splice(idx,1);
			}
		},

		// onMessage           : function(message, isBackgroundMessage, isClickedMessage) 
		//                       { return new Promise (...); }
		//
		// message             : plain object { dataType:..., data:{...} }
		//                       where data is the DECODED payload of the message
		//
		reg : function (dataType, onMessage)
		{
			//console.info("IN ipc.dispatcher.reg() dataType='" + dataType + "'");
			//alert("IN ipc.dispatcher.reg() dataType='" + dataType + "'");
			ipc.dispatcher.unreg(dataType);
			ipc.dispatcher.collection.push({ dataType: dataType, onMessage: onMessage });
		},

		clear : function()
		{
			//console.info("IN ipc.dispatcher.clear()");
			ipc.dispatcher.collection = [];
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// READ MESSAGE API
	//
	// **************************************************************************
	// **************************************************************************

	// message : plain object { dataType:..., data:{...} }
	//           where data is the DECODED payload of the message
	//
	onMessage : function (message, isBackgroundMessage, isClickedMessage)
	{
		if (typeof isClickedMessage === "undefined") { isClickedMessage = false; }
		if (typeof isBackgroundMessage === "undefined") { isBackgroundMessage = false; }

		//alert("IN ipc.onMessage()");
		//alert(JSON.stringify(message));

		return new Promise(
			(resolve, reject)=>{
				/*
				var msg = "IN ipc.onMessage() "
								+ "isBackgroundMessage=" + String(isBackgroundMessage) 
								+ " isClickedMessage="   + String(isClickedMessage);
				console.info(msg);
				console.log(JSON.stringify(message));
				*/
				//console.info("IN ipc.onMessage()");
				//console.log(JSON.stringify(message));
				try {
					var dataType = message["dataType"];
					var idx = ipc.dispatcher.indexOf(dataType);
					//console.log(idx);
					//alert(idx);
					if (idx >= 0) {
						ipc.dispatcher.collection[idx].onMessage(message, isBackgroundMessage, isClickedMessage)
						.then (()=>{ 
							resolve(); 
						})
						.catch(()=>{ 
							console.warn ("Rejected by ipc.onMessage()->callback()");
							reject(); 
						});
					}
					else {
						console.warn("Unregistered message type: '" + dataType + "'");
						reject();
					}
				}
				catch (e) {
					console.warn("Runtime exception in ipc.onMessage() message_id='" + message["message_id"] + "'");
					reject();
				}

			}
		);
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Initialization
	//
	// **************************************************************************
	// **************************************************************************

	init : function()
	{
		//console.info("IN ipc.init()");
	}

};




// End of file: ipc.js
// ============================================================================