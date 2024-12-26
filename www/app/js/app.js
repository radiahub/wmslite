// ============================================================================
// Module      : app.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : WMS Lite
// Description : Application entry point
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 08-Aug-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var app = {

	run : function() {
		return new Promise(
			(resolve, reject)=>{
				
				console.info("IN app.run()");

				window.plugins.webintent.getUri(function(url) {
					//console.log("FRESH START");
					//console.log("INTENT getUri URL: " + url);
					if (strlen(url) > 0) {
						application.accesspoint.set.on_fresh_start(true);
						application.accesspoint.set.by_url(url);
					}
				});

				window.plugins.webintent.onNewIntent(function(url) {
					//console.log("WAKE-UP CALL, RESUME");
					//console.log("INTENT onNewIntent URL: " + url);
					if (strlen(url) > 0) {
						application.accesspoint.set.on_fresh_start(false);
						application.accesspoint.set.by_url(url);
					}
				});

				application.permissions.request()
				.then (()=>{
					console.log("Resolved by application.permissions.request()");
					wmslite.run()
					.then (()=>{
						resolve();
					})
					.catch(()=>{
						console.error("Rejected by wmslite.run()");
						reject();
					});
				})
				.catch(()=>{
					console.error("Rejected by application.permissions.request()");
					reject();
				});

			}
		);
	}

}


// End of file: app.js
// ============================================================================