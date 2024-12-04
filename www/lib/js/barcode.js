// ============================================================================
// Module      : barcode.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Library to handle barcodes
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// barcode API
//
// ****************************************************************************
// ****************************************************************************

var barcode = {

	read: function()
	{
		console.log ("IN barcode.read()");
		return new Promise(
			(resolve, reject) => {
				cordova.plugins.barcodeScanner.scan(
				  function (result) {
						if (result.cancelled) {
							reject();
						}
						else {

							console.log (result.text);
							console.log (result.format);

							var message = { dataType : "BARCODE", data : { format: result.format, text: result.text } };
							ipc.onMessage(message, false, false)
							.then (()=>{
								resolve(result);
							})
							.catch(()=>{
								resolve(result);
							});							

						}
					},
					function (error) {
						console.log (JSON.stringify(error));
						reject();
					},
					{
		       	preferFrontCamera     : false,
		 	      showFlipCameraButton  : true,
		  	    showTorchButton       : true,
		 	  	  torchOn               : false,
		   	  	saveHistory           : false,
		    	  prompt                : "Place the code inside the scan area",
		      	resultDisplayDuration : 0,
		  	  //formats               : "QR_CODE,PDF_417",
			      disableSuccessBeep    : false
		 	 		}
				);
			}
		);
	},

	show: function(divID, text, height, format, color)
	{
		if (typeof color  === "undefined") { color  = "#000000"; }
		if (typeof format === "undefined") { format = "ean13"; } // default = code128, values ean13, upc, etc.
		if (typeof height === "undefined") { height = 30;  }

		height = parseInt(String(height));

		var fontSize  = Math.round(height/6);
		var barHeight = Math.round(height * 0.75);

		console.log("IN barcode.show() divID='" + divID + "' text='" + text + "' format='" + format + "'");

		var svgID = "SVG" + rand_num_str(4);
		var canvasHTML = "<svg id=\"" + svgID + "\">";
		//console.log(canvasHTML);
		jQuery("#" + divID).html(canvasHTML);
		var options = {
  		format       : format,
			fontSize     : fontSize,
			background   : 'rgba(0,0,0,0)',
  		lineColor    : color,
			height       : barHeight,
  		displayValue : true
		};
		//console.log(JSON.stringify(options));

		setTimeout(
			function() {
				JsBarcode("#" + svgID, text, options);
			},
			100
		);
		
	}

};


// ****************************************************************************
// ****************************************************************************
//
// jQuery DOM API
//
// ****************************************************************************
// ****************************************************************************

// jQuery DOM function: set barcode data to a DOM DIV object
//
// Example: jQuery("#myObjectID").barcode(value, format);
//          jQuery("#myObjectID").barcode("012345678901234567");
//
(function($) {
 
  $.fn.barcode = function(value, format, color) {

		if (typeof color  === "undefined") { color  = "#000000"; }
		if (typeof format === "undefined") { format = "ean13"; }

		this.each(function(index, element) {
			var domElement = jQuery(element).get(0);
			var height = domElement.getBoundingClientRect().height;
			var divID  = jQuery(element).attr("id");
			barcode.show(divID, value, height, format, color);
		});

		return this;
  };
 
}(jQuery));


// End of file: barcode.js
// ============================================================================