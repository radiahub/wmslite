// ============================================================================
// Module      : filesystem.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Library to handle in-browser/device (local) file system
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 14-July-23 00:00 WIT  Denis  Deployment V. 2023 "ALEXANDRE DUMAS"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// FILES AND BINARY UTILS
//
// ****************************************************************************
// ****************************************************************************

var pathHandle = function (path) {
	if (path.slice(path.length - 1, 1) !== "/") {
		path += "/";
	}
	return path;
};

var pathUnHandle = function (path) {
	if (path.slice(path.length - 1, 1) === "/") {
		path = path.slice(0, path.length - 1);
	}
	return path;
};

var randomUrlFilename = function (filename) {
	var addThis = Math.random();
	if (filename.indexOf("?") > 0) {
		return filename + "&r=" + addThis;
	}
	else {
		return filename + "?r=" + addThis;
	}
};

var fileName = function (filename) { 
	if (filename.lastIndexOf("/") >= 0) {
		filename = filename.slice(filename.lastIndexOf("/") + 1);
	}
	else if (filename.lastIndexOf("\\") >= 0) {
		filename = filename.slice(filename.lastIndexOf("\\") + 1);
	}
	return filename;
};

var stripExtension = function (filename) { 
	var result = "";
	var p = filename.lastIndexOf(".");
	if (p >= 0) {
		result = filename.slice(0, p); 
	}
	return result;
};

var setExtension = function (filename, ext) {
	var result = stripExtension(filename);
	if (ext.slice(0,1) !== ".") { ext = "." + ext; }
	result += ext;
	return result;
};

var fileExt = function (filename) { 
	var result = "";
	var p = filename.lastIndexOf(".");
	if (p >= 0) {
		result = filename.slice(p); 
	}
	return result;
};

var mimeTypeFromFileName = function (filename) 
{
	var name = fileName(filename);
	var dummy = runsync("__mimetype", {filename: name}, []);
	if (dummy === null) { dummy = ""; }
	return dummy;
};

var extensionFromMimeType = function(mimetype) 
{
	var dummy = runsync("__extension", {mimetype: mimetype}, []);
	if (dummy === null) { dummy = ""; }
	return dummy;
};

var filenameFromMimeType = function(mimetype, binary_id)
{
	if (typeof binary_id === "undefined") { binary_id = ""; }

	var dt   = datetime.now();
	var name = (strlen(binary_id) > 0) ? binary_id: dt.slice(0, 8) + "_" + dt.slice(8);

	var ext  = extensionFromMimeType(mimetype);
	if ((strlen(ext) > 0) && (ext.slice(0,1) !== ".")) {
		ext = "." + ext;
	}

	return (name + ext);
};

var logFromDataURL = function(dataURL)
{
	var len = strlen(dataURL);
	if (len >= 50) {
		return String(dataURL).slice(0, 50) + "..." + "(" + len + " chars)";
	}
	else {
		return String(dataURL);
	}
};

var mimeTypeFromDataURL = function(dataURL) {
	var mimetype = dataURL.slice(0, dataURL.indexOf(";"));
	mimetype = mimetype.slice(mimetype.indexOf(":") + 1);
	//console.log(mimetype);
	return mimetype;
};

var isDataURL = function(candidate) {
	return ((strmatch(candidate, "data:")) && (strlen(mimeTypeFromDataURL(candidate)) > 0));
};

var base64toBlob = function (base64Data, mimetype) 
{
	if (typeof mimetype === "undefined") { mimetype = "application/octet-stream"; }

	var sliceSize      = 1024;
	var byteCharacters = window.atob(base64Data);
	var bytesLength    = byteCharacters.length;
	var slicesCount    = Math.ceil(bytesLength / sliceSize);
	var byteArrays     = new Array(slicesCount);

	for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
		var begin = sliceIndex * sliceSize;
		var end = Math.min(begin + sliceSize, bytesLength);

		var bytes = new Array(end - begin);
		for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
				bytes[i] = byteCharacters[offset].charCodeAt(0);
		}

		byteArrays[sliceIndex] = new Uint8Array(bytes);
	}

	return new Blob(byteArrays, { type: mimetype });
};

