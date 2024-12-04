// ============================================================================
// Module      : image.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Library to handle images
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 14-July-23 00:00 WIT  Denis  Deployment V. 2023 "ALEXANDRE DUMAS"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// Utils
//
// ****************************************************************************
// ****************************************************************************

var noimage   = "lib/img/usecamera.png" ;
var noprofile = "lib/img/useprofile.png";


// ****************************************************************************
// ****************************************************************************
//
// Image API
//
// ****************************************************************************
// ****************************************************************************

var image = {

	isDataURL : function (str)
	{
		console.info("IN image.isDataURL() str=" + strlen(str) + " byte(s)");
		return (str.slice(0, 5) === "data:");
	},

	// Resize an image to a given limit in pixels and return the image source 
	// in dataURL format
	//
	// source  = either the URL/URI or dataURL format, representing the image to 
	//           resize
	//
	// maxSize = max size of the larger dimension of the image source
	// 
	// resolve = function(dataURL) {...}
	//
	toDataURL : function(source, maxSize, type)
	{
		return new Promise(
			(resolve, reject)=>{

				if (typeof type    === "undefined") { type = "image/png"; }
				if (typeof maxSize === "undefined") { maxSize = 0; }
				
				maxSize = parseInt(String(maxSize));
				console.info ("IN image.asDataUrl() maxSize=" + maxSize + " type='" + type + "'");
				
				var img = new Image();

				img.onload = function() {
					var canvas = document.createElement("canvas");
					var width = img.width, height = img.height, scaleFactor = 1.0;
					
					if (maxSize > 0) {
						scaleFactor = Math.min(maxSize/width, maxSize/height);
					}
					
					canvas.width  = scaleFactor * width ;
					canvas.height = scaleFactor * height;
					var context   = canvas.getContext("2d");

					context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
					var dataURL = canvas.toDataURL(type);
					resolve(dataURL);
				};

				img.src = source;
			}
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

// jQuery DOM image function: set image data to a DOM image or DOM DIV object
//
// uri : either a valid URI/URL or a valid dbupload binary_id identifier
//
// Example: jQuery("#myObjectID").image(uri);
//          jQuery("#myObjectID").image("012345678901234567");
//
(function($) {
  $.fn.image = function(uriOrDataURL) {
		//console.info("IN jQuery(selector).image()");
		this.each(function() {
			//console.log(uriOrDataURL);
			var that = this;
			var assignUriOrDataURL = function(src) {
				if (that.tagName === 'IMG') {
					jQuery(that).attr("src", src);
				}
				else {
					jQuery(that).removeClass("thumbnail").addClass("thumbnail");
					jQuery(that).css("background-image", "url('" + src + "')");
				}
			};
			assignUriOrDataURL(uriOrDataURL);
		});
		return this;
  };
}(jQuery));


// End of file: image.js
// ============================================================================
