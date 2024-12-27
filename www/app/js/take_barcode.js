// ============================================================================
// Module      : take_barcode.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : WMSLITE
// Description : Handle a barcode scan result
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

function take_barcode(scanned)
{
	return new Promise(
		(resolve, reject) => {

			let mypage = null;

			// **********************************************************************
			// **********************************************************************
			// 
			// RUNTIME API
			//
			// **********************************************************************
			// **********************************************************************

			let hide = function() 
			{
				console.log("IN take_barcode()->hide()");
				if (mypage !== null) {
					mypage.remove();
					mypage = null;
				}
			};

			let failed = () => {
				console.log("IN take_barcode()->failed()");
				hide();
				reject();
			};

			let success = () => {
				console.log("IN take_barcode()->success()");
				hide();
				resolve(scanned);
			};


			// **********************************************************************
			// **********************************************************************
			// 
			// RUNTIME EVENTS
			//
			// **********************************************************************
			// **********************************************************************

			let onbackbutton = function()
			{
				console.log("IN take_barcode()->onbackbutton()");
				failed();
			};

			let onshow = function()
			{
				console.log("IN take_barcode()->onshow()");
				jQuery("#DIV_BARCODE_TEXT").html(scanned.text);
				jQuery("#DIV_BARCODE_FORMAT").html(scanned.format);
				jQuery("#MENU_TAKE_BARCODE_1").off("click").on("click", function(){
					ripple(this, function(){
						success();
					});
				});
			};


			// **********************************************************************
			// **********************************************************************
			//
			// DISPLAY API
			//
			// **********************************************************************
			// **********************************************************************

			mypage = new page({
				page_id          : "page_take_barcode",
				contentURI       : "app/html/take_barcode.html",
				scriptURI        : "app/js/take_barcode.js",
				windowObjectName : "take_barcode",
				onbackbutton     : onbackbutton,
				onshow           : onshow,
				globalize        : true
			});

			if (mypage !== null) { 			
				mypage.show();
			}

		}
	);
};


// End of file: take_barcode.js
// ============================================================================