var base64FromDataURL = function(dataURL) {
	var base64Data = dataURL.slice(dataURL.indexOf(",") + 1);
	return base64Data;
};

var blobFromDataURL = function(dataURL) {
	var mimetype = mimeTypeFromDataURL(dataURL);
	var base64Data = base64FromDataURL(dataURL);
	var blob = base64toBlob(base64Data, mimetype);
	return blob;
};

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes.buffer;
};




// ****************************************************************************
// ****************************************************************************
//
// DOM FILE INPUT API
//
// ****************************************************************************
// ****************************************************************************

// file : one of the elements of a DOM file input files property
// cast : one of "text", "dataURL", "arrayBuffer" (or "blob") string values
//
const fileread = function(file, cast)
{
	return new Promise(
		(resolve, reject)=>{

			if (typeof cast === "undefined") { cast = "dataURL"; }

			//console.log("IN fileread() cast='" + cast + "'");

			let reader = new FileReader();

			reader.onload = function() {
				//console.log(String(reader.result).slice(0,100));
				resolve(reader.result);
			};

			reader.onerror = function() {
				console.error(reader.error);
				reject();
			};

			if (strcasecmp(cast,"text") === 0) {
				reader.readAsText(file);
			}
			else if (strcasecmp(cast,"dataURL") === 0) {
				reader.readAsDataURL(file);
			}
			else if ((strcasecmp(cast,"arrayBuffer") === 0) || (strcasecmp(cast,"blob") === 0)) {
				reader.readAsArrayBuffer(file);
			}
		}
	);
};

// resolve = function(result) {...}
// result  = plain object { filename : "", dataURL  : "", filesize : ... };
//
const fileinput = function()
{
	return new Promise(
		(resolve, reject)=>{

			//console.info("IN fileinput()");

			var result = { filename : "", dataURL  : "" };

			var element = document.getElementById("FileInputID");
			if ((typeof element === 'undefined') || (element === null)) {
				var inputHTML = '<div style="position:absolute; top:-1000px;"><input id="FileInputID" type="file" accept="*"></div>';
				jQuery("body").append(inputHTML);
				clearFreeWHA(100);
			}

			jQuery("#FileInputID")
			.off("change")
			.val(null)
			.on ("change", function() {
				var input = document.getElementById('FileInputID');
				if ((input !== null) && (input.files.length > 0)) {

					var file = input.files[0];
					var filename = fileName(file.name);
					//console.log(filename);
					result["filename"] = filename;

					var filesize = file.size;
					//console.log(filesize);
					result["filesize"] = filesize;

					fileread(file,"dataURL")
					.then ((dataURL)=>{
						//console.log(dataURL.slice(0, 100));
						//console.log(strlen(String(dataURL)));
						result["dataURL"] = dataURL;
						resolve(result);
					})
					.catch(()=>{
						//console.log("Rejected by fileread()");
						reject();
					});

				}
			});

			jQuery("#FileInputID").click();
		}
	);
};




// ****************************************************************************
// ****************************************************************************
//
// GUI UTILS
//
// ****************************************************************************
// ****************************************************************************

function getFileShortcutIcon (mimeType) 
{
	console.info("IN binaries.getFileShortcutIcon() mimeType='" + mimeType + "'");
	
	var result = "doc_other_file.png";

	if (strmatch(mimeType, "IMAGE")) {
		result = "doc_image.png";
	}
	else if (strmatch(mimeType, "VIDEO")) {
		result = "doc_video.png";
	}
	else if (strmatch(mimeType, "AUDIO")) {
		result = "doc_audio.png";
	}
	else if (strmatch(mimeType, "application/pdf")) {
		result = "doc_adobe_acrobat.png";
	}
	else {
		var wordDocuments = [
			"application/x-abiword",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.oasis.opendocument.text",
			"text/plain"
		];

		var spreadsheetsDocuments = [
			"application/vnd.oasis.opendocument.spreadsheet",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		];

		var presentationDocuments = [
			"application/vnd.oasis.opendocument.presentation",
			"application/vnd.ms-powerpoint",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation"
		];

		if (wordDocuments.includes(mimeType)) {
			result = "doc_ms_word.png";
		}
		else if (spreadsheetsDocuments.includes(mimeType)) {
			result = "doc_ms_excel.png";
		}
		else if (presentationDocuments.includes(mimeType)) {
			result = "doc_ms_powerpoint.png";
		}
	}

	result = "lib/img/" + result;
	return result;
};




