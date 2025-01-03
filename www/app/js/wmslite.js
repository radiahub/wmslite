// ============================================================================
// Module      : wmslite.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : WMS IMS Lite
// Description : Application entry point
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 08-Aug-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

var wmslite = {

	// **************************************************************************
	// **************************************************************************
	//
	// INITIALIZATION
	//
	// **************************************************************************
	// **************************************************************************

	newID : function(len, maxlen)
	{
		return new Promise(
			(resolve, reject)=>{
				//console.info("IN wmslite.newID() minlen=" + len);

				var no_of_attempts = 5000;
				var current = 0;
				var candidate = rand_num_str(len);

				var iterate = function() {
					
					var go_on = function() {
						current++;
						if (current > no_of_attempts) {
							len++;
							if (len > maxlen) {
								console.error("No computed solution resolved");
								reject();
							}
							else {
								current = 0;
								candidate = rand_num_str(len);
								iterate();
							}
						}
						else {
							candidate = rand_num_str(len);
							iterate();
						}
					};

					dbase.locate("identifiers", { identifier: candidate })
					.then ((row)=>{

						if (row === null) {
							//console.log("Valid candidate found candidate='" + candidate + "'");
							dbase.insert("identifiers", { updated: datetime.now(), identifier: candidate })
							.then (()=>{
								resolve(candidate);
							})
							.catch(()=>{
								console.error("Rejected by dbase.insert(identifiers)");
								reject();
							});
							
						}
						else {
							//console.log("dbase.locate(identifiers) returned non-null");
							go_on();
						}
					})
					.catch(()=>{
						//console.warn("Rejected by dbase.locate(identifiers)");
						go_on();
					});

				};

				iterate();
			},
		);
	},

	init : function()
	{
		return new Promise(
			(resolve, reject)=>{
				console.info("IN wmslite.init()");

				R.reg("lib/html/strings.json");

				var filename = "app/sqlite/wmslite.sql";
				//console.log(filename);
				var queries = file2queries(filename);
				//console.log(JSON.stringify(queries));
				dbase.batch(queries, false)
				.then((logtxt)=>{
					//console.log(logtxt);
					/*
					dbase.rows("SELECT * FROM identifiers WHERE 1")
					.then ((rows)=>{
						console.log(JSON.stringify(rows));
					})
					.catch(()=>{
						console.error("Rejected by 'SELECT * FROM identifiers WHERE 1'");
					});
					*/
					var q = "SELECT * FROM locations "
								+ "WHERE location_id IN ('STORE','REFRIGERATED','INBOUND','PREPARATION','PACKAGING','OUTBOUND','TRANSIT','WASTE')";

					dbase.rows(q)
					.then ((rows)=>{
						//console.log(JSON.stringify(rows));
						console.log("Resolved by dbase.rows() length=" + rows.length);
						if (rows.length > 0) {
							resolve();
						}
						else {
							var filename = "app/sqlite/locations.sql";
							//console.log(filename);
							var queries = file2queries(filename);
							//console.log(JSON.stringify(queries));
							dbase.batch(queries, false)
							.then((logtxt)=>{
								//console.log(logtxt);
								resolve();
							})
							.catch(()=>{ 
								//console.warn("Rejected by dbase.batch()");
								resolve();
							});
						}
					})
					.catch(()=>{
						//console.warn("Rejected by dbase.rows()");
						resolve();
					});

				})
				.catch((logtxt)=>{ 
					console.error("Rejected by dbase.batch()");
					console.error(logtxt);
					reject();
				});

			}
		);
	},

	run : function()
	{
		return new Promise(
			(resolve, reject)=>{
				//console.info("IN wmslite.run()");
				window.CacheClear(
					function() {
						//console.log("Resolved by window.CacheClear()");
						connect.init();
						wmslite.init()
						.then (()=>{
							console.log("Resolved by wmslite.init()");
							home.show();
							resolve();
						})
						.catch(()=>{
							console.error("Rejected by wmslite.init()");
							reject();
						});

					},
					function(status) {
						//console.error("Rejected by window.CacheClear()");
						//console.error(status);
						reject();
					}
				);

			}
		);
	}

};


// End of file: wmslite.js
// ============================================================================