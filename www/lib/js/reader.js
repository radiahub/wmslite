// ============================================================================
// Module      : auth.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : HTML reader
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var reader = {

	page : null, appname: "", title: "", doc: "",

	
	// **************************************************************************
	// **************************************************************************
	// 
	// RUNTIME EVENTS
	//
	// **************************************************************************
	// **************************************************************************

	onbackbutton: function()
	{
		//console.log("IN reader.onbackbutton()");
		if (strlen(that.options.containerID) === 0) {
			reader.hide();
		}
	},

	onshow: function()
	{
		//console.log("IN reader.onshow() reader.appname='" + reader.appname + "'");
		reader.doc = str_replace("[appname]", reader.appname, reader.doc);
		jQuery("#DIV_READER_CONTENT").html(reader.doc);
		if (strlen(reader.title) === 0) {
			var p = reader.doc.indexOf("<b>"), q = reader.doc.indexOf("</b>");
			reader.title = reader.doc.slice(p + 3, q);
		}
		jQuery("#DIV_READER_TITLE").html(reader.title);
		jQuery("#BTN_READER_CLOSE").off("click").on("click", function(){
			ripple(this, reader.hide);
		});
	},


	// **************************************************************************
	// **************************************************************************
	//
	// DISPLAY API
	//
	// **************************************************************************
	// **************************************************************************

	hide : function() 
	{
		//console.log("IN reader.hide()");
		if (reader.page !== null) {
			reader.page.remove();
			reader.page = null;
		}
	},

	show: function(documentURI, appname, title)
	{
		if (strlen(title) === 0) { title = ""; }
		//console.log("IN reader.show() title='" + title + "'");
		reader.title = title;
		reader.appname = appname;

		reader.doc = file2bin(documentURI);
		//console.log(reader.doc);

		reader.page = new page({
			page_id          : "page_reader",
			containerID      : "",
			contentURI       : "lib/html/reader.html",
			scriptURI        : "lib/js/reader.js",
			windowObjectName : "reader",
			onbackbutton     : reader.onbackbutton,
			onshow           : reader.onshow,
			globalize        : false
		});

		if (reader.page !== null) { 			
			reader.page.show();
		}
	}

};


// End of file: reader.js
// ============================================================================