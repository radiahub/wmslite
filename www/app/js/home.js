// ============================================================================
// Module      : home.js
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

var home = {

	page : null, barcodeDataURL : "",

	
	// **************************************************************************
	// **************************************************************************
	// 
	// RUNTIME EVENTS
	//
	// **************************************************************************
	// **************************************************************************

	onbackbutton: function()
	{
		//console.info("IN home.onbackbutton()");
		if (navigation.showing) {
			navigation.hide();
		}
		else if (preferences.showing) {
			preferences.hide();
		}
		else {
			home.hide();
		}
	},


	onthemechanged: function(newThemeID)
	{
		return new Promise(
			(yes, no) => {
				//console.info("IN home.onthemechanged() newThemeID='" + newThemeID + "'");
				if (newThemeID === "light") {
					jQuery("#IMG_GOSCAN_HOME").attr("src", "lib/img/scan-white.png");
				}
				else {
					jQuery("#IMG_GOSCAN_HOME").attr("src", "lib/img/scan-white.png");
				}
				yes();
			}
		);
	},


	onshow: function()
	{
		console.info("IN home.onshow()");


		jQuery("#BTN_CLOSE_HOME").off("click").on("click", function(){
			ripple(this, function(){
				console.info("IN jQuery(#BTN_CLOSE_HOME).click()");
				/*
				var options = {
					metadata   : { src_img_print_po: home.barcodeDataURL },
					contentURI : "app/html/print_po.html",
					globalize  : true
				};
				//console.log(JSON.stringify(options));
				report(options)
				.then (()=>{
					console.log("Resolved by report()");
				})
				.catch(()=>{
					console.error("Rejected by report()");
				});
				*/
			});
		});


		jQuery("#BTN_SEARCH_HOME").off("click").on("click", function(){
			ripple(this, function(){
				console.info("IN jQuery(#BTN_SEARCH_HOME).click()");
			});
		});


		jQuery("#BTN_GOSCAN_HOME").off("click").on("click", function(){
			ripple(this, function(){
				//console.info("IN jQuery(#BTN_GOSCAN_HOME).click()");
				barcode.read()
				.then ((result)=>{
					console.log(JSON.stringify(result));
					take_barcode(result)
					.then (()=>{
						console.log("Resolved by take_barcode()");
					})
					.catch(()=>{
						console.warn("Rejected by take_barcode()");
					});
				})
				.catch(()=>{
					console.warn("Rejected by barcode.read()");
				});
			});
		});


		jQuery("#BTN_PREFERENCES_HOME").off("click").on("click", function(){
			ripple(this, function(){
				preferences.show();
			});
		});


		jQuery("#BTN_HOME_ACTION").off("click").on("click", function(){
			ripple(this, function(){
				navigation.show();
			});
		});


		jQuery("#BTN_WITH_BARCODE").off("click").on("click", function(){
			ripple(this, function(){

				var filename = cordova.file.externalRootDirectory + "Download/" + "PO-241226-0048.pdf";

				var options = {
					message: "PO-241226-0048.pdf",
					subject: "PO-241226-0048.pdf",
					files: [filename]
				};

				var onSuccess = function(result) {
					console.log("Share completed? " + result.completed);
					console.log("Shared to app: " + result.app);
				};

				var onError = function(msg) {
					console.log("Sharing failed with message: " + msg);
				};

				window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);

			});
		});


		var po = "PO-241226-0048";

		var options = {
			format: "CODE128",
			height : 60,
			margin : 0,
			fontSize : 18,
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
				home.barcodeDataURL = dataURL;
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
		//console.info("IN home.hide()");
		if (home.page !== null) {
			home.page.remove();
			home.page = null;
		}
	},

	show: function()
	{
		//console.info("IN home.show()");	

		home.page = new page({
			page_id          : "page_HOME",
		  contentURI       : "app/html/home.html",
			scriptURI        : "app/js/home.js",
			windowObjectName : "home",
			onbackbutton     : home.onbackbutton,
			onshow           : home.onshow,
			onthemechanged   : home.onthemechanged,
			globalize        : true
		});

		if (home.page !== null) { 			
			home.page.show();
		}
	}

};


// End of file: home.js
// ============================================================================