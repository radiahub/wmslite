// ============================================================================
// Module      : imgage.viewer.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Pages support: imgviewer for page object
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

jQuery.extend(

	image,
	{
		viewer : function(dataURL)
		{
			return new Promise(
				(resolve, reject)=>{

					let statusColor = "", navigationColor = "";
					if (typeof theme !== "undefined") {
						statusColor = theme.statusbar.currentColor;;
						navigationColor = theme.navigationbar.currentColor;
						theme.statusbar.fromHexColor("#000000");
						theme.navigationbar.fromHexColor("#000000");
					}


					// ******************************************************************
					// ******************************************************************
					//
					// PROMISE API
					//
					// ******************************************************************
					// ******************************************************************

					let failed = function()
					{
						//console.info("IN image.viewer()->failed()");
						hide();
						reject();
					};

					let success = function()
					{
						//console.info("IN image.viewer()->success()");
						hide();
						resolve();
					};

					let onbackbutton = function()
					{
						//console.info("IN image.viewer()->onbackbutton()");
						failed();
					};


					// ******************************************************************
					// ******************************************************************
					//
					// RUNTIME
					//
					// ******************************************************************
					// ******************************************************************

					let onDragUpdate = function(obj, evt)
					{
						evt.preventDefault();
					};

					let onDragStart = function(obj, evt)
					{
						evt.preventDefault();
					};


					// ******************************************************************
					// ******************************************************************
					//
					// GUI AND DISPLAY
					//
					// ******************************************************************
					// ******************************************************************

					let hide = function()
					{
						console.info("IN image.viewer()->hide()");

						var terminate = function() {
							if (mypage !== null) {
								mypage.remove();
								mypage = null;
							}
						};

						if (typeof theme !== "undefined") {
							theme.statusbar.fromHexColor(statusColor);
							theme.navigationbar.fromHexColor(navigationColor);
							terminate();
						}
						else {
							terminate();
						}

					};

					let onshow = function()
					{
						console.info("IN image.viewer()->show()");

						jQuery("#IMG_GENERIC_VIEWER").image(dataURL);

						pz = new PinchZoom(
							document.querySelector('#IMG_GENERIC_VIEWER'), 
							{ 
								zoomOutFactor     : 1.0,
								minZoom           : 0.5,
								maxZoom           : 6.0,
								draggableUnzoomed : false,
								onDragStart       : onDragStart,
								onDragUpdate      : onDragUpdate
							}
						);

						jQuery("#BTN_VIEWER_OK").off("click").on("click", function(evt){
							evt.preventDefault();
							ripple(this, success);
						});
					};

					let show = function()
					{
						console.info("IN image.viewer()->show()");
						var options = {
							page_id      : "page_image_viewer",
							contentURI   : "lib/html/image_viewer.html",
							onbackbutton : onbackbutton,
							onshow       : onshow,
							globalize    : false
						};
						mypage = new page(options);
						mypage.show();
					};

					if (strlen(dataURL) > 0) {
						show();
					}
					else {
						console.error("parameter dataURL is null or empty string");
						failed();
					}

				}
			);
		}
	}

);


// End of file: imgage.viewer.js
// ============================================================================