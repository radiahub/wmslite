// ============================================================================
// Module      : pages.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Pages support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
// 
// PAGES HTML TEMPLATES
//
// ****************************************************************************
// ****************************************************************************

var pageHtml = '<div id="[page_id]" class="page background overflow-none">&nbsp;</div>';


// ****************************************************************************
// ****************************************************************************
// 
// PAGES STACK
//
// ****************************************************************************
// ****************************************************************************

var pages = {

	/*
	 * RESIZABLES
	 *
	 */
	resizeables : {

		collection: [], // array of resizeables : { id:"", callback:function(){ return new Promise(...); } }

		indexOf : function(id)
		{
			//console.info("IN pages.resizeables.indexOf()");
			for (var i = 0; i < pages.resizeables.collection.length; i++) {
				if (pages.resizeables.collection[i].id === id) {
					return i;
				}
			}
			return -1;
		},

		reg : function(id, F)
		{
			//console.info("IN pages.resizeables.reg()");
			var idx = pages.resizeables.indexOf(id);
			if (idx >= 0) {
				pages.resizeables.collection[idx].callback = F;
			}
			else {
				pages.resizeables.collection.push({ id: id, callback: F });
			}
		},

		unreg: function(id)
		{
			//console.info("IN pages.resizeables.unreg()");
			var idx = pages.resizeables.indexOf(id);
			if (idx >= 0) {
				pages.resizeables.collection.splice(idx, 1);
			}
		},

		onresize: function()
		{
			return new Promise(
				(resolve, reject) => {
					//console.info("IN pages.resizeables.onresize()");
					if (pages.resizeables.collection.length > 0) {
						var current = 0;
						var iterate = function() {
							var go_on = function() {
								current++;
								if (current >= pages.resizeables.collection.length) {
									resolve();
								}
								else {
									iterate();
								}
							};
							if (typeof pages.resizeables.collection[current].callback === "function") {
								pages.resizeables.collection[current].callback()
								.then (()=>{
									go_on();
								})
								.catch(()=>{
									//console.warn("Rejected by callback() id='" + pages.resizeables.collection[current].id + "'");
									go_on();
								});
							}
							else {
								go_on();
							}
						};
						iterate();
					}
					else {
						resolve();
					}
				}
			);
		}

	},


	/*
	 * STACK
	 *
	 */
	collection: [], // array of page objects

	indexOf : function(page_id) 
	{
		try {
			for (var i = 0; i < pages.collection.length; i++) {
				if (pages.collection[i]["options"]["page_id"] === page_id) {
					return i;
				}
			}
			return -1;
		}
		catch(e) {
			return -1;
		}
	},

	first : function() 
	{
		//console.info("IN pages.first()");
		if (pages.collection.length > 0) {
			var firstnum = 0;
			while (firstnum < pages.collection.length) {
				if (strlen(pages.collection[firstnum]["options"]["containerID"]) === 0) {
					return pages.collection[firstnum];
				}
				else {
					firstnum++;
				}
			}
		}
		return null;
	},

	last : function() 
	{
		//console.info("IN pages.last()");
		//(pages.dump());
		if (pages.collection.length > 0) {
			var lastnum = pages.collection.length - 1;
			//console.log(pages.collection[lastnum]);
			return pages.collection[lastnum];
			/*
			while (lastnum >= 0) {
				if (strlen(pages.collection[lastnum]["containerID"]) === 0) {
					return pages.collection[lastnum];
				}
				else {
					lastnum--;
				}
			}
			*/
		}
		return null;
	},

	push : function(somepage)
	{
		//console.info("IN pages.push()");
		//console.log(JSON.stringify(somepage["options"]));
		try {
			var page_id = somepage["options"]["page_id"];
			if (strlen(page_id) > 0) {
				var idx = pages.indexOf(page_id);
				if (idx < 0) {
					pages.collection.push(somepage);
					return (pages.collection.length - 1);
				}
			}
			return -1
		}
		catch(e) {
			//console.error("Runtime exception in pages.push()");
			return -1;
		}
	},

	delete : function(page_id) 
	{
		//console.info("IN pages.delete() page_id='" + page_id + "'");
		var idx = pages.indexOf(page_id);
		if (idx >= 0) {
			pages.collection.splice(idx, 1);
			return true;
		}
		return false;
	},

	dump : function()
	{
		//console.info("IN pages.dump()");
		var txt = "###PAGE_STACK";
		if (pages.collection.length > 0) {
			for (var i = pages.collection.length - 1; i >= 0; i--) {
				txt += "\n" + i + ". " + pages.collection[i]["options"]["page_id"];
				if (strlen(pages.collection[i]["options"]["containerID"]) > 0) {
					txt += "->" + pages.collection[i]["options"]["containerID"];
				}
			}
		}
		txt += "\nPAGE_STACK;\n";
		return txt;
	},

	clear : function()
	{
		//console.info("IN pages.clear()");
		if (pages.collection.length > 0) {
			for (var i = pages.collection.length - 1; i >= 0; i--) {
				if (strlen(pages.collection[i]["options"]["containerID"]) > 0) {
					jQuery("#" + pages.collection[i]["options"]["containerID"]).empty();
				}
				else {
					//console.log("Removing a stand-alone page");
					jQuery("#" + pages.collection[i]).remove();
				}
				pages.delete(pages.collection[i]);
			}
		}
	},

	/*
	 * GLOBAL PAGES EVENTS
	 *
	 */
	onbackbutton : function() 
	{
		//console.info("IN pages.onbackbutton()");
		if ((typeof mockupTools !== "undefined") && (jQuery("#MOCKUP_TOOLS_CONTAINER").is(":visible"))) {
			mockupTools.hide();
		}
		else {
			var P = pages.last();
			//console.log(JSON.stringify(P));
			if (P !== null) {
				//console.log(typeof P.onbackbutton);
				if (typeof P["options"]["onbackbutton"] === "function") {
					//console.log("Executing onbackbutton()");
					P["options"]["onbackbutton"]();
					var Q = pages.last();
					if (Q === null) {
						//console.info("Last page closed, no more page displayed!");
						application.mobileExit();
					}
				}
			}
			else {
				//console.info("No more page displayed!");
				application.mobileExit();
			}
		}
	},

	onwindowresize : function()
	{
		return new Promise(
			(resolve, reject)=>{
				
				//console.info("IN pages.onwindowresize()");

				var do_the_job = function() {

					//console.log(pages.collection);

					if (pages.collection.length > 0) {
						var current = pages.collection.length - 1;
						var iterate = function() {
							var go_on = function() {
								current--;
								if (current >= 0) {
									iterate();
								}
								else {
									resolve();
								}
							};
							//console.log("Resizing " + pages.collection[current]["page_id"]);
							if (typeof pages.collection[current]["options"].onwindowresize === "function") {
								pages.collection[current]["options"].onwindowresize()
								.then (()=>{
									go_on();
								})
								.catch(()=>{
									var msg = "Rejected by onwindowresize() "
													+ "on current=" + current + ": "
													+ pages.collection[current]["options"]["page_id"];
									//console.warn(msg);
									go_on();
								});
							}
							else {
								go_on();
							}
						};
						iterate();
					}
					else {
						resolve();
					}

				};

				pages.resizeables.onresize()
				.then(()=>{
					do_the_job();
				})
				.catch(()=>{
					//console.warn("Rejected by pages.resizeables.onresize()");
					do_the_job();
				});

			}
		);
	},

	onthemechanged : function(newThemeID) 
	{
		return new Promise(
			(resolve, reject)=>{
				//console.info("IN pages.onthemechanged() newThemeID='" + newThemeID + "'");

				if ((strlen(newThemeID) > 0) && (pages.collection.length > 0)) {
					var current = pages.collection.length - 1;
					var iterate = function() {
						var go_on = function() {
							current--;
							if (current >= 0) {
								iterate();
							}
							else {
								resolve();
							}
						};
						if (typeof pages.collection[current]["options"].onthemechanged === "function") {
							pages.collection[current]["options"].onthemechanged(newThemeID)
							.then (()=>{
								go_on();
							})
							.catch(()=>{
								var msg = "Rejected by onthemechanged() "
												+ "on current=" + current + ": "
												+ pages.collection[current]["options"]["page_id"] + " "
												+ "newThemeID='" + newThemeID + "'";
								//console.warn(msg);
								go_on();
							});
						}
						else {
							go_on();
						}
					};
					iterate();
				}
				else {
					resolve();
				}

			}
		);
	},

	onprofilechanged : function(profileRecord) 
	{
		return new Promise(
			(resolve, reject)=>{

				var my_phone_no = storage.get("my_phone_no");
				//console.info("IN pages.onprofilechanged() my_phone_no='" + String(my_phone_no) + "'");
				if ((strlen(my_phone_no) > 0) && (pages.collection.length > 0)) {
					//console.log("Resolve with my_phone_no='" + my_phone_no + "'");

					profile.load(my_phone_no)
					.then ((row)=>{
						//console.log("Resolved by profile.load()");
						//console.log(JSON.stringify(row));

						var current = pages.collection.length - 1;
						var iterate = function() {
							var go_on = function() {
								current--;
								if (current >= 0) {
									iterate();
								}
								else {
									resolve();
								}
							};
							if (typeof pages.collection[current]["options"].onprofilechanged === "function") {
								pages.collection[current]["options"].onprofilechanged(row)
								.then (()=>{
									go_on();
								})
								.catch(()=>{
									/*
									var msg = "Rejected by onprofilechanged() "
													+ "on current=" + current + ": "
													+ pages.collection[current]["page_id"];
									//console.warn(msg);
									*/
									go_on();
								});
							}
							else {
								go_on();
							}
						};

						iterate();

					})
					.catch(()=>{
						//console.error("Rejected by profile.load()");
						reject();
					});

				}
				else {
					//console.warn("Nothing to do");
					resolve();
				}
			}
		);
	}

};




