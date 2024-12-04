// ============================================================================
// Module      : qrcode.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : QR code utilities
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var qrcode = {

	// **************************************************************************
	// **************************************************************************
	//
	// ACQUISITION
	//
	// **************************************************************************
	// **************************************************************************

	onMessage : (res)=>{

		//console.log("IN qrcode.onMessage()");
		//console.log(JSON.stringify(res));

		return new Promise(
			(resolve, reject)=>{

				if (strcasecmp(res.format, "QR_CODE") === 0) {
					if (is_json(res.text)) {
						try {
							var message = JSON.parse(res.text);
							if ((val.isset(message.dataType)) && (val.isset(message.data))) {

								message.data = payload_decode(message.data);
								ipc.onMessage(message, false, false)
								.then (()=>{
									resolve();
								})
								.catch(()=>{
									//console.log("Rejected by ipc.onMessage()");
									reject();
								});

							}
							else {
								//console.log("Not an FCM/IPC message format");
								reject();
							}
						}
						catch(e) {
							//console.log("Runtime exception in qrcode.onMessage()");
							reject();
						}
					}
					else {
						//console.log("Not a JSON format");
						reject();
					}
				}
				else {
					// We may have read a barcode here
					//
					var dummyBarcode = { dataType: "BARCODE", data: { format: res.format, value: res.text } };

					ipc.onMessage(dummyBarcode, false, false)
					.then (()=>{
						resolve();
					})
					.catch(()=>{
						//console.log("Rejected by ipc.onMessage()");
						reject();
					});
				}

			}
		);

	},

	read: function()
	{
		//console.log ("IN qrcode.read()");

		return new Promise(
			(resolve, reject) => {

				cordova.plugins.barcodeScanner.scan(
					function (result) {
						if (result.cancelled) {
							reject();
						}
						else {
							//console.log (result.text);
							//console.log (result.format);
							var res = {
								text   : result.text,
								format : result.format
							};
							//console.log(JSON.stringify(res));
							qrcode.onMessage(res)
							.then ((data)=>{
								//console.log("Resolved by qrcode.onMessage()");
								resolve(data);
							})
							.catch(()=>{
								//console.log("Rejected by qrcode.onMessage()");
								resolve(null); // Do not block anything here!
							});
						}
					},
					function (error) {
						//console.log (JSON.stringify(error));
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


	// **************************************************************************
	// **************************************************************************
	//
	// RENDERING
	//
	// **************************************************************************
	// **************************************************************************

	viewer : {

		page : null, divID: "", text: "", showing: false,

		onbackbutton: function()
		{
			//console.info("IN qrcode.viewer.onbackbutton()");
			qrcode.viewer.hide();
			qrcode.viewer.showing = false;
		},

		onpageresize: function()
		{
			return new Promise(
				(resolve, reject) => {
					qrcode.showText("qrcode_viewer", qrcode.viewer.text);
					resolve();
				}
			);
		},

		onshow: function()
		{
			//console.info("IN qrcode.viewer.onshow()");
			//console.log(qrcode.viewer.text);
			qrcode.showText("qrcode_viewer", qrcode.viewer.text);
			qrcode.viewer.showing = true;

			jQuery("#BTN_REFRESH_QRCODE_VIEWER").off("click").on("click", function(){
				ripple(this, function() { qrcode.showText("qrcode_viewer", qrcode.viewer.text); });
			});

			jQuery("#BTN_CLOSE_QRCODE_VIEWER").off("click").on("click", function(){
				ripple(this, qrcode.viewer.hide());
			});
		},

		hide : function() 
		{
			//console.info("IN qrcode.viewer.hide()");
			qrcode.viewer.showing = false;
			if (qrcode.viewer.page !== null) {
				qrcode.viewer.page.remove();
				qrcode.viewer.page = null;
			}
		},

		show: function()
		{
			//console.log("IN qrcode.viewer.show()");	

			var options = {
				page_id      : "page_qrcode_viewer",
				contentURI   : "lib/html/qrcode_viewer.html",
				onbackbutton : qrcode.viewer.onbackbutton,
				onshow       : qrcode.viewer.onshow,
				onpageresize : qrcode.viewer.onpageresize,
				globalize    : false
			};

			qrcode.viewer.page = new page(options);
			qrcode.viewer.page.show(true);
		},

		activate : function(divID, text)
		{
			//console.log("IN qrcode.viewer.activate() divID='" + divID + "' text='" + text + "'");	
			qrcode.viewer.divID = divID;
			qrcode.viewer.text  = text;
			if (divID !== "qrcode_viewer") {
				jQuery("#" + divID).css('cursor', 'pointer');
				jQuery("#" + divID).off("click").on("click", function(){
					//console.log("Click to view");
					ripple(this, qrcode.viewer.show);
				});
			}
		}

	},


	// Target MUST BE of type DOM <div>
	//
	show: function(divID, dataType, data, size)
	{
		if (typeof size === "undefined") { 
			size = document.getElementById(divID).clientWidth;
		}
		//console.log("IN qrcode.show() divID='" + divID + "' size=" + size + "px");
		//console.log("dataType='" + dataType + "'");
		
		jQuery('#' + divID).empty();
		
		if (strlen(dataType) > 0) {
			var fcmdata = { dataType: dataType, data: payload_encode(data) };
			var text = JSON.stringify(fcmdata);
			jQuery('#' + divID).qrcode( { width: size, height: size, text: text } );
			qrcode.viewer.activate(divID, text);
		}
		else {
			jQuery('#' + divID).qrcode( { width: size, height: size, text: data } );
			qrcode.viewer.activate(divID, data);
		}
	},


	showText: function(divID, text, size)
	{
		if (typeof size === "undefined") { size = jQuery("#" + divID).width(); }
		//console.log("IN qrcode.showText() divID='" + divID + "' size=" + size + "px");
		jQuery('#' + divID).empty();
		jQuery('#' + divID).qrcode( { width: size, height: size, text: text } );
		qrcode.viewer.activate(divID, text);
	},


	showURL: function(divID, url, size)
	{
		if (typeof size === "undefined") { size = jQuery("#" + divID).width(); }
		//console.log("IN qrcode.showURL() divID='" + divID + "' size=" + size + "px");
		jQuery('#' + divID).empty();
		jQuery('#' + divID).qrcode( { width: size, height: size, text: url } );
		qrcode.viewer.activate(divID, url);
	},


	toDataURL: function(text, qrsize, margin)
	{
		return new Promise(
			(resolve, reject)=>{

				if (typeof margin === "undefined") { margin = 20;  }
				if (typeof qrsize === "undefined") { qrsize = 400; }

				var divID = "DIV_QRCODE_" + rand_num_str(4);
				//console.info("IN qrcode.toDataURL() divID='" + divID + "' margin=" + margin + "px");

				var type  = "image/png";
				var size  = qrsize + (2 * margin);
				//console.log(size);

				var dummy = size + 50;

				var posY = "-" + dummy + "px";
				//console.log("posY=" + posY);

				var html = '<div id="' + divID + '" class="absolute bg-white flex-middle" style="top:' + posY +'; left:0px; width:' + size + 'px; height:' + size + 'px;"></div>';
				jQuery(document.body).append(html);
				jQuery('#' + divID).qrcode( { width: qrsize, height: qrsize, text: text } );

				var qrcode_canvas = jQuery("#" + divID + " canvas").get(0);
				//console.log(qrcode_canvas);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

				var source = qrcode_canvas.toDataURL(type);
				//console.log(source.slice(0, 150));

				var img = new Image();

				img.onload = function() {

					var canvas = document.createElement("canvas");
					canvas.width  = size;
					canvas.height = size;
					var context = canvas.getContext("2d");
					context.fillStyle = "white";
					context.fillRect (0, 0, size, size);
					context.drawImage(img, margin, margin);

					var dataURL = canvas.toDataURL(type);
					jQuery("#" + divID).remove();
					resolve(dataURL);

				};

				img.src = source;
			}
		);
	},


	downloadImage : function(text, qrsize, margin)
	{
		return new Promise(
			(resolve, reject)=>{		

				if (typeof margin === "undefined") { margin = 20;  }
				if (typeof qrsize === "undefined") { qrsize = 400; }

				qrcode.toDataURL(text, qrsize, margin)
				.then ((dataURL)=>{

					var mimetype = mimeTypeFromDataURL(dataURL);
					var filename = "" + datetime.now() + "_" + rand_hex_str(6) + ".png";

					var blob = blobFromDataURL(dataURL);

					var a = document.createElement('a');
					a.setAttribute('download', filename);
					a.setAttribute('href', window.URL.createObjectURL(blob));
					a.click();
					resolve();

				})
				.catch(()=>{
					//console.log("Rejected by qrcode.toDataURL()");
					reject();
				});

			}
		);
	}
	
};




// End of file: qrcode.js
// ============================================================================