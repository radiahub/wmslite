// ============================================================================
// Module      : image.capture.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Support for image capture or input
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 14-July-23 00:00 WIT  Denis  Deployment V. 2023 "ALEXANDRE DUMAS"
//
// ============================================================================

jQuery.extend(

	image,
	{
		capture : {

			// cast : one of "FILE_URI", "DATA_URL" string values defining 
			//        the return value format
			//
			// image.capture.input("FILE_URI")
			// .then ((imageURI)=>{...})
			// .catch(()=>{...});
			//
			input : function (cast)
			{
				return new Promise(
					(resolve, reject) => {		

						if (typeof cast === "undefined") { cast = "FILE_URI"; }

						cast = String(cast).toUpperCase();

						console.info("IN image.capture.input() cast='" + cast + "'");

						var element = document.getElementById("imageFileInputID");
						if ((typeof element === 'undefined') || (element === null)) {
							var inputHTML = '<div style="position:absolute; top:-1000px;"><input id="imageFileInputID" type="file" accept="image/*"></div>';
							jQuery("body").append(inputHTML);
						}

						jQuery("#imageFileInputID")
						.off("change")
						.val(null)
						.on ("change", function() {
							var input = document.getElementById('imageFileInputID');
							if ((input !== null) && (input.files.length > 0)) {
								var file = input.files[0];
								var imageURL = URL.createObjectURL(file);
								if (cast === "FILE_URI") {
									resolve(imageURL);
								}
								else if (cast === "DATA_URL") {
									image.toDataURL(imageURL)
									.then ((dataURL)=>{
										resolve(dataURL);
									})
									.catch(()=>{
										console.error("Rejected by image.toDataURL()");
										reject();
									});
								}
								else {
									console.error("Cast value: '" + cast + "' is not supported");
									reject();
								}
							}
							else {
								console.error("File list is empty");
								reject();
							}
						});

						jQuery("#imageFileInputID").click();
					}
				);
			},

			// cast : one of "FILE_URI", "DATA_URL" string values defining 
			//        the return value format
			//
			// image.capture.camera()
			// .then ((imageURI)=>{...})
			// .catch(()=>{...});
			//
			camera : function (cast, targetWidth, targetHeight)
			{
				return new Promise(
					(resolve, reject) => {				

						if (typeof targetHeight === "undefined") { targetHeight = 0;   }
						if (typeof targetWidth  === "undefined") { targetWidth  = 600; }

						if (typeof cast === "undefined") { cast = "DATA_URL"; }
						cast = String(cast).toUpperCase();

						console.info("IN image.capture.camera() cast='" + cast + "'");

						let options = {
							quality            : 100,
							targetWidth        : targetWidth,
							targetHeight       : targetHeight,
							destinationType    : Camera.DestinationType.FILE_URI,
							sourceType         : Camera.PictureSourceType.CAMERA,
							allowEdit          : false,
							saveToPhotoAlbum   : true,
							correctOrientation : true	
						};

						navigator.camera.getPicture(
							function (imageURI) {

								if (cast === "FILE_URI") {
									resolve(imageURI);
								}
								else if (cast === "DATA_URL") {
									image.toDataURL(imageURI)
									.then ((dataURL)=>{
										resolve(dataURL);
									})
									.catch(()=>{
										console.error("Rejected by image.toDataURL()");
										reject();
									});
								}
								else {
									console.error("Cast value: '" + cast + "' is not supported");
									reject();
								}

								/*
								window.FilePath.resolveNativePath(
									imageURI,
									function (resolvedImageUri) { 
										console.log("Resolved by window.FilePath.resolveNativePath()");
										console.log(resolvedImageUri);
										if (cast === "FILE_URI") {
											resolve(resolvedImageUri);
										}
										else if (cast === "DATA_URL") {
											image.toDataURL(resolvedImageUri)
											.then ((dataURL)=>{
												console.log(logFromDataURL(dataURL));
												resolve(dataURL);
											})
											.catch(()=>{
												console.error("Rejected by image.toDataURL()");
												reject();
											});
										}
										else {
											console.error("Cast value: '" + cast + "' is not supported");
											reject();
										}
									},
									function (err) { 
										console.error("Rejected by window.FilePath.resolveNativePath()");
										console.error(JSON.stringify(err));
										reject(); 
									}
								);
								*/

							},
							function (err) {
								console.error("Rejected by navigator.camera.getPicture()");
								console.error(JSON.stringify(err));
								reject();
							},
							options
						);

					}
				);
			},

			// cast : one of "FILE_URI", "DATA_URL" string values defining 
			//        the return value format
			//
			// image.capture.gallery("DATA_URL")
			// .then ((dataURL)=>{...})
			// .catch(()=>{...});
			//
			gallery : function (cast, targetWidth, targetHeight)
			{
				return new Promise(
					(resolve, reject) => {				

						if (typeof targetHeight === "undefined") { targetHeight = 0;   }
						if (typeof targetWidth  === "undefined") { targetWidth  = 600; }

						if (typeof cast === "undefined") { cast = "DATA_URL"; }
						cast = String(cast).toUpperCase();

						console.info("IN image.capture.gallery() cast='" + cast + "'");

						let options = {
							quality         : 100,
							targetWidth     : targetWidth,
							targetHeight    : targetHeight,
							destinationType : Camera.DestinationType.FILE_URI,
							sourceType      : Camera.PictureSourceType.SAVEDPHOTOALBUM,
							allowEdit       : false
						};

						navigator.camera.getPicture(
							function (imageURI) {
								if (cast === "FILE_URI") {
									resolve(imageURI);
								}
								else if (cast === "DATA_URL") {
									image.toDataURL(imageURI)
									.then ((dataURL)=>{
										resolve(dataURL);
									})
									.catch(()=>{
										console.error("Rejected by image.toDataURL()");
										reject();
									});
								}
								else {
									console.error("Cast value: '" + cast + "' is not supported");
									reject();
								}
							},
							function (err) {
								console.error("Rejected by navigator.camera.getPicture()");
								console.error(JSON.stringify(err));
								reject();
							},
							options
						);

					}
				);
			}

		}
	}
);


// End of file: image.capture.js
// ============================================================================