// ****************************************************************************
// ****************************************************************************
// 
// WINDOW RESIZE PAGE EVENT SUPPORT
//
// ****************************************************************************
// ****************************************************************************

const onwindowresizeEvent = function()
{
	//console.info("IN onwindowresizeEvent()");
	pages.onwindowresize()
	.then (()=>{
		//console.log("Resolved by pages.onwindowresize()");
	})
	.catch(()=>{
		//console.warn("Rejected by pages.onwindowresize()");
	});
};

jQuery(window).resize(function(){
	debounce(onwindowresizeEvent, 300, "onwindowresize");
});




// ****************************************************************************
// ****************************************************************************
// 
// PAGE OBJECT
//
// ****************************************************************************
// ****************************************************************************

function page (options)
{
	var that = this;
	
	this.options = {
		page_id          : "",    // Mandatory, string, not empty
		containerID      : "",    // Optional, string: if not empty, DOM ID of the page container
		contentURI       : "",    // Mandatory, string, URI/URL where the page content can be loaded from
		scriptURI        : "",    // Optional, string: path+name of the related .js script (useful on debug/mockup reload)
		windowObjectName : "",    // Optional, string: name of the object which loads the page
		onbackbutton     : noop,  // Callback, called when the back button has been pressed while the page was displayed: mandatory
		onshow           : noop,  // Callback, called when the page html layout has been shown to the viewport: mandatory
		onwindowresize   : null,  // Optional, Callback, called when the viewport has been resized
		onthemechanged   : null,  // Optional, Callback, called when the theme has changed: null, or return Promise()  
		onprofilechanged : null,  // Optional, Callback, called when the user profile has changed: null, or return Promise()
		globalize        : false  // Optional: if true, will attempt to load globalized (translated) resources
	};

	for (var i in options) { this.options[i] = options[i]; }

	// **************************************************************************
	// **************************************************************************
	//
	// SYNCHRONOUS PAGE (PRE)LOADER
	//
	// **************************************************************************
	// **************************************************************************

	this.load = () => {

		return new Promise(
			(resolve, reject) => {
				var filepath = that.options.contentURI;
				if (that.options.globalize) { 
					filepath = globalizedFileUri(filepath);
				}
				
				//console.info("IN page.load() page_id='" + that.options.page_id + "' filepath='" + filepath + "'");

				try {
					buffer = file2bin(filepath);
					if (strlen(buffer) > 0) {
						resolve(buffer);
					}
					else {
						reject();
					}

					/*
					application.load(filepath)
					.then ((buffer)=>{
						//console.log(buffer);
						//console.log(strlen(buffer));
						if (strlen(buffer) > 0) {
							resolve(buffer);
						}
						else {
							reject();
						}
					})
					.catch(()=>{
						//console.error("Rejected by application.load()");
						reject();
					});
					*/
				}
				catch(e) {
					//console.error("Runtime exception in page.load()");
					//console.error(e);
					reject();
				}

			}
		);
	};

	// **************************************************************************
	// **************************************************************************
	//
	// DISPLAY
	//
	// **************************************************************************
	// **************************************************************************

	this.hasOverflowYClass = false;

	this.show = function(absolute)
	{
		if (typeof absolute === "undefined") { absolute = false; }
		//console.info("IN page.show() page_id='" + that.options.page_id + "' absolute=" + String(absolute));
		try {

			that.load()
			.then ((content)=>{

				//console.log(content);
				if (strlen(content) > 0) {
					if (absolute) {

						var html = str_replace("[page_id]", that.options.page_id, pageHtml);
						jQuery(document.body).append(html);
						pages.push(that);
						jQuery("#" + that.options.page_id).html(content);
						if (typeof that.options.onshow === "function") {
							that.options.onshow();
						}

					}
					else {

						if (strlen(that.options.containerID) > 0) {
							//jQuery("#" + that.options.containerID).html(content);
							
							if (jQuery("#" + that.options.containerID).hasClass("overflow-y")) {
								that.hasOverflowYClass = true;
								jQuery("#" + that.options.containerID).scrollTop(0);
								jQuery("#" + that.options.containerID)
								.removeClass("overflow-y")
								.addClass("overflow-none");
							}

							//var scrollHeight = document.getElementById(that.options.containerID).scrollHeight;
							var html = str_replace("[page_id]", that.options.page_id, pageHtml);
							jQuery("#" + that.options.containerID).append(html);
							//jQuery("#" + that.options.page_id).css("height", scrollHeight);
							pages.push(that);
							jQuery("#" + that.options.page_id).html(content);
							if (typeof that.options.onshow === "function") {
								that.options.onshow();
							}
						}
						else {
							var html = str_replace("[page_id]", that.options.page_id, pageHtml);
							jQuery(document.body).append(html);
							pages.push(that);
							jQuery("#" + that.options.page_id).html(content);
							if (typeof that.options.onshow === "function") {
								that.options.onshow();
							}
						}
						
					}
				}
				else {
					//console.error("Download from contentURI returned empty");
				}

			})
			.catch(()=>{
				//console.error("Rejected by page.load()");
			});

		}
		catch(e) {
			//console.error("Runtime exception in page.show() page_id='" + that.options.page_id + "'");
			//console.error(e);
		}
	};

	this.reload = function()
	{
		//console.info("IN page.reload() page_id='" + that.options.page_id + "'");
		try {
			if ((strlen(that.options.scriptURI) > 0) && (strlen(that.options.windowObjectName) > 0)) {
				//console.log(that.options.scriptURI);
				//console.log(that.options.windowObjectName);
				var arr = []; arr.push(that.options.windowObjectName);
				application.unload(that.options.scriptURI, arr)
				.then (()=>{
					//console.log("Resolved by application.unload()");
					that.remove();
					delay(200, function(){
						application.load(that.options.scriptURI)
						.then (()=>{
							delay(100, function(){
								if (val.isset(window[that.options.windowObjectName])) {
									window[that.options.windowObjectName].show();
								}
								else {
									//console.error("application.load() returned null object '" + windowObjectName + "'");
								}
							});
						})
						.catch(()=>{
							//console.error("Rejected by application.load() filepath='" + that.options.scriptURI + "'");
						});
					});
				})
				.catch(()=>{
					//console.error("Rejected by application.unload()");
				});
			}
		}
		catch(e) {
			//console.error("Runtime exception");
			//console.error(e);
		}
	};

	this.remove = function()
	{
		//console.info("IN page.remove()");

		jQuery("#" + that.options.page_id).remove();
		if (strlen(that.options.containerID) > 0) {
			if (that.hasOverflowYClass) {
				that.hasOverflowYClass = false;
				jQuery("#" + that.options.containerID)
				.removeClass("overflow-none")
				.addClass("overflow-y");
				jQuery("#" + that.options.containerID).scrollTop(0);
			}
		}

		pages.delete(that.options.page_id);
		//console.log("Done");
	};

	// **************************************************************************
	// **************************************************************************
	//
	// INITIALIZATION
	//
	// **************************************************************************
	// **************************************************************************

	this.init = function()
	{
		//console.info("IN page.init()");
		//console.log(JSON.stringify(that.options));
		pages.push(that);
	};

	this.init();
}




// End of file: pages.js
// ============================================================================