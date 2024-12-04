// ============================================================================
// Module      : echo.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Application monitoring on-screen messages support
//               for Android-based application
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 2-Feb-24 00:00:00 WIT Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// echo implementation
//
// ****************************************************************************
// ****************************************************************************

var echo = {

	// **************************************************************************
	// **************************************************************************
	//
	// Runtime
	//
	// **************************************************************************
	// **************************************************************************

	selectedText : function()
	{
		var text_ = "";
		jQuery("#DIV_ECHO_DATA .echoline").each(function(){
			var id = jQuery(this).attr("id");
			if (jQuery("#" + id).hasClass("echoselected")) {
				if (strlen(text_) > 0) { text_ += "\n"; }
				var dum = jQuery("#" + id).find(".echoline-text").text();
				text_ += dum;
				text_ += "\n";
				var dum = jQuery("#" + id).find(".echoline-time").text();
				text_ += dum; 
			}
		});
		return text_;
	},

	text : function()
	{
		var text_ = "";
		jQuery("#DIV_ECHO_DATA .echoline").each(function(){
			if (strlen(text_) > 0) { text_ += "\n"; }
			var dum = jQuery(this).find(".echoline-text").text();
			text_ += dum;
			text_ += "\n";
			var dum = jQuery(this).find(".echoline-time").text();
			text_ += dum; 
		});
		return text_;
	},

	toast : function(sometext, is_error, timeout)
	{
		if (typeof timeout  === "undefined") { timeout  = 2000 ; }
		if (typeof is_error === "undefined") { is_error = false; }

		if (is_error) {
			jQuery("#DIV_ECHO_TOASTERROR").text(sometext);
			jQuery("#DIV_ECHO_TOASTERROR").show();
			setTimeout( function(){ jQuery("#DIV_ECHO_TOASTERROR").hide(); }, timeout);
		}
		else {
			jQuery("#DIV_ECHO_TOAST").text(sometext);
			jQuery("#DIV_ECHO_TOAST").show();
			setTimeout( function(){ jQuery("#DIV_ECHO_TOAST").hide(); }, timeout);
		}
	},

	write : function(st, scope, fileinfo)
	{
		if (typeof fileinfo === "undefined") { fileinfo = ""; }
		if (typeof scope === "undefined") { scope = "log"; }

		//alert("IN echo.write() scope='" + scope + "' st='" + st + "'");
		echo.init();
		echo.show();
		//alert("AFTER echo.show()");

		if (strlen(fileinfo) === 0) {

			var stk = StackTrace.getSync();
			//alert(stk);
			//alert("0:" + String(stk[0]));
			//alert("1:" + String(stk[1]));
			//alert("2:" + String(stk[2]));
			//alert("3:" + String(stk[3]));
			//alert("4:" + String(stk[4]));
			//alert("5:" + String(stk[5]));
			//console.log(JSON.stringify(stk));
			//alert(JSON.stringify(stk));

			var fileinfo = String(stk[5]);

			var p = fileinfo.indexOf("file:///");
			if (p >= 0) { fileinfo = fileinfo.slice(p + 8); }
			fileinfo = str_replace("android_asset/www/", "", fileinfo);
			fileinfo = str_replace("(", "", fileinfo);
			fileinfo = str_replace(")", "", fileinfo);

		}

		//alert(fileinfo);
		if (strmatch(fileinfo,"INAPPBROWSER")) {
			fileinfo = str_replace("inAppBrowser", "", fileinfo);
			fileinfo = str_replace("//", "", fileinfo);
			fileinfo = fileinfo.slice(fileinfo.indexOf("/") + 1);
			fileinfo = '<span class="fg-yellow">' + fileinfo + "</span>";
		}

		var color = "fg-lightgray";
		switch(scope) {
			case "info" :                  { color = "fg-green";  break; }
			case "warn" : case "warning" : { color = "fg-orange"; break; }
			case "err"  : case "error"   : { color = "fg-red";    break; }
		}

		var echoline_id = "EL_" + rand_hex_str(16);

		var html = jQuery("#DIVTPL_ECHO_ECHOLINE").html();
		html = str_replace("[echoline_id]", echoline_id, html);
		html = str_replace("[fg-color]", color, html);

		var time = datetime.sql(); time = String(time); time = time.slice(11);
		time += " " + fileinfo;
		html = str_replace("[time]", time, html);

		st = str_replace("\n","<br>", st);
		html = str_replace("[text]", st, html);

		jQuery("#DIV_ECHO_DATA").append(html);

		jQuery("#" + echoline_id).off("click").on("click", function(){
			if (typeof nativeclick !== "undefined") {
				nativeclick.trigger();
			}
			var id = jQuery(this).attr("id");
			if (jQuery("#" + id).hasClass("echoselected")) {
				jQuery("#" + id).removeClass("echoselected");
			}
			else {
				jQuery("#" + id).addClass("echoselected");
			}
		});

		setTimeout(echo.scroll, 100);
	},

	log : function(st)
	{
		//alert(st);
		echo.write(st, "log");
	},

	info : function(st)
	{
		//alert("IN echo.info()");
		echo.write(st, "info");
	},

	warn : function(st)
	{
		echo.write(st, "warn");
	},

	warning : function(st)
	{
		echo.write(st, "warn");
	},

	err : function(st)
	{
		echo.write(st, "err");
	},

	error : function(st)
	{
		echo.write(st, "err");
	},

	clear: function()
	{
		//echo.init();
		echo.show();
		jQuery("#DIV_ECHO_DATA").empty();
	},


	// **************************************************************************
	// **************************************************************************
	//
	// GUI
	//
	// **************************************************************************
	// **************************************************************************

	showing : function()
	{
		return (jQuery("#DIV_ECHO_CONTAINER").is(":visible"));
	},

	scroll : function()
	{
		var objDiv = document.getElementById("DIV_ECHO_DATA");
		objDiv.scrollTop = objDiv.scrollHeight;
	},

	hide : function()
	{
		if (typeof application !== "undefined") {
			if (application.mobileExitRequested) {
				application.close_local_database_and_exit();
			}
			else {
				application.enable_back_button_callback();
				if (DOMExists("DIV_ECHO_CONTAINER")) {
					jQuery("#DIV_ECHO_CONTAINER").hide();
				}
			}
		}
		else {
			if (DOMExists("DIV_ECHO_CONTAINER")) {
				jQuery("#DIV_ECHO_CONTAINER").hide();
			}
		}
	},

	show : function()
	{
		if (! echo.showing()) {
			//alert("Before application.disable_back_button_callback()");
			//application.disable_back_button_callback();
			//alert("After application.disable_back_button_callback()");
			jQuery("#DIV_ECHO_CONTAINER").show();
			echo.onshow();
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Events
	//
	// **************************************************************************
	// **************************************************************************

	onshow : function()
	{
		var st = "";
		if (typeof device !== "undefined") { st = device.uuid; }
		if (typeof application !== "undefined") {
			if (strlen(application.package_id) > 0) {
				if (strlen(st) > 0) {
					st = application.package_id + "@" + st;
				}
				else {
					st = application.package_id;
				}
			}
		}
		
		jQuery("#DIV_ECHO_DEVICE_ID").html(st);
		echo.scroll();

		jQuery("#BTN_ECHO_CLEAR").off("click").on("click", function(){
			ripple(this, function(){
				jQuery("#DIV_ECHO_DATA").empty();
			});
		});

		jQuery("#BTN_ECHO_SHARE").off("click").on("click", function(){
			ripple(this, function(){

				if (typeof window.plugins.socialsharing !== "undefined") {
					var st = echo.selectedText();
					if (strlen(st) === 0) {
						st = echo.text();
					}
					if (strlen(st) > 0) {
						var options = {
							message : st,
							subject : 'echo ' + datetime.sql()
						};
						window.plugins.socialsharing.shareWithOptions(
							options, 
							function(result) {
								var msg = "Shared " + st.length + " byte(s)";
								echo.toast(msg);
							},
							function(msg) {
								var msg = "Error sharing " + st.length + " byte(s)";
								echo.toast(msg, true);
							}
						);
					}
				}

			});
		});

		jQuery("#BTN_ECHO_COPY").off("click").on("click", function(){
			ripple(this, function(){

				if (typeof cordova.plugins.clipboard !== "undefined") {
					var st = echo.selectedText();
					if (strlen(st) === 0) {
						st = echo.text();
					}
					if (strlen(st) > 0) {
						cordova.plugins.clipboard.copy(
							st,
							function() {
								var msg = "Copied to clipboard " + st.length + " byte(s)";
								echo.toast(msg);
							},
							function() {
								var msg = "Error copy to clipboard " + st.length + " byte(s)";
								echo.toast(msg, true);
							}
						);
					}
				}

			});
		});

		jQuery("#BTN_ECHO_CLOSE").off("click").on("click", function(){
			ripple(this, function(){
				echo.hide();
			});
		});

	},


	// **************************************************************************
	// **************************************************************************
	//
	// Initialization
	//
	// **************************************************************************
	// **************************************************************************

	init : function()
	{
		if (! DOMExists("DIV_ECHO_CONTAINER")) {
			//alert("IN echo.init()->create(DIV_ECHO_CONTAINER)", "Info", "OK", noop);
			//var filepath = "lib/html/echo.html";
			//alert(filepath);
			
			var html = file2bin("lib/html/echo.html");
			//alert(strlen(html));
			if (strlen(html) > 0) {
				jQuery(document.body).append(html);
				//alert("Echo directory append");
			}

			try {

				var _console = console || {}; 

				_console.log   = function(st) { echo.log(st);   };
				_console.info  = function(st) { echo.info(st);  };
				_console.warn  = function(st) { echo.warn(st);  };
				_console.error = function(st) { echo.error(st); };

				console = _console;
				window.console = _console;

				//alert("Console is redirected");
			}
			catch(e) {
				//alert(e);
			}

		}
	}

};


// ****************************************************************************
// ****************************************************************************
//
// REDIRECT CONSOLE IF ECHO IS LOADED
//
// ****************************************************************************
// ****************************************************************************
/*
		var _console = console || {}; 
		_console.log   = function(st) { echo.log(st);   };
		_console.info  = function(st) { echo.info(st);  };
		_console.warn  = function(st) { echo.warn(st);  };
		_console.error = function(st) { echo.error(st); };
		console = _console;
		window.console = _console;
*/


// End of file: echo.js
// ============================================================================