// ============================================================================
//
// Module      : webintents.js
// Version     : 2.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Application webintents URL access point support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 05-Sep-24 00:00 WIT   Denis  Version 2.0  Ensure unicity of dataType for
//                              each application identified by a package_id
//
// ============================================================================

// ****************************************************************************
//
// url is expected to be formed as
//
// https://sites.google.com/view/radiahub/[appid]/?wi=[webintent_id]
//
// <------------physical URL------------>|<-app->|<--webintent ID-->
//                 |                         |           |
//                 |                         |           +--> webintent_id: webintent record registered on server
//                 |                         |
//                 |                         +--> Application ID
//                 |
//                 +--> As registered in AndroidManifest.xml
//
// example:
//
// https://sites.google.com/view/radiahub/wmslite/?wi=108
// 
// Use the functions webintents.create() and  webintents.createURL() to build 
// INTENT URLs
//
// webintents provides an IPC-like dispatcher to process webintent requests
// and can be generated and used by stand-alone applications
//
// ****************************************************************************

var webintents = {

	manifestURL : "https://sites.google.com/view/radiahub/[appid]/?wi=[webintent_id]", 


	// **************************************************************************
	// **************************************************************************
	//
	// Initialization
	//
	// **************************************************************************
	// **************************************************************************

	create : function(dataType, data)
	{
		return new Promise(
			(resolve, reject)=>{
				if (typeof data === "undefined") { data = {}; }
				console.info("IN webintents.create() dataType='" + dataType + "'");
				var webintent_id = moment().format("YYMMDDHHmmss") + rand_hex_str(4);
				var row = {
					webintent_id : webintent_id,
					dataType     : dataType,
					data         : payload_encode(data)
				};
				console.log(JSON.stringify(row));
				xdbref.insert("radiahub","webintents",row)
				.then (()=>{
					console.log("Resolved by xdbref.insert(webintents)");
					console.log(webintent_id);
					resolve(webintent_id);
				})
				.catch(()=>{
					console.error("Rejected by xdbref.insert(webintents)");
					reject();
				});
			}
		);
	},

	url : function(appid, webintent_id)
	{
		var result = "";

		console.info("IN webintents.url() appid='" + appid + "' webintent_id='" + webintent_id + "'");

		if (strlen(webintent_id) === 16) {
			if (strlen(appid) === 0) {
				appid = package_id.slice(package_id.lastIndexOf(".") + 1);
			}
			result = webintents.manifestURL;
			result = str_replace("[appid]", appid, result);
			result = str_replace("[webintent_id]", webintent_id, result);
		}

		console.log(result);
		return result;
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Runtime
	//
	// **************************************************************************
	// **************************************************************************
	
	open : function(url) 
	{
		return new Promise(
			(resolve, reject)=>{
				
				console.info("IN webintents.open() url='" + url + "'");
				var webintent_id = evalUrl(url, "wi");
				if (strlen(webintent_id) > 0) {
					xdbref.locate("radiahub","webintents", { webintent_id: webintent_id })
					.then ((row)=>{
						if (row !== null) {
							var dataType = row["dataType"];
							var data = payload_decode(row["data"]);

							var message = { dataType: dataType, data: data };
							console.log(JSON.stringify(message));

							ipc.onMessage(message, true, true)
							.then (()=>{
								resolve();
							})
							.catch(()=>{
								console.error("Rejected by ipc.onMessage()");
								reject();
							});

						}
						else {
							console.error("xdbref.locate(webintents) returned null");
							reject();
						}
					})
					.catch(()=>{
						console.error("Rejected by xdbref.locate(webintents)");
						reject();
					});
				}
				else {
					console.error("Resolving webintent_id returned null or empty");
					reject();
				}

			}
		);
	}

};


// End of file: webintents.js
// ============================================================================