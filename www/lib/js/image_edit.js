// ============================================================================
// Module      : image.edit.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Library + GUI to handle simple image edition
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

jQuery.extend(

	image,
	{
		// ************************************************************************
		// ************************************************************************
		//
		// CANVAS-BASE TRANSFORMATIONS
		//
		// ************************************************************************
		// ************************************************************************

		// Rotate an image by a degree value
		// Return Promise, resolve resulting image as dataURL
		//
		rotate : function (dataURL, degree)
		{
			return new Promise(
				(resolve, reject)=>{

					//console.info("IN image.rotate() degree=" + degree);
					//console.log(logFromDataURL(dataURL));

					var getRotatedPoint = function (x, y, cx, cy, theta) {

						let tempX = x - cx;
						let tempY = y - cy;

						// now apply rotation
						let rotatedX = tempX*Math.cos(theta) - tempY*Math.sin(theta);
						let rotatedY = tempX*Math.sin(theta) + tempY*Math.cos(theta);

						// translate back
						x = rotatedX + cx;
						y = rotatedY + cy;

						let point = {x:x,y:y};
						return point;
					};

					var getBoundingRect = function (width, height, degree) 
					{
						//console.log("IN image.rotate()->getBoundingRect() width=" + width + " height=" + height + " degree=" + degree);

						let rad = radians(degree);
						
						let points = [{x:0, y:0}, {x:width, y:0}, {x:width, y:height}, {x:0, y:height}];

						let minX = undefined;
						let minY = undefined;
						let maxX = 0;
						let maxY = 0;

						for (let index = 0; index < points.length; index++) {

							const point = points[index];
							const rotatedPoint = getRotatedPoint(point.x, point.y, width/2, height/2, rad);
							
							if (minX == undefined) {
								minX = rotatedPoint.x;
							}
							else{
								minX = Math.min(rotatedPoint.x, minX);
							}

							if (minY == undefined) {
								minY = rotatedPoint.y;
							}else{
								minY = Math.min(rotatedPoint.y, minY);
							}

							maxX = Math.max(rotatedPoint.x, maxX);
							maxY = Math.max(rotatedPoint.y, maxY);
						}

						let rectWidth  = maxX - minX;
						let rectHeight = maxY - minY;

						let rect = {
							x      : minX,
							y      : minY,
							width  : rectWidth,
							height : rectHeight
						}

						return rect;
					};

					var img = new Image();
					img.onload = function() {

						//console.log("IN image.rotate()->img.onload()");
						const canvas = document.createElement("canvas");
						//console.log(canvas);

						const imgWidth  = img.naturalWidth ;
						const imgHeight = img.naturalHeight;

						//console.log("imgWidth=" + imgWidth + " imgHeight=" + imgHeight);

						const rect = getBoundingRect(imgWidth, imgHeight, degree);

						//console.log(JSON.stringify(rect));

						canvas.width  = rect.width ;
						canvas.height = rect.height;

						const ctx = canvas.getContext("2d");
						ctx.translate(canvas.width/2, canvas.height/2);
						ctx.rotate(radians(degree));

						ctx.drawImage(img, -imgWidth/2, -imgHeight/2);

						resolve(canvas.toDataURL());
					};

					img.src = dataURL;
				}
			);
		},

		// Crop an area from an image (the origin image is NOT modified)
		// Return Promise, resolve resulting cropped image as dataURL
		//
		crop : function (dataURL, posX, posY, width, height)
		{
			return new Promise(
				(resolve, reject)=>{

					//console.info("IN image.crop() posX=" + posX + " posY=" + posY + " width=" + width + " height=" + height);
					//console.log(source.slice(0, 150));

					var img = new Image();
					img.onload = function() {

						//console.log("width=" + img.width + " height=" + img.height);
						if ((posX + width ) > img.width ) { width  = img.width  - posX; }
						if ((posY + height) > img.height) { height = img.height - posY; }

						var canvas = document.createElement("canvas");
						canvas.width  = width;
						canvas.height = height;
						var context = canvas.getContext("2d");
						context.drawImage(img, posX, posY, width, height, 0, 0, width, height);

						var cropDataURL = canvas.toDataURL();
						//console.log(logFromDataURL(cropDataURL));
						resolve(cropDataURL);
					};

					img.src = dataURL;
				}
			);
		},

		// Flips an image horizontally, vertically, or both
		// Return Promise, resolve resulting image as dataURL
		//
		flip : function (dataURL, flipX, flipY)
		{
			return new Promise(
				(resolve, reject)=>{

					//console.info("IN image.flip() flipX=" + String(flipX) + " flipY=" + String(flipY));
					//console.log(source.slice(0, 150));

					var myimg = new Image();
					myimg.onload = function() {

						//console.log("width=" + myimg.width + " height=" + myimg.height);

						var canvasTransform = document.createElement("canvas");
						canvasTransform.width  = myimg.width;
						canvasTransform.height = myimg.height;
						var contextTransform = canvasTransform.getContext("2d");

						var scaleH = flipX ? -1 : 1;
						var scaleV = flipY ? -1 : 1;
						var posX   = flipX ? myimg.width  * -1 : 0;
						var posY   = flipY ? myimg.height * -1 : 0;
						//console.log("scaleH=" + scaleH + " scaleV=" + scaleV + " posX=" + posX + " posY=" + posY);

						contextTransform.scale(scaleH, scaleV);
						contextTransform.drawImage(myimg, posX, posY, myimg.width, myimg.height);
						var flippedDataUrl = canvasTransform.toDataURL();
						//console.log(String(flippedDataUrl).slice(0, 150));
						resolve(flippedDataUrl);
					};

					myimg.src = dataURL;
				}
			);
		},


		// ************************************************************************
		// ************************************************************************
		//
		// EDITOR
		//
		// ************************************************************************
		// ************************************************************************

		edit : function(dataURL)
		{
			return new Promise(
				(resolve, reject)=>{

					console.info("IN image.edit() dataURL='" + logFromDataURL(dataURL) + "'");

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
						//console.info("IN image.edit()->failed()");
						hide();
						reject();
					};

					let success = function()
					{
						//console.info("IN image.edit()->success()");
						hide();
						resolve(dataURL);
					};

					let onbackbutton = function()
					{
						//console.info("IN image.edit()->onbackbutton()");
						failed();
					};


					// ******************************************************************
					// ******************************************************************
					//
					// GUI AND DISPLAY
					//
					// ******************************************************************
					// ******************************************************************

					let mypage = null;

					let hide = function()
					{
						console.log("IN image.edit()->hide()");
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

					let sliders = {

						line_left : 0, line_right : 0, line_top : 0, line_bottom : 0,

						showlines : function()
						{
							//console.info("line_left=" + sliders.line_left + ", line_right=" + sliders.line_right + ", line_top=" + sliders.line_top + ", line_bottom=" + sliders.line_bottom);
						},

						reset : function() 
						{
							//console.info("IN image.edit()->sliders.reset()");
							var rect = document.getElementById("DIV_EDIT_CONTENT").getBoundingClientRect();
							//console.log(JSON.stringify(rect));

							var border_size = 2;

							var thetop = rect.top - border_size;
							jQuery("#SLIDER_TOP"  ).css("top", thetop);
							jQuery("#SLIDER_LEFT" ).css("top", thetop);
							jQuery("#SLIDER_RIGHT").css("top", thetop);

							var thebottom = rect.top + rect.height - parseInt(jQuery("#SLIDER_BOTTOM").css("height"));
							jQuery("#SLIDER_BOTTOM").css("top", thebottom);

							var theleft = rect.left - border_size;
							jQuery("#SLIDER_LEFT").css("left", theleft);

							var theright = rect.left + rect.width + border_size - parseInt(jQuery("#SLIDER_RIGHT").css("width"));
							jQuery("#SLIDER_RIGHT").css("left", theright);

							var theheight = rect.height + (2 * border_size);
							jQuery("#SLIDER_LEFT" ).css("height", theheight);
							jQuery("#SLIDER_RIGHT").css("height", theheight);

							sliders.line_left   = parseInt(jQuery("#SLIDER_LEFT").css("left"));
							sliders.line_right  = parseInt(jQuery("#SLIDER_RIGHT").css("left")) + parseInt(jQuery("#SLIDER_RIGHT").css("width"));
							sliders.line_top    = parseInt(jQuery("#SLIDER_TOP").css("top"));
							sliders.line_bottom = parseInt(jQuery("#SLIDER_BOTTOM").css("top")) + parseInt(jQuery("#SLIDER_BOTTOM").css("height"));

							sliders.showlines();
						},

						init : function()
						{
							//console.info("IN image.edit()->sliders.init()");

							(function(){

								var startX = 0, startY = 0, minX = 0, maxX = 0, minY = 0, maxY = 0;
								var slider = null;

								var minmax = function() {
									//console.log("minX=" + minX + ", maxX=" + maxX + ", minY=" + minY + ", maxY=" + maxY);
								};

								new gesture("SLIDER_TOP")
								.on("touchstart", function(event, x, y, distance) {
									//console.log("IN touchstart(SLIDER_TOP) y=" + y + " distance=" + distance);
									slider = "SLIDER_TOP";
									startY = parseInt(String(document.getElementById("SLIDER_TOP").style.top));
									//console.log("startY=" + startY);
									var border_size = 2;
									var rect = document.getElementById("DIV_EDIT_CONTENT").getBoundingClientRect();
									minY = rect.top - border_size;
									maxY = sliders.line_bottom - parseInt(jQuery("#SLIDER_BOTTOM").css("height")) - parseInt(jQuery("#SLIDER_TOP").css("height"));
									minmax();
								})
								.on("touchmove", function(event, deltaX, deltaY, deltaDistance, scaleFactor) {
									//console.log("IN touchmove(SLIDER_TOP) deltaY=" + deltaY);
									var top = startY + deltaY;
									if (top < minY) {
										top = minY;
									}
									else if (top > maxY) {
										top = maxY;
									}
									//console.log(top);
									jQuery("#SLIDER_TOP").css("top", top);
								})
								.on("touchend", function()	{
									//console.log("IN touchend(SLIDER_TOP)");
									sliders.line_top = parseInt(jQuery("#SLIDER_TOP").css("top"));
									slider = null;
								});

								new gesture("SLIDER_BOTTOM")
								.on("touchstart", function(event, x, y, distance) {
									//console.log("IN touchstart(SLIDER_BOTTOM) y=" + y + " distance=" + distance);
									slider = "SLIDER_BOTTOM";
									startY = parseInt(String(document.getElementById("SLIDER_BOTTOM").style.top));
									//console.log("startY=" + startY);
									var border_size = 2;
									var rect = document.getElementById("DIV_EDIT_CONTENT").getBoundingClientRect();
									minY = sliders.line_top  + parseInt(jQuery("#SLIDER_TOP" ).css("height"));
									maxY = rect.top + rect.height + border_size - parseInt(jQuery("#SLIDER_BOTTOM").css("height"));
									minmax();
								})
								.on("touchmove", function(event, deltaX, deltaY, deltaDistance, scaleFactor) {
									//console.log("IN touchmove(SLIDER_BOTTOM) deltaY=" + deltaY);
									var top = startY + deltaY;
									var top = startY + deltaY;
									if (top < minY) {
										top = minY;
									}
									else if (top > maxY) {
										top = maxY;
									}
									//console.log(top);
									jQuery("#SLIDER_BOTTOM").css("top", top);
								})
								.on("touchend", function()	{
									//console.log("IN touchend(SLIDER_BOTTOM)");
									sliders.line_bottom = parseInt(jQuery("#SLIDER_BOTTOM").css("top")) + parseInt(jQuery("#SLIDER_BOTTOM").css("height"));
									slider = null;
								});

								new gesture("SLIDER_LEFT")
								.on("touchstart", function(event, x, y, distance) {
									//console.log("IN touchstart(SLIDER_LEFT) x=" + x + " distance=" + distance);
									slider = "SLIDER_LEFT";
									startX = parseInt(jQuery("#SLIDER_LEFT").css("left"));
									//console.log("startX=" + startX);
									var border_size = 2;
									var rect = document.getElementById("DIV_EDIT_CONTENT").getBoundingClientRect();
									minX = rect.left - border_size;
									maxX = sliders.line_right - parseInt(jQuery("#SLIDER_RIGHT").css("width")) - parseInt(jQuery("#SLIDER_LEFT").css("width"));
									//minmax();
								})
								.on("touchmove", function(event, deltaX, deltaY, deltaDistance, scaleFactor) {
									//console.log("IN touchmove(SLIDER_LEFT) deltaX=" + deltaX + " maxX=" + maxX);
									var left = startX + deltaX;
									//console.log("left=" + left);
									if (left < minX) {
										//console.log("left < minX");
										left = minX;
									}
									else if (left > maxX) {
										//console.log("left > maxX");
										left = maxX;
									}
									//console.log("left=" + left);
									jQuery("#SLIDER_LEFT").css("left", left);
								})
								.on("touchend", function()	{
									//console.log("IN touchend(SLIDER_LEFT)");
									sliders.line_left = parseInt(jQuery("#SLIDER_LEFT").css("left"));
									slider = null;
								});

								new gesture("SLIDER_RIGHT")
								.on("touchstart", function(event, x, y, distance) {
									//console.log("IN touchstart(SLIDER_RIGHT) x=" + x + " distance=" + distance);
									slider = "SLIDER_RIGHT";
									startX = parseInt(jQuery("#SLIDER_RIGHT").css("left"));
									//console.log("startX=" + startX);
									var border_size = 2;
									var rect = document.getElementById("DIV_EDIT_CONTENT").getBoundingClientRect();
									minX = sliders.line_left  + parseInt(jQuery("#SLIDER_LEFT" ).css("width"));
									maxX = rect.left + rect.width + border_size - parseInt(jQuery("#SLIDER_RIGHT").css("width"));
									//minmax();
								})
								.on("touchmove", function(event, deltaX, deltaY, deltaDistance, scaleFactor) {
									//console.log("IN touchmove(SLIDER_RIGHT) deltaX=" + deltaX);
									var left = startX + deltaX;
									if (left < minX) {
										left = minX;
									}
									else if (left > maxX) {
										left = maxX;
									}
									//console.log(left);
									jQuery("#SLIDER_RIGHT").css("left", left);
								})
								.on("touchend", function()	{
									//console.log("IN touchend(SLIDER_RIGHT)");
									sliders.line_right = parseInt(jQuery("#SLIDER_RIGHT").css("left")) + parseInt(jQuery("#SLIDER_RIGHT").css("width"));
									slider = null;
								});

							})();
						}

					};

					let img = {

						initDataURL : null,

						size : function()
						{
							return new Promise(
								(resolve, reject)=>{
									//console.info("IN image.edit()->img.size()");
									//console.log(logFromDataURL(dataURL));
									var _img_ = new Image();
									_img_.onload = function() {
										var imgWidth  = _img_.naturalWidth ;
										var imgHeight = _img_.naturalHeight;
										var orientation = (imgWidth > imgHeight) ? "landscape" : (imgWidth < imgHeight) ? "portrait" : "square";
										var rect = { width: imgWidth, height: imgHeight, orientation: orientation };
										resolve(rect);
									};
									_img_.src = dataURL;
								}
							);
						},

						// frame is the rectangle visualized by DIV_IMG_FRAME, and matching the
						// image representation on the screen as resized as background of <div>
						// DIV_EDIT_CONTENT
						//
						frame : {

							position : { top: 0, width: 0, height: 0, left: 0 },

							compute : function(width, height)
							{
								return new Promise(
									(resolve, reject)=>{

										//console.info("IN image.edit()->img.frame.compute()");

										var computing = function() 
										{
											//console.log("IN image.edit()->img.frame.compute()->computing()");
											//console.log("width=" + width + ", height=" + height);

											var rect = document.getElementById("DIV_EDIT_CONTENT").getBoundingClientRect();
											//console.log(JSON.stringify(rect));

											var orientation = (width > height) ? "landscape" : (width < height) ? "portrait" : "square";
											//console.log(orientation);

											if (orientation === "square") {
												img.frame.position.top    = rect.top;
												img.frame.position.width  = rect.width;
												img.frame.position.height = rect.height;
												img.frame.position.left   = rect.left;
											}
											else if (orientation === "landscape") {
												var frameheight = rect.height * (height / width);
												var frametop = rect.top + (rect.height - frameheight) / 2;
												img.frame.position.top    = frametop;
												img.frame.position.width  = rect.width;
												img.frame.position.height = frameheight;
												img.frame.position.left   = rect.left;
											}
											else {
												var framewidth = rect.width * (width / height);
												var frameleft = rect.left + (rect.width - framewidth) / 2;
												img.frame.position.top    = rect.top;
												img.frame.position.width  = framewidth;
												img.frame.position.height = rect.height;
												img.frame.position.left   = frameleft;
											}
											//console.log(JSON.stringify(img.frame.position));
											resolve();
										};

										if ((typeof height === "undefined") || (typeof width === "undefined")) {
											img.size()
											.then ((rect)=>{
												width = rect.width; height = rect.height;
												computing();
											});
										}
										else {
											computing();
										}

									}
								);
							},

							hide : function() 
							{
								//console.info("IN image.edit()->img.frame.hide()");
								jQuery("#DIV_IMG_FRAME").hide();
							},

							show : function()
							{
								//console.info("IN image.edit()->img.frame.show()");
								jQuery("#DIV_IMG_FRAME").css("top",    img.frame.position.top   );
								jQuery("#DIV_IMG_FRAME").css("width",  img.frame.position.width );
								jQuery("#DIV_IMG_FRAME").css("height", img.frame.position.height);
								jQuery("#DIV_IMG_FRAME").css("left",   img.frame.position.left  );
								jQuery("#DIV_IMG_FRAME").show();
							}

						},

						croparea : {

							compute : function()
							{
								return new Promise(
									(resolve, reject)=>{

										//console.info("IN image.edit()->img.croparea.compute()");

										var _img_ = new Image();

										_img_.onload = function() {
											var imgWidth  = _img_.naturalWidth ;
											var imgHeight = _img_.naturalHeight;

											var posX = 0;
											if (sliders.line_left > img.frame.position.left) {
												posX = (sliders.line_left - img.frame.position.left) * (imgWidth / img.frame.position.width);
											}
											var posY = 0;
											if (sliders.line_top > img.frame.position.top) {
												posY = (sliders.line_top - img.frame.position.top) * (imgHeight / img.frame.position.height);
											}
											var width  = (sliders.line_right - sliders.line_left) * (imgWidth / img.frame.position.width);
											var height = (sliders.line_bottom - sliders.line_top) * (imgHeight / img.frame.position.height);

											var data = { posX: posX, posY: posY, width: width, height: height };
											resolve(data);
										};

										_img_.src = dataURL;
									}
								);
							}

						},

						show : function()
						{
							//console.info("IN image.edit()->img.show()");
							jQuery("#DIV_EDIT_CONTENT").css("background-image", "url(" + dataURL + ")");
							sliders.reset();
							img.size()
							.then ((rect)=>{
								//console.log(JSON.stringify(rect));
								img.frame.compute(rect.width, rect.height)
								.then (()=>{
									img.frame.show();
									if (verbose) {
										var txt = rect.orientation + ", " + rect.width + "x" + rect.height + ", " + comprehensive_filesize(strlen(dataURL));
										jQuery("#DIV_SIZE").html(txt);
									}
								})
							});
						}
					};

					let onshow = function()
					{
						//console.info("IN image.edit()->onshow()");
						//console.log(logFromDataURL(dataURL));

						img.initDataURL = dataURL;
						img.show();

						sliders.reset();
						sliders.init ();
						
						jQuery("#BTN_UNDO").off("click").on("click", function(){
							ripple(this, function(){
								dataURL = img.initDataURL;
								img.show();
								sliders.reset();
								sliders.init ();
							});
						});

						jQuery("#BTN_RESET_SLIDERS").off("click").on("click", function(){
							ripple(this, function(){
								sliders.reset();
							});
						});

						jQuery("#BTN_ROTATE").off("click").on("click", function(){
							ripple(this, function(){
								image.rotate(dataURL, 90)
								.then ((dtRL)=>{
									//console.log(logFromDataURL(dtRL));
									dataURL = dtRL;
									img.show();
								});
							});
						});

						jQuery("#BTN_CROP").off("click").on("click", function(){
							ripple(this, function(){
								//console.log("BTN_CROP CLICKED");
								img.croparea.compute()
								.then ((data)=>{
									//console.log(JSON.stringify(data));
									image.crop(dataURL, data.posX, data.posY, data.width, data.height)
									.then ((dtRL)=>{
										//console.log(logFromDataURL(dtRL));
										dataURL = dtRL;
										img.show();
									});
								});
							});
						});

						jQuery("#BTN_FLIP_H").off("click").on("click", function(){
							ripple(this, function(){
								image.flip(dataURL, true, false)
								.then ((dtRL)=>{
									//console.log(logFromDataURL(dtRL));
									dataURL = dtRL;
									img.show();
								});
							});
						});

						jQuery("#BTN_FLIP_V").off("click").on("click", function(){
							ripple(this, function(){
								image.flip(dataURL, false, true)
								.then ((dtRL)=>{
									//console.log(logFromDataURL(dtRL));
									dataURL = dtRL;
									img.show();
								});
							});
						});

						jQuery("#BTN_CANCEL").off("click").on("click", function(){
							ripple(this, function(){
								failed();
							});
						});

						jQuery("#BTN_OK").off("click").on("click", function(){
							ripple(this, function(){
								success();
							});
						});

					};

					let show = function()
					{
						//console.info("IN image.edit()->show()");
						var options = {
							page_id      : "page_image_edit",
							contentURI   : "lib/html/image_edit.html",
							onbackbutton : onbackbutton,
							onshow       : onshow,
							globalize    : false
						};
						mypage = new page(options);
						mypage.show();
					};

					show();
				}
			);
		}

	}

);


// End of file: image.edit.js
// ============================================================================