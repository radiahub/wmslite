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
		//console.info("IN wmslite.onbackbutton()");
		wmslite.hide();
	},

	onthemechanged: function(newThemeID)
	{
		return new Promise(
			(yes, no) => {
				//console.info("IN wmslite.onthemechanged() newThemeID='" + newThemeID + "'");
				//Do something useful
				yes();
			}
		);
	},

	onshow: function()
	{
		//console.info("IN wmslite.onshow()");

		jQuery("#BTN_CLOSE_WMSLITE").off("click").on("click", function(){
			ripple(this, function(){
				dbase.rows("SELECT * FROM locations")
				.then ((rows)=>{
					//console.log(JSON.stringify(rows));
				})
				.catch(()=>{
					//console.log("Rejected by dbase.rows()");
				});
			});
		});

		var po = "PO-241226-0048";

		var options = {
			format: "CODE128",
			height : 40,
			fontSize : 10,
  		displayValue : true
		};

		//console.log(JSON.stringify(options));

		JsBarcode("#barcode", po, options);

		setTimeout(
			function() {
				var canvas = document.getElementById("barcode"); 
				var dataURL = canvas.toDataURL("image/png");
				//console.log(logFromDataURL(dataURL));
				jQuery("#img_barcode").image(dataURL);
			},
			100
		);


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
		//console.info("IN wmslite.hide()");
		if (wmslite.page !== null) {
			wmslite.page.remove();
			wmslite.page = null;
		}
	},

	show: function()
	{
		//console.info("IN wmslite.show()");	

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

					var q = "SELECT * FROM locations "
								+ "WHERE location_id IN ('STORE','REFRIGERATED','INBOUND','PREPARATION','PACKAGING','OUTBOUND','TRANSIT','WASTE')";

					dbase.rows(q)
					.then ((rows)=>{
						//console.log("Resolved by dbase.rows() length=" + rows.length);
						if (rows.length > 0) {
							resolve();
						}
						else {

							var filename = "app/sqlite/locations.sql";
							//console.log(filename);
							var queries = file2queries(filename);
							//console.log(JSON.stringify(queries));
							dbase.batch(queries, false)
							.then((logtxt)=>{
								//console.log(logtxt);
								resolve();
							})
							.catch(()=>{ 
								//console.warn("Rejected by dbase.batch()");
								resolve();
							});

						}
					})
					.catch(()=>{
						//console.warn("Rejected by dbase.rows()");
						resolve();
					});

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
						//console.log("Resolved by window.CacheClear()");
						if (typeof echo !== "undefined") {
							echo.init();
						}

						wmslite.init()
						.then (()=>{
							//console.log("Resolved by wmslite.init()");
							wmslite.show();
							resolve();
						})
						.catch(()=>{
							//console.error("Rejected by wmslite.init()");
							reject();
						});

					},
					function(status) {
						//console.error("Rejected by window.CacheClear()");
						//console.error(status);
						reject();
					}
				);

			}
		);
	}

};


// End of file: wmslite.js
// ============================================================================