// ****************************************************************************
// ****************************************************************************
//
// CORDOVA FILESYSTEM IMPLEMENTATION
//
// ****************************************************************************
// ****************************************************************************

function filesystem ()
{
	var that = this;

	// **************************************************************************
	// **************************************************************************
	//
	// Directories and files
	// 
	// **************************************************************************
	// **************************************************************************

	this.mkdir = (path) => {
		return new Promise(
			(resolve, reject) => {

				var _mkdir_ = (folder_path) => {

					return new Promise(
						(resolve, reject) => {

							window.requestFileSystem(
								LocalFileSystem.PERSISTENT, 0,
								(fileSystem) => {
									var entry = fileSystem.root;
									entry.getDirectory(
										folder_path, 
										{ create: true, exclusive: false }, 
										() => { resolve(); }, 
										() => { reject();  }
									);
								},
								() => { reject(); }
							);
						}
					);
				};


				if (path.substr(0,1) === "/") { path = path.substr(1); }
				if (path.substr(path.length - 1, 1) === "/") { 
					path = path.substr(0, path.length - 1);
				}

				if (path.length === 0) {
					resolve();
				}
				else {

					var pathList    = breakApart(path, "/");
					var currentID   = 0;
					var currentPath = "";

					var iterate = () => {
						if (currentPath.length > 0) { currentPath += "/"; }
						currentPath += pathList[currentID];
						currentID++;
						if (currentID === pathList.length) {
							_mkdir_ (currentPath)
							.then (() => { resolve(); })
							.catch(() => { reject();  });
						}
						else {
							_mkdir_ (currentPath)
							.then (() => { iterate(); })
							.catch(() => { reject();  });
						}
					};

					iterate();
				}
			}
		);
	};

	this.localFileSystemURL = (filepath) => {
		return new Promise(
			(resolve, reject) => {
				//console.log("IN localFileSystemURL() filepath='" + filepath + "'");
				window.requestFileSystem(
					LocalFileSystem.PERSISTENT, 0,
					(fileSystem) => {
						var entry = fileSystem.root;
						entry.getFile(
							filepath, 
							{ create: true, exclusive: false }, 
							(file) => {
								//console.log(JSON.stringify(file));
								var url = file.nativeURL;
								//console.log(url);
								resolve(url);
							},
							() => {
								//console.log("Rejected by entry.getFile()");
								reject();
							}
						);
					},
					()=>{
						//console.log("Rejected by window.requestFileSystem()");
						reject();
					}
				);
			}
		);
	};

	this.nativeURL = (filepath) => {
		return new Promise(
			(resolve, reject) => {
				//console.log("IN nativeURL() filepath='" + filepath + "'");
				if (strmatch("content://", filepath) || strmatch("cdvfile://", filepath)) {
					window.FilePath.resolveNativePath(
						filepath,
						function(url) {
							resolve(url);
						},
						function(err) {
							//console.log(err.message);
							reject();
						}
					);
				}
				else if (filepath.indexOf("://") < 0) {
					that.localFileSystemURL(filepath)
					.then ((url)=>{
						resolve(url);
					})
					.catch(()=>{
						//console.log("Rejected by that.localFileSystemURL()");
						reject();
					});
				}
				else {
					resolve(filepath);
				}
			}
		);
	};	

	this.fileExists = (filepath) => {
		return new Promise(
			(resolve, reject) => {

				if (filepath.indexOf("://") > 0) {
					window.resolveLocalFileSystemURL(
						filepath,
						function (fileEntry) {
							fileEntry.file(
								function (file) {
									resolve();
								}, 
								function (e) {
									reject();
								}
							);
						},
						function (e) {
							reject();
						}
					);
				}
				else {
					window.requestFileSystem(
						LocalFileSystem.PERSISTENT, 
						0,
						function (fileSystem) {
							var entry = fileSystem.root;
							entry.getFile (
								filepath, 
								{ create: false, exclusive: false }, 
								function (fileEntry) {
									fileEntry.file(
										function (file) {
											resolve();
										}, 
										function (e) {
											reject();
										}
									);
								}, 
								function (e) {
									reject();
								}
							);
						},
						function (e) {
							reject();
						}
					);
				}

			}
		);
	};

	this.fileSize = function (fileUri) 
	{
		return new Promise(
			(resolve, reject) => {

				window.resolveLocalFileSystemURL(
					fileUri, 
					function(fileEntry) {
						fileEntry.file(
							function(fileObj) {
								resolve(fileObj.size);
							},
							function(err){
								reject(err);
							}
						);
					}, 
					function(err){
						reject(err);
					}
				);

			}
		);
	};

	this.fileRemove = function(filepath)
	{
		return new Promise(
			(resolve, reject) => {

				//console.info("IN filesystem.fileRemove() filepath='" + filepath + "'");

				var scheme = filepath.indexOf("://");
				if (scheme > 0) {
					console.error("Operation not allowed on scheme for filepath='" + filepath + "'");
					reject();
				}
				else {
					window.requestFileSystem(
						LocalFileSystem.PERSISTENT, 
						0,
						function (fileSystem) {
							var entry = fileSystem.root;
							entry.getFile (
								filepath, 
								{ create: false, exclusive: false }, 
								function (fileEntry) {
									fileEntry.remove(
										function () { 
											resolve(); 
										},
										function () { 
											console.error("Rejected by fileEntry.remove() filepath='" + filepath + "'");
											reject(); 
										}
									);
								}, 
								function () { 
									console.error("Rejected by entry.getFile() filepath='" + filepath + "'");
									reject(); 
								}
							);
						},
						function () { 
							console.error("Rejected by window.requestFileSystem() filepath='" + filepath + "'");
							reject(); 
						}
					);
				}
			}
		);
	};


	// **************************************************************************
	// **************************************************************************
	//
	// Writer API
	// 
	// **************************************************************************
	// **************************************************************************

	this.textWrite = function(filepath, text)
	{
		return new Promise(
			(resolve, reject) => {

				//console.info("IN filesystem.textWrite() filepath='" + filepath + "'");

				window.requestFileSystem(
					LocalFileSystem.PERSISTENT, 
					0,
					function (fileSystem) {
						var entry = fileSystem.root;
						entry.getFile (
							filepath, 
							{ create: true, exclusive: false }, 
							function (fileObj) {
								try {
									fileObj.createWriter(
										function (writer) {
											writer.onwrite = function(evt) {
    										//console.log("Write success (" + strlen(text) + " bytes)");
												resolve();
    									};
											writer.onerror = function() {
												console.error("Rejected by writer.onwrite() filepath='" + filepath + "'");
												reject();
											};
											writer.write(text);
										},
										function() {
											console.error("Rejected by fileObj.createWriter() filepath='" + filepath + "'");
											reject();
										}
									);
								}
								catch(err) {
									console.error("Runtime exception in filesystem.textWrite()");
									console.error(err.message);
									reject();
								}
							}, 
							function () { 
								console.error("Rejected by entry.getFile() filepath='" + filepath + "'");
								reject(); 
							}
						);
					},
					function () { 
						console.error("Rejected by window.requestFileSystem() filepath='" + filepath + "'");
						reject(); 
					}
				);
			}
		);
	};

	this.blobWrite = function(filepath, blob)
	{
		return new Promise(
			(resolve, reject) => {

				//console.info("IN filesystem.blobWrite() filepath='" + filepath + "'");

				window.requestFileSystem(
					LocalFileSystem.PERSISTENT, 
					0,
					function (fileSystem) {
						var entry = fileSystem.root;
						entry.getFile (
							filepath, 
							{ create: true, exclusive: false }, 
							function (fileObj) {
								try {
									fileObj.createWriter(
										function (writer) {
											writer.onwrite = function(evt) {
    										//console.log("Blob write success");
												resolve();
    									};
											writer.onerror = function() {
												console.error("Rejected by writer.onwrite() filepath='" + filepath + "'");
												reject();
											};
											writer.write(blob);
										},
										function() {
											console.error("Rejected by fileObj.createWriter() filepath='" + filepath + "'");
											reject();
										}
									);
								}
								catch(err) {
									console.error("Runtime exception in filesystem.blobWrite()");
									console.error(err.message);
									reject();
								}
							}, 
							function () { 
								console.error("Rejected by entry.getFile() filepath='" + filepath + "'");
								reject(); 
							}
						);
					},
					function () { 
						console.error("Rejected by window.requestFileSystem() filepath='" + filepath + "'");
						reject(); 
					}
				);
			}
		);
	};

	this.dataWrite = function(filepath, data, mimetype)
	{
		return new Promise(
			(resolve, reject) => {

				//console.info("IN filesystem.dataWrite() filepath='" + filepath + "'");

				try {
					var blob = new Blob([data], { type: mimetype });
					that.blobWrite(filepath, blob)
					.then (()=>{
						resolve();
					})
					.catch(()=>{
						console.error("Rejected by filesystem.blobWrite() filepath='" + filepath + "'");
						reject();
					});
				}
				catch(err) {
					console.error("Runtime exception in filesystem.dataWrite() filepath='" + filepath + "'");
					console.error(err.message);
					reject();
				}

			}
		);
	};


	// **************************************************************************
	// **************************************************************************
	//
	// Reader API
	// 
	// **************************************************************************
	// **************************************************************************

	// IMPORTANT: CAST APPLIES ONLY TO FILES LOCATED IN LOCAL APPLICATION FILE SYSTEM
	//            FILES LOCATED IN OTHER LOCATIONS WILL BE ALWAYS PROCESSED AS BINARY
	//
	this.fileRead = function(filepath, cast, mimetype)
	{
		return new Promise(
			(resolve, reject) => {

				if (typeof mimetype === "undefined") { mimetype = "application/octet-stream";  }
				if (typeof cast     === "undefined") { cast = "TEXT"; mimetype = "text/plain"; }

				//console.info("IN filesystem.fileRead() filepath='" + filepath + "' cast='" + cast + "' mimetype='" + mimetype + "'");

				var do_the_job = function(fileObj) {
					//console.info("IN filesystem.fileRead()->do_the_job()");

					var reader = new FileReader();

					reader.onload = function () {
						//console.log("IN filesystem.fileRead()->do_the_job()->reader.onload()");
						switch(cast.toUpperCase()) {
							case "DATAURL": {
								resolve(this.result);
								break;
							}
							case "TEXT": {
								resolve(this.result);
								break;
							}
							default: {
								var theblob = new Blob(this.result, {type: mimetype});
								resolve(theblob);
							}
						}
					};

					reader.onerror = function() {
						console.error("Rejected by reader.onread() filepath='" + filepath + "'");
						reject();
					};

					switch(cast.toUpperCase()) {
						case "DATAURL": {
							reader.readAsDataURL(fileObj);
							break;
						}
						case "TEXT": {
							reader.readAsText(fileObj);
							break;
						}
						default: {
							reader.readAsArrayBuffer(fileObj);
							break;
						}
					}
				};

				if (filepath.indexOf("://") > 0) {
					window.resolveLocalFileSystemURL(
						filepath,
						function(fileEntry) {
							fileEntry.file(
								function (fileObj) {
									do_the_job(fileObj);
								}, 
								function(e) {
									console.error("Rejected by readFile(fileEntry)");
									console.error(JSON.stringify(e));
									reject();
								}
							);
						},
						function (e) {
							console.error("Rejected by window.resolveLocalFileSystemURL()");
							console.error(JSON.stringify(e));
							reject();
						}
					);
				}
				else {
					window.requestFileSystem(
						LocalFileSystem.PERSISTENT, 
						0,
						function (fileSystem) {
							var entry = fileSystem.root;
							entry.getFile (
								filepath, 
								{ create: false, exclusive: false }, 
								function (fileEntry) {
									fileEntry.file(
										function (fileObj) {
											do_the_job(fileObj);
										},
										function() { 
											console.error("Rejected by fileEntry.file() filepath='" + filepath + "'");
											reject(); 
										}
									);
								}, 
								function () { 
									console.error("Rejected by entry.getFile() filepath='" + filepath + "'");
									reject(); 
								}
							);
						},
						function () { 
							console.error("Rejected by window.requestFileSystem() filepath='" + filepath + "'");
							reject(); 
						}
					);
				}

			}
		);
	};

}




// End of file: filesystem.js
// ============================================================================