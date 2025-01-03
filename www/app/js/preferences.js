// ============================================================================
// Module      : preferences.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : WMS IMS Lite
// Description : preferences page
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 08-Aug-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var preferences = {

	showing: false,

	hide: function()
	{
		//console.info("IN preferences.hide()");
		jQuery("#DIV_PREFERENCES_MENU").animate({left:"100%"}, 250, function(){preferences.showing = false;});
	},

	onshow: function()
	{
		//console.info("IN preferences.onshow()");

	},

	show: function()
	{
		//console.info("IN preferences.show()");
		jQuery("#DIV_PREFERENCES_MENU").animate({left:"0"}, 250, function(){ preferences.showing = true; preferences.onshow(); });
	}

};


// End of file: preferences.js
// ============================================================================