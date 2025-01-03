// ============================================================================
// Module      : navigation.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : WMS IMS Lite
// Description : Navigation page
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 08-Aug-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var navigation = {

	showing: false,

	hide: function()
	{
		//console.info("IN navigation.hide()");
		jQuery("#DIV_NAVIGATION_MENU").animate({top:"100%"}, 300, function(){navigation.showing = false;});
	},

	onshow: function()
	{
		//console.info("IN navigation.onshow()");

	},

	show: function()
	{
		//console.info("IN navigation.show()");
		jQuery("#DIV_NAVIGATION_MENU").animate({top:"3.4em"}, 300, function(){ navigation.showing = true; navigation.onshow(); });
	}

};


// End of file: navigation.js
// ============================================================================