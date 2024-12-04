// ============================================================================
// Module      : modal.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Library to handle modal overlays
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 14-July-23 00:00 WIT  Denis  Deployment V. 2023 "ALEXANDRE DUMAS"
//
// ============================================================================

var modal = {

	html : '<div id="DIVmodal" class="page modal-cover [transparent] flex-middle"></div>',

	showing : false,

	hide : function(onhidden)
	{
		console.info("IN modal.hide()");
		jQuery("#DIVmodal").remove();
		modal.showing = false;
		if (typeof onhidden === "function") {
			setTimeout(onhidden, 100);
		}
	},

	show : function(transparent, onshown)
	{
		if (typeof transparent === "undefined") { transparent = false; }
		console.info("IN modal.show() transparent=" + String(transparent));
		
		if (! modal.showing) {
			var html = (transparent) ? str_replace("[transparent]","transparent", modal.html) : str_replace("[transparent]","", modal.html);
			modal.showing = true;
			jQuery("body").append(html);
			clearFreeWHA(100);
		}
		else {
			jQuery("#DIVmodal").empty();
		}

		if (typeof onshown === "function") {
			setTimeout(onshown, 100);
		}
	}

};


var wait = {

	html : '<div id="DIV_WAIT" class="page modal-cover flex-middle">'
			 + '<div id="DIVCONT_WAIT" class="h2 flex-middle" style="height:4em;"></div>'
			 + '</div>',

	hide : function(onhidden)
	{
		jQuery("#DIV_WAIT").remove();
		if (typeof onhidden === "function") {
			delay(100, onhidden);
		}
	},

	show : function(spinner_fg_color, onshow)
	{
		if (typeof onshow === "undefined") { onshow = null; }
		if (typeof spinner_fg_color === "undefined") {
			spinner_fg_color = "#FFFFFF";
		}

		jQuery("body").append(wait.html);

		new spinner("DIVCONT_WAIT", spinner_fg_color);

		if (typeof onshow === "function") {
			delay(100, onshow);
		}
	}

};


// End of file: modal.js
// ============================================================================