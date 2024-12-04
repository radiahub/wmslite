// ============================================================================
// Module      : mysms.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Application support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 17-Oct-20 00:00 WIT   Denis  Deployment V. 2022 "ALEXANDRE DUMAS"
//
// ============================================================================

var mysms = {

	debug : false,


	// **************************************************************************
	// **************************************************************************
	//
	// IPC API
	//
	// **************************************************************************
	// **************************************************************************

	on_message : function(message, isBackgroundMessage, isClickedMessage)
	{
		return new Promise(
			(resolve, reject) =>{
				//console.info("IN mysms.on_message()");
				//console.log(JSON.stringify(message));

				var dataType = message["dataType"].toUpperCase();
				console.log(dataType);
				var data = message["data"];
				console.log(JSON.stringify(data));

				switch(dataType) {

					// Allows to use the application to send an SMS
					// Example:
					// message = { dataType: "SENDSMS", data: { to:"[phone_no]", body:"[body]" }
					// 
					case "SENDSMS" : {
						var to_phone_no = data["to"], body = data["body"];
						mysms.send_sms(to_phone_no, body)
						.then (()=>{
							console.log("Resolved by mysms.send_sms()");
							resolve();
						})
						.catch(()=>{
							console.error("Rejected by mysms.send_sms()");
							reject();
						});
						break;
					}

					default : {
						console.warn("Unregistered message type: '" + dataType + "'");
						reject();
						break;
					}
				}
			}
		);
	},

	ipc_init : function()
	{
		//console.info("IN mysms.ipc_init()");
		ipc.dispatcher.reg("SENDSMS", mysms.on_message);
	},


	// **************************************************************************
	// **************************************************************************
	//
	// RUNTIME
	//
	// **************************************************************************
	// **************************************************************************

	send_sms : function(to_phone_no, body)
	{
		return new Promise(
			(resolve, reject) =>{
				
				to_phone_no = msisdn.format(to_phone_no);
				console.info("IN mysms.send_sms() to_phone_no='" + to_phone_no + "' body='" + body + "'");

				if (mysms.debug) {
					var e = { data : { address : to_phone_no, body : body } };
					setTimeout(
						function() {
							mysms.on_sms(e);
						},
						3000
					);
				}
				else {
					try {
						if (typeof SMS !== "undefined") {
							SMS.sendSMS(
								to_phone_no, 
								body, 
								()=>{
									console.log("Resolved by SMS.sendSMS()");
									resolve();
								}, 
								()=>{ 
									console.log("Rejected by SMS.sendSMS()");
									reject();  
								}
							);
						}
						else {
							console.warn("SMS plugin not loaded");
							reject();
						}
					}
					catch(e) {
						console.warn("Runtime exception");
						reject();
					}
				}

			}
		);
	},

	on_sms_callback : null,

	// f : function(from_phone_no, body) { ... } (synchronous)
	//
	reg_on_sms_callback : function(f)
	{
		//console.info("IN mysms.reg_on_sms_callback()");
		if (typeof f === "function") { 
			mysms.on_sms_callback = f;
		}
	},

	unreg_on_sms_callback : function()
	{
		//console.info("IN mysms.unreg_on_sms_callback()");
		mysms.on_sms_callback = null;
	},

	on_sms : function(e)
	{
		console.info("IN mysms.on_sms()");
		console.log(JSON.stringify(e));
		console.log(JSON.stringify(e.data));
		var from_phone_no = e.data.address;
		from_phone_no = msisdn.format(from_phone_no);
		console.log(from_phone_no);
		var body = e.data.body;
		console.log(body);
		if (typeof mysms.on_sms_callback === "function") {
			mysms.on_sms_callback(from_phone_no, body);
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// SMS WATCH
	//
	// **************************************************************************
	// **************************************************************************

	watch : {

		watching : false,

		start : function(enable_intercept) 
		{
			return new Promise(
				(resolve,reject) => {
					if (typeof SMS !== "undefined") {
						if (typeof enable_intercept === "undefined") { enable_intercept = true; }
						console.info("IN mysms.watch.start()");
						if (! mysms.watch.watching) {
							if (mysms.debug) {
								console.log("Resolved by SMS.startWatch()->mysms.debug=true");
								resolve();
							}
							else {
								SMS.startWatch(
									function() {
										console.log("Resolved by SMS.startWatch()");
										if (enable_intercept) {
											SMS.enableIntercept(
												true, 
												()=>{ console.log ("Resolved by SMS.enableIntercept()"); }, 
												()=>{ console.warn("Rejected by SMS.enableIntercept()"); }
											);
										}
										document.addEventListener('onSMSArrive', mysms.on_sms);
										mysms.watch.watching = true;
										resolve();
									},
									function() {
										console.error("Rejected by SMS.startWatch()");
										reject();
									}
								);
							}
						}
						else {
							console.warn("mysms.watch already started");
							resolve();
						}
					}
					else {
						console.warn("SMS plugin not loaded");
						reject();
					}
				}
			);
		},

		stop : function() {
			//console.info("IN mysms.watch.stop()");
			document.removeEventListener('onSMSArrive', mysms.on_sms);
			if (typeof SMS !== "undefined") {
				SMS.stopWatch(noop,noop);
				mysms.watch.watching = false;
			}
			else {
				console.warn("SMS plugin not loaded");
			}
		}

	}

}


// End of file: mysms.js
// ============================================================================