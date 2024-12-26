// ============================================================================
// Module      : wmslite.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : WMS IMS Lite
// Description : Application entry point
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 08-Aug-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var wmslite = {

	page : null,
	
	// **************************************************************************
	// **************************************************************************
	// 
	// RUNTIME EVENTS
	//
	// **************************************************************************
	// **************************************************************************

	onbackbutton: function()
	{
		console.log("IN wmslite.onbackbutton()");
		wmslite.hide();
	},

	onthemechanged: function(newThemeID)
	{
		return new Promise(
			(yes, no) => {
				console.log("IN wmslite.onthemechanged() newThemeID='" + newThemeID + "'");
				//Do something useful
				yes();
			}
		);
	},

	onshow: function()
	{
		console.log("IN wmslite.onshow()");
		jQuery("#BTN_CLOSE_WMSLITE").off("click").on("click", function(){
			ripple(this, function(){
				dbase.rows("SELECT * FROM locations")
				.then ((rows)=>{
					console.log(JSON.stringify(rows));
				})
				.catch(()=>{
					console.log("Rejected by dbase.rows()");
				});
			});
		});
	},


	// **************************************************************************
	// **************************************************************************
	//
	// DISPLAY API
	//
	// **************************************************************************
	// **************************************************************************

	hide : function() 
	{
		console.log("IN wmslite.hide()");
		if (wmslite.page !== null) {
			wmslite.page.remove();
			wmslite.page = null;
		}
	},

	show: function()
	{
		console.log("IN wmslite.show()");	

		wmslite.page = new page({
			page_id          : "page_wmslite",
		  contentURI       : "app/html/wmslite.html",
			scriptURI        : "app/js/wmslite.js",
			windowObjectName : "wmslite",
			onbackbutton     : wmslite.onbackbutton,
			onshow           : wmslite.onshow,
			onthemechanged   : wmslite.onthemechanged,
			globalize        : true
		});

		if (wmslite.page !== null) { 			
			wmslite.page.show();
		}
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
		return new Promise(
			(resolve, reject)=>{
				console.info("IN wmslite.init()");

				var filename = "app/sqlite/wmslite.sql";
				//console.log(filename);
				var queries = file2queries(filename);
				//console.log(JSON.stringify(queries));
				dbase.batch(queries, false)
				.then((logtxt)=>{
					//console.log(logtxt);
					resolve();
				})
				.catch(()=>{ 
					//console.error("Rejected by dbase.batch()");
					reject();
				});

			}
		);
	},

	run : function()
	{
		return new Promise(
			(resolve, reject)=>{
				console.info("IN wmslite.run()");

				window.CacheClear(
					function() {
						console.log("Resolved by window.CacheClear()");
						if (typeof echo !== "undefined") {
							echo.init();
						}

						wmslite.init()
						.then (()=>{
							console.log("Resolved by wmslite.init()");
							wmslite.show();
							resolve();
						})
						.catch(()=>{
							console.error("Rejected by wmslite.init()");
							reject();
						});

					},
					function(status) {
						console.error("Rejected by window.CacheClear()");
						console.error(status);
						reject();
					}
				);

			}
		);
	}

};


// End of file: wmslite.js
// ============================================================================