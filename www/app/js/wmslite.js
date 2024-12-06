// ============================================================================
// Module      : wmslite.js
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
		if (strlen(that.options.containerID) === 0) {
			wmslite.hide();
		}
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

		jQuery("#BTN_GO_TEST").off("click").on("click", function(){
			
			let cssFile = "file:///android_asset/www/app/css/default.css";
			let html = file2bin("app/html/EN/print3.html");
			var payload = _.template(html);

			let options = {
 				landscape: "landscape",
        type: 'share',
				fileName: 'myFileN.pdf'
      };

			pdf.fromData(payload({css_file: cssFile}), options)
    	.then((status)=>{
				console.log("status='" + status + "'");
			})
    	.catch((err)=>{
				console.error("Rejected by pdf.fromData()");
				console.error(err);
			});
			
			/*
			pdf.fromData(html, options)
    	.then((status)=>{
				console.log("status='" + status + "'");
			})
    	.catch((err)=>{
				console.error("Rejected by pdf.fromData()");
				console.error(err);
			});
			*/

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
			containerID      : "",
			contentURI       : "app/html/finance_overview.html",
		//contentURI       : "app/html/wmslite.html",
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

	onmessage: function(message)
	{
		return new Promise(
			(resolve, reject)=>{
				console.info("IN wmslite.onmessage()");
				console.log (JSON.stringify(message));
				
				var dataType = message["dataType"];
				console.log(dataType);

				switch(dataType) {

					case "I_KNOW_THIS_ONE": {
						console.log("Processing dataType='" + dataType + "'");
						resolve();
						break;
					}

					default: {
						console.error("I do not know how to process dataType='" + dataType + "'");
						reject();
						break;
					}
				}

			}
		);
	},

	init: function()
	{
		console.info("IN wmslite.init()");
		ipc.dispatcher.reg("*", wmslite.onmessage);
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

						ipc.init();
						wmslite.init();
						wmslite.show();
						resolve();

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