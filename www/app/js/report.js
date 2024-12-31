// ============================================================================
// Module      : report.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Application support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var screenReportHTML = '<div id="DIV_REPORT_[page_id]" class="page foreground overflow"></div>';

function report(options_)
{
  var that = this;
		 this.options = {
		 		 metadata     : {},
		 		 contentURI   : "",
		 		 oreientation : "portrait",
		 		 globalize    : true
		 };
		
		 for (var i in options_) { this.options[i] = options_[i]; }
		
  this.page = null;
		
  this.asPDF = function()
		 {
		 		  return new Promise(
		 		    (resolve, reject)=>{
		 		    		 console.info("IN report.asPDF()");
		 		    }
		 		  );
		 };
		
		 this.share = function()
				{
		 		  return new Promise(
		 		    (resolve, reject)=>{
		 		    		 console.info("IN report.share()");
		 		    }
		 		  );
		 };

	// **************************************************************************
	// **************************************************************************
	// 
	// RUNTIME EVENTS
	//
	// **************************************************************************
	// **************************************************************************

	this.onbackbutton: function()
	{
		//console.info("IN report.onbackbutton()");
		that.hide();
	};

		this.onshow: function()
	{
		//console.info("IN report.onshow()");
	};

		
	// **************************************************************************
	// **************************************************************************
	// 
	// GUI
	//
	// **************************************************************************
	// **************************************************************************
		
	this.hide = function() 
	{
		//console.info("IN report.hide()");
		if (that.page !== null) {
			that.page.remove();
			that.page = null;
		}
	},
	
			 this.show = function()
		 {
			//console.info("IN wmslite.show()");	

		that.page = new page({
				page_id          : "page_report",
				contentURI       : "lib/html/report.html",
				scriptURI        : "lib/js/report.js",
				windowObjectName : "report",
				onbackbutton     : that.onbackbutton,
				onshow           : that.onshow,
				globalize        : false
		});

		if (that.page !== null) { 			
			that.page.show();
		}
 		
		};
		
}





function report(options)
{
	return new Promise(
		(resolve, reject)=>{

			console.info("IN report()");
			//console.log(JSON.stringify(options));

			var filename = options["contentURI"];
			if (options["globalize"]) {
				filename = globalizedFileUri(filename);
			}
			//console.log(filename);

			var content = file2bin(filename);
			//console.log(strlen(content));

			if (typeof options["metadata"] !== "undefined") {
				content = str_parse(content, options["metadata"]);
			}

			// PROCESS SECTIONS
			//
			var found = content.indexOf("<section>");
			while (found >= 0) {

				var html = "";

				var section = str_section(content, "<section>", "</section>");
				var header  = str_section(section, "<header>",  "</header>" );
				html += header;

				content = str_replace_section(content, "<section>", "</section>", html);

				found = content.indexOf("<section>");
				if (found < 0) {
					break;
				}
			}
			
			console.log(strlen(content));

			//PRINT TO SCREEN
			//
			/*
			content = str_section(content, "<body>", "</body>");
			var page_id = "REP_" + rand_num_str(4);
			var html = str_replace("[page_id]", page_id, pageHtml);
			jQuery(document.body).append(html);
			jQuery("#" + page_id).addClass("bg-white");
			jQuery("#" + page_id).html(content);
			var current_back_button_callback = application.back_button_callback;
			application.reg_back_button_callback(
				function() {
					jQuery("#" + page_id).remove();
					application.reg_back_button_callback(current_back_button_callback);
					resolve();
				}
			);
			*/

			//PRINT TO PDF
			//
			/*
			var options_ = {
				landscape : "portrait",
				type      : 'share',
				fileName  : 'PO.pdf'
			};

			pdf.fromData(content, options_)
			.then((status)=>{
				console.log("status='" + status + "'");
				resolve();
			})
			.catch((err)=>{
				console.error("Rejected by pdf.fromData()");
				console.error(err);
				reject();
			});
			*/

			//CREATE PDF FILE TO PLAY WITH
			//
			var options_ = {
				landscape    : "portrait",
				documentSize : 'A4',
				type         : 'base64'
			};

			pdf.fromData(content, options_)
    	.then ((base64)=>{       
				
				var filepath    = cordova.file.externalRootDirectory + "Download/";
				var filename    = "PO-241226-0048.pdf";
				var contentType = "application/pdf";
				var dataBlob    = base64toBlob(base64, contentType);

    		window.resolveLocalFileSystemURL(
					filepath, 
					function(dir) {
        		console.log("Access to the directory granted succesfully");
        		dir.getFile(
							filename, 
							{create:true}, 
							function(file) {
            		console.log("File created succesfully.");
            		file.createWriter(
									function(fileWriter) {
              			console.log("Writing content to file");
              			fileWriter.write(dataBlob);
										resolve();
            			}, 
									function(){
                		console.error('Unable to save file in path '+ filepath);
										reject();
            			}
								);
        			}
						);
    			}
				);

			})
			.catch((err)=>{
				console.err(err);
			});

		}
	);

}


// End of file: print.js
// ============================================================================