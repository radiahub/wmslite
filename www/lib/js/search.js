// ============================================================================
// Module      : search.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Search support library
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var search = {

	// **************************************************************************
	// **************************************************************************
	//
	// UTILS
	//
	// **************************************************************************
	// **************************************************************************

	/*
	Search result plain object JSON format:
	var searchResult = {
		"timestamp" : "", // timestamp in SQL format YYYY-MM-DD HH:NN:SS
		"scope"     : "", // information scope (matching "chip" information)
		"eval"      : "", // Eval string to locate/view/edit searchResult item
		"image"     : "", // URI (relative/absolute) of the image related to the searchResult item
		"title"     : "", // Search result title
		"text"      : ""  // Search result text
	};
	*/


	// **************************************************************************
	// **************************************************************************
	//
	// SEARCH DEFINITION
	//
	// **************************************************************************
	// **************************************************************************

	definition: {

		// collection: Array of { 
		//   scope    : Logical search scope, 
		//   onSearch : function(what) { return new Promise((resolve, reject)=>{...}); }
		//              where resolve returns an array of searchResult objects or null
		// } objects
		//
		collection: [],

		reset : function() {
			console.info("IN search.definition.reset()");
			search.definition.collection = [];
		},

		clear : function() { search.definition.reset(); },

		indexOf(scope) {
			console.info("IN search.definition.indexOf() scope='" + scope + "'");
			for (var i = 0; i < search.definition.collection.length; i++) {
				if (search.definition.collection[i]["scope"] === scope) {
					return i;
				}
			}
			return -1;
		},

		unreg : function(scope) {
			console.info("IN search.definition.unreg() scope='" + scope + "'");
			var idx = search.definition.indexOf(scope);
			if (idx >= 0) {
				search.definition.collection.splice(idx,1);
			}

		},

		reg : function(scope, onSearch) {
			console.info("IN search.definition.reg() scope='" + scope + "'");
			search.definition.unreg(scope);
			if (typeof onSearch === "function") {
				search.definition.collection.push({ scope: scope, onSearch: onSearch });
			}
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// RUNTIME
	//
	// **************************************************************************
	// **************************************************************************

	execute: function(what)
	{
		return new Promise(
			(resolve, reject)=>{
				console.info("IN search.execute() what='" + what + "'");
				var result  = [];

				var compare = function(a, b) {
					return strcmp(b.timestamp, a.timestamp);
				};

				var current = 0 ;
				var iterate = function() {
					var go_on = function() {
						current++;
						if (current >= search.definition.collection.length) {
							result.sort(compare);
							resolve(result);
						}
						else {
							iterate();
						}
					};

					search.definition.collection[current].onSearch(what)
					.then ((items)=>{
						if (items !== null) {
							for (var i = 0; i < items.length; i++) {
								result.push(items[i]);
							}
						}
						go_on();
					})
					.catch(()=>{
						console.warn("Rejected by onSearch() current=" + current + " scope='" + search.definition.collection[current].scope + "'");
						go_on();
					});

				};

				iterate();
			}
		);
	},


	// **************************************************************************
	// **************************************************************************
	//
	// HISTORY
	//
	// **************************************************************************
	// **************************************************************************

	history: {

		save : function(data) {
			console.info("IN search.history.save()");
			storage.set("search_history", payload_encode(data));
		},

		restore : function() {
			console.info("IN search.history.restore()");
			try {
				var dummy = storage.get("search_history");
				if (strlen(dummy) > 0) {
					var result = payload_decode(dummy);
					return result;
				}
			}
			catch(e) {
				console.error("Runtime exception");
				console.error(e);
			}
			return null;
		},

		reset : function() {
			console.info("IN search.history.reset()");
			search.history.save([]);
			return [];
		},

		indexOf : function(what, collection) {
			if ((typeof collection === "undefined") || (collection === null)) {
				collection = search.history.restore();
			}
			if (collection !== null) {
				for (var i = 0; i < collection.length; i++) {
					if (strcasecmp(collection[i], what) === 0) {
						return i;
					}
				}
			}
			return -1;
		},

		delete : function(what) {
			var collection = search.history.restore();
			if (collection !== null) {
				var idx = search.history.indexOf(what, collection);
				if (idx >= 0) {
					collection.splice(idx, 1);
					search.history.save(collection);
				}
			}
			return collection;
		},

		prepend : function(what) {
			var collection = search.history.restore();
			if (collection !== null) {
				var idx = search.history.indexOf(what, collection);
				if (idx < 0) {
					var arr = [what];
					for (var i = 0; i < collection.length; i++) {
						arr.push(collection[i]);
					}
					collection = Object.assign([], arr);
				}
			}
			else {
				collection = [what];
			}
			search.history.save(collection);
			return collection;
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// GUI SEARCH PAGE
	//
	// **************************************************************************
	// **************************************************************************

	page : null,

	onbackbutton: function()
	{
		console.log("IN search.onbackbutton()");
		search.hide();
	},

	onthemechanged: function(newThemeID)
	{
		return new Promise(
			(resolve, reject) => {

				if (strlen(newThemeID) === 0) {
					var dummy = storage.get("theme_radiahub");
					dummy = str_replace("theme-", "", dummy );
					if (strlen(dummy) > 0) {
						newThemeID = dummy;
					}
				}

				console.log("IN search.onthemechanged() newThemeID='" + newThemeID + "'");

				if (strcasecmp(newThemeID, "LIGHT") === 0) {
					jQuery("#BTN_SEARCH_SCAN").find("img").attr("src", "lib/img/scan-black.png");
				}
				else {
					jQuery("#BTN_SEARCH_SCAN").find("img").attr("src", "lib/img/scan-white.png");
				}

				resolve();
			}
		);
	},

	onscanned: function(message)
	{
		return new Promise(
			(resolve, reject)=>{
				console.info("IN search.onscanned()");
				console.log(JSON.stringify(message));
				var dataType = message["dataType"];
				switch(dataType) {
					case "BARCODE": {
						var data = message["data"];
						console.log(JSON.stringify(data));
						var format = data["format"];
						switch(format.toUpperCase()) {
							case "QR_CODE": {
								console.warn("cannot process QR code scan here");
								reject();
								break;
							}
							default : {
								var text = data["text"];
								if (strlen(text) > 0) {
									jQuery("#INP_SEARCH_FILTER").val(text);
									resolve();
								}
								else {
									console.warn("scanned text is empty");
									reject();
								}
								break;
							}
						}
						break;
					}
				}
			}
		);
	},

	choices: {

		chips : {

			all: {

				selected: function() {
					var result = true;
					jQuery(".search_scope_chip").each(function(id, elt){
						//console.log(elt);
						if (! jQuery(elt).hasClass("selected")) {
							result = false;
						}
					});
					return result;
				},

				select: function() {
					jQuery(".search_scope_chip").each(function(id, elt){
						if (! jQuery(elt).hasClass("selected")) {
							jQuery(elt).addClass("selected");
						}
					});
				},

				deselect: function() {
					jQuery(".search_scope_chip").each(function(id, elt){
						if (jQuery(elt).hasClass("selected")) {
							jQuery(elt).removeClass("selected");
						}
					});
				}

			},

			get: function() {
				var result = [];
				jQuery(".search_scope_chip").each(function(id, elt){
					if (! jQuery(elt).hasClass("selected")) {
						var scope = jQuery(elt).data("scope");
						result.push(scope);
					}
				});
				return result;
			},

			onshow: function() {

				jQuery("#CHIP_SELECT_ALL").off("click").on("click", function(){
					if (jQuery(this).hasClass("selected")) {
						jQuery(this).removeClass("selected");
						search.choices.chips.all.deselect();
					}
					else {
						jQuery(this).addClass("selected");
						search.choices.chips.all.select();
					}
				});

				jQuery(".search_scope_chip").off("click").on("click", function(){
					if (jQuery(this).hasClass("selected")) {
						jQuery(this).removeClass("selected");
						jQuery("#CHIP_SELECT_ALL").removeClass("selected");
					}
					else {
						jQuery(this).addClass("selected");
						if (search.choices.chips.all.selected()) {
							if (!jQuery("#CHIP_SELECT_ALL").hasClass("selected")) {
								jQuery("#CHIP_SELECT_ALL").addClass("selected");
							}
						}
					}
				});

			},

			show: function() {
				for (var i = 0; i < search.definition.collection.length; i++) {
					var scope   = search.definition.collection[i]["scope"];
					var caption = R.get(scope);
					var html = jQuery("#DIVTPL_SEARCH_SCOPE_CHIP").html();
					html = str_replace("__", "", html);
					html = str_replace("[scope]", scope, html);
					html = str_replace("[caption]", caption, html);
					jQuery("#DIV_SEARCH_SCOPES").append(html);
				}
				search.choices.chips.onshow();
			}

		},

		history : {

			onshow: function() {

				jQuery(".div_history_item").off("click").on("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					var that = this;
					ripple(this, function(){
						var what = jQuery(that).data("text");
						console.log(what);
						jQuery("#INP_SEARCH_FILTER").val(what);
						jQuery("#INP_SEARCH_FILTER").focus();
					});
				});

				jQuery(".div_history_delete").off("click").on("click", function(e){
					e.preventDefault();
					e.stopPropagation();
					var that = jQuery(this).closest(".div_history_item");
					ripple(this, function(){
						var what = jQuery(that).data("text");
						console.log(what);
						search.history.delete(what);
						search.choices.history.show();
					});
				});

			},

			show : function() {
				var rows = search.history.restore();
				console.log(rows);

				jQuery("#DIV_SEARCH_HISTORY").empty();

				if (rows !== null) {
					for (var i = 0; i < rows.length; i++) {
						var html = jQuery("#DIVTPL_SEARCH_HISTORY_ENTRY").html();
						html = str_replace("[what]", rows[i], html);
						jQuery("#DIV_SEARCH_HISTORY").append(html);
					}
				}

				search.choices.history.onshow();
			}

		},

		onshow: function() {
			console.info("IN search.choices.onshow()");
			search.choices.chips.show();
			search.choices.history.show();
		},

		show : function() {
			console.info("IN search.choices.show()");
			jQuery("#DIV_SEARCH_RESULTS").hide();
			jQuery("#DIV_SEARCH_CHOICES").show();
			search.choices.onshow();
		}

	},

	results: {

		rows : null,

		onshow: function() {

		},

		show : function(rows) {

			console.info("IN search.results.show()");
			console.log(JSON.stringify(rows));

			jQuery("#DIV_SEARCH_CHOICES").hide();
			jQuery("#DIV_SEARCH_RESULTS").show();
			jQuery("#DIV_SEARCH_RESULTS").empty();

			if (rows !== null) {
				for (var i = 0; i < rows.length; i++) {
					var html = (strlen(rows[i]["image"]) > 0) ? jQuery("#DIVTPL_SEARCH_RESULT_IMAGE").html() : jQuery("#DIVTPL_SEARCH_RESULT_NO_IMAGE").html();
				}
			}

		} 

	},

	onkeyup : function(e)
	{
		console.info("IN search.onkeyup()");
		if ( e.which === 13 ) {
			var what = jQuery("#INP_SEARCH_FILTER").val();
			console.log("what='" + what + "'");
			if (strlen(what) > 2) {
				search.execute(what)
				.then ((rows)=>{
					console.log("Resolved by search.execute()");
					console.log(JSON.stringify(rows));
					search.results.show(rows);
				})
				.cach(()=>{
					console.error("Rejected by search.execute()");
				});
			}
			else {
				jQuery("#INP_SEARCH_FILTER").focus();
			}
		}
	},

	onshow: function()
	{
		console.info("IN search.onshow()");

		jQuery("#DIV_BTN_SEARCH_SCAN").show();
		jQuery("#DIV_INP_SEARCH_FILTER").css("width", 'calc(100% - 7.2em)');

		search.onthemechanged()
		.then (()=>{
			console.log("Resolved by search.onthemechanged()");
		})
		.catch(()=>{
			console.warn("Rejected by search.onthemechanged()");
		});


		search.choices.show();
		var thenews = news.parse();
		console.log(thenews);
		

		jQuery("#INP_SEARCH_FILTER").off("keyup").on("keyup", search.onkeyup);

		/*
		jQuery("div.search_result").off("click").on("click", function(e){
			e.preventDefault();
			e.stopPropagation();
			ripple(this, function(){
				console.log("Clicked on DIV");
			});
		});

		jQuery("span.search_result").off("click").on("click", function(e){
			e.preventDefault();
			e.stopPropagation();
			ripple(this, function(){
				console.log("Clicked on SPAN");
			});
		});
		*/

		jQuery("#BTN_SEARCH_CLEAR").off("click").on("click", function(){
			ripple(this, function(){
				jQuery("#INP_SEARCH_FILTER").val("");
				jQuery("#INP_SEARCH_FILTER").focus();
			});
		});

		if ((cordova.plugins.barcodeScanner) && (typeof barcode !== "undefined")) {
			ipc.dispatcher.reg("BARCODE", search.onscanned);
			jQuery("#BTN_SEARCH_SCAN").off("click").on("click", function(){
				ripple(this, function(){
					barcode.read()
					.then (()=>{
						console.log("Resolved by barcode.read()");
					})
					.catch(()=>{
						console.warn("Rejected by barcode.read()");
					});
				});
			});
		}

	},

	hide : function() 
	{
		console.log("IN search.hide()");
		if (search.page !== null) {
			search.page.remove();
			search.page = null;
		}
	},

	show: function()
	{
		console.log("IN search.show()");	
		search.page = new page({
			page_id          : "page_search",
			containerID      : "",
			contentURI       : "lib/html/search.html",
			scriptURI        : "lib/js/search.js",
			windowObjectName : "search",
			gateway          : "",
			onbackbutton     : search.onbackbutton,
			onthemechanged   : search.onthemechanged,
			onshow           : search.onshow,
			globalize        : true
		});

		if (search.page !== null) { 			
			search.page.show();
		}
	}

};


// End of file: search.js
// ============================================================================