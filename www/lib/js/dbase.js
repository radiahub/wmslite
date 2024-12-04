// ============================================================================
// Module      : dbase.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : sqlite on-device database support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-20 00:00 WIT   Denis  Deployment V. 2020 "ALEXANDRE DUMAS"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// UTILS
//
// ****************************************************************************
// ****************************************************************************

var sqlite_escape_string = (st) => {
	st = "" + st;  // Cast to string, in case I get a number
	st = str_replace("'", "''", st);
	return st;
}

var format_query = (sql) => {

	sql = trim (sql);

	if (sql.length === 0) {
		return "";
	}

	var arr = [];

	var dummy = breakApart(sql,"\n");
	for (var i = 0; i < dummy.length; i++) {
		var q = trim(dummy[i]);
		if (q.toUpperCase() !== "GO") {
			var p = q.indexOf("--");
			if (p >= 0) {
				q = trim(q.substr(0,p));
			}
      q = str_replace("  "," ",q);
      q = trim(q);
			if (q.length > 0) {
				arr.push(q);
			}
		}
	}

	var result = "";
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].length > 0) {
			if (result.length > 0) { result+= " "; }
			result+= arr[i];
		}
	}

  result = str_replace("\t","", result);
  result = str_replace("  "," ",result);
	return result;
}

const queries = (sql) => {
  let queries_to_exec = [];
  let arr = breakApart (sql, ";");
  for (let i = 0; i < arr.length; i++) {
  	let q = format_query(arr[i]);
    if (q.length > 0) {
      queries_to_exec.push (q);
		}
  }
	return queries_to_exec;
}

var file2queries = (filename, host) => {
	let arr = [];
	let buffer = fgets(filename, host);
	if (buffer.length > 0) {
		arr = queries(buffer);
	}
	return arr;
}


// ****************************************************************************
// ****************************************************************************
//
// dbase object implementation
//
// ****************************************************************************
// ****************************************************************************

var dbase = {

	db : null,


	open : () => {

		return new Promise(
			(resolve, reject) => {
				//console.log("IN dbase.open()");
				if (typeof window.sqlitePlugin !== "undefined") {
					try {
						dbase.db = window.sqlitePlugin.openDatabase({
							name     : "radiahub", 
							location : "default"
						});
						//console.log("Success");
						resolve();
					}
					catch(err) {
						//console.error("Failed");
						console.error("IN dbase.open()->" + err.message);
						reject();
					}
				}
				else {
					resolve();
				}
			}
		);
	},

	close : () => {

		return new Promise(
			(resolve, reject) => {
				if (typeof window.sqlitePlugin !== "undefined") {
					dbase.db.close(
						(() => { resolve(); }),
						(() => { reject();  })
					);
				}
				else {
					resolve();
				}
			}
		);
	},

	exists : (tablename) => {

		return new Promise(
			(resolve, reject) => {
				if (typeof window.sqlitePlugin !== "undefined") {
					var q = 'SELECT name FROM sqlite_master WHERE type="table" AND name="' + tablename + '" ';
					dbase.row(q)
					.then ((row) => {
						//console.log(JSON.stringify(row));
						if (row !== null) {
							resolve();
						}
						else {
							reject();
						}
					})
					.catch(() => { 
						reject(); 
					});
				}
				else {
					reject();
				}
			}
		);
	},

	query : (q, args) => {

		if (typeof args === "undefined") { args = {}; }

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

					q = format_query(q);
					//console.log(q);
					//console.log(JSON.stringify(args));

					try {
						var words = breakApart(q, " ");
						dbase.db.transaction (
							(tx) => {
								tx.executeSql(

									q, args,

									(tx, results) => {
										switch (words[0].toUpperCase()) {
											
											case "SELECT": {
												var rows = [];
												for (var i = 0; i < results.rows.length; i++) {
													rows.push(results.rows.item(i));
												}
												resolve(rows);
												break;
											}

											case "INSERT": {
												var lastInsertId = results.insertId;
												resolve(lastInsertId);
												break;
											}

											default: {
												resolve();
												break;
											}
										}
									},

									(error) => {
										reject();
									}
								);
							},
							(tx, err) => {
								reject();
							}
						);
					}
					catch (err) {
						console.error(err.message);
						reject();
					}

				}
				else {
					reject();
				}

			}
		);
	},

	report_query : (q) => {

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

					q = format_query(q);
					var args = {};

					var arr = {
						query    : q,  // Return the executed formatted query
						rowid    : 0,  // Auto-increment value of the last inserted row
						result   : "", // One of "OK", "ERROR"
						affected : 0,  // Integer: number of affected rows
						text     : "", // Something like "Query OK, NN row(s) affected"
						rows     : []  // Array of returned rows if any
					};

					try {
						var words = breakApart(q, " ");
						dbase.db.transaction (
							(tx) => {
								tx.executeSql(

									q, args,

									(tx, results) => {
										switch (words[0].toUpperCase()) {
											
											case "SELECT": {
												var rows = [];
												for (var i = 0; i < results.rows.length; i++) {
													rows.push(results.rows.item(i));
												}

												arr["result"  ] = "OK";
												arr["affected"] = results.rows.length;
												arr["text"    ] = "Query OK, " + results.rows.length + " row(s) affected";
												arr["rows"    ] = rows;

												console.log(JSON.stringify(arr));
												resolve(arr);
												break;
											}

											case "INSERT": {
												var lastInsertId = results.insertId;
												var q1 = "SELECT changes() AS affected";
												dbase.row(q1)
												.then ((row)=>{
													var affected = parseInt(String(row["affected"]));
													arr["rowid"   ] = lastInsertId;
													arr["result"  ] = "OK";
													arr["affected"] = affected;
													arr["text"    ] = "Query OK, " + affected + " row(s) affected, rowid=" + lastInsertId;
													resolve(arr);
												})
												.catch(()=>{
													console.warn("Rejected by dbase.row('SELECT changes() AS affected')");
													var affected = 1;
													arr["rowid"   ] = lastInsertId;
													arr["result"  ] = "OK";
													arr["affected"] = affected;
													arr["text"    ] = "Query OK, " + affected + " row(s) affected, rowid=" + lastInsertId;
													resolve(arr);
												});
												break;
											}

											case "UPDATE":
											case "DELETE": {
												var q1 = "SELECT changes() AS affected";
												dbase.row(q1)
												.then ((row)=>{
													var affected = parseInt(String(row["affected"]));
													arr["result"  ] = "OK";
													arr["affected"] = affected;
													arr["text"    ] = "Query OK, " + affected + " row(s) affected";
													resolve(arr);
												})
												.catch(()=>{
													console.warn("Rejected by dbase.row('SELECT changes() AS affected')");
													var affected = 0;
													arr["result"  ] = "OK";
													arr["affected"] = affected;
													arr["text"    ] = "Query OK, " + affected + " row(s) affected";
													resolve(arr);
												});
												break;
											}

											default: {
												var affected = 0;
												arr["result"  ] = "OK";
												arr["affected"] = affected;
												arr["text"    ] = "Query OK, " + affected + " row(s) affected";
												resolve(arr);
												break;
											}
										}
									},

									(error) => {
										var affected = 0;
										arr["result"  ] = "ERROR";
										arr["affected"] = affected;
										arr["text"    ] = "Query ERROR, " + affected + " row(s) affected";
										resolve(arr);
									}
								);
							},
							(tx, err) => {
								var affected = 0;
								arr["result"  ] = "ERROR";
								arr["affected"] = affected;
								arr["text"    ] = "Query ERROR, " + affected + " row(s) affected";
								resolve(arr);
							}
						);
					}
					catch (err) {
						console.error(err.message);
						var affected = 0;
						arr["result"  ] = "ERROR";
						arr["affected"] = affected;
						arr["text"    ] = "Query ERROR, " + affected + " row(s) affected";
						resolve(arr);
					}

				}
				else {
					reject();
				}

			}
		);
	},

	insert : (tablename, row) => {

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

				//console.info("IN dbase.insert()");
				//console.log(tablename);
				//console.log(JSON.stringify(row));

				var fieldList   = "";
				var fieldvalues = "";
				var fieldargs   = [];

				for (var field in row) {
					if (fieldList.length > 0) { fieldList += ","; }
					fieldList += field;
					if (fieldvalues.length > 0) { fieldvalues += ","; }
					fieldvalues += "?";
					fieldargs.push(row[field]);
				}

				var q = "INSERT INTO " + tablename + " "
							+ "(" + fieldList + ") "
							+ "VALUES "
							+ "(" + fieldvalues + ") ";

				//console.log(q);
				//console.log(JSON.stringify(fieldargs));

				dbase.query(q, fieldargs)
				.then ((result) => {
					resolve(result);
				})
				.catch(() => { 
					reject(); 
				});

				}
				else {
					reject();
				}

			}
		);
	},

	rows : (q) => {

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {
					try {
						dbase.query(q)
						.then ((result) => { resolve(result); })
						.catch(() => { reject(); });
					}
					catch (err) {
						console.error(err.message);
						reject();
					}
				}
				else {
					reject();
				}
			}
		);
	},

	row : (q) => {

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {
					dbase.rows(q)
					.then ((rows) => {
						var row = (rows.length > 0) ? rows[0] : null;
						resolve(row);
					})
					.catch(() => { 
						reject(); 
					});
				}
				else {
					reject();
				}
			}
		);
	},

	locate : (tablename, args) => {

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

					var where = "";
					var fieldargs = [];
			
					for (var field in args) {
						if (where.length > 0) { where += " AND "; }
						where += field + "=?";
						fieldargs.push(args[field]);
					}
			
					var q = "SELECT * FROM " + tablename;
					if (where.length > 0) {
						q = "SELECT * FROM " + tablename + " WHERE " + where;
					}

					dbase.query(q, fieldargs)
					.then ((rows) => {
						var row = (rows.length > 0) ? rows[0] : null;
						resolve(row);
					})
					.catch(() => { 
						reject(); 
					});

				}
				else {
					reject();
				}

			}
		);
	},

	update : (tablename, row, args) => {

		if (typeof args === "undefined") { args = {}; }

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

					var set = "", where = "", fieldargs = [];
			
					for (var field in row) {
						if (set.length > 0) { set += ","; }
						set += field + "=?";
						fieldargs.push(row[field]);
					}
			
					for (var field in args) {
						if (where.length > 0) { where += " AND "; }
						where += field + "=?";
						fieldargs.push(args[field]);
					}

					var q = "UPDATE " + tablename + " SET " + set
					if (where.length > 0) {
						q += " WHERE " + where;
					}

					dbase.query(q, fieldargs)
					.then (() => { resolve(); })
					.catch(() => { reject();  });

				}
				else {
					reject();
				}

			}
		);
	},


	delete : (tablename, args) => {

		if (typeof args === "undefined") { args = {}; }

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

					var where = "";
					var fieldargs = [];

					for (var field in args) {
						if (where.length > 0) { where += " AND "; }
						where += field + "=?";
						fieldargs.push(args[field]);
					}

					var q = "DELETE FROM " + tablename;
					if (where.length > 0) {
						q += " WHERE " + where;
					}

					dbase.query(q, fieldargs)
					.then (() => { resolve(); })
					.catch(() => { reject();  });

				}
				else {
					reject();
				}

			}
		);
	},


	// resolve = (logtxt) => {...}
	// reject  = (logtxt) => {...}
	//
	batch : (queries, execDrop) => {

		if (typeof execDrop === "undefined") { execDrop = false; }

		return new Promise(
			(resolve, reject) => {

				if (typeof window.sqlitePlugin !== "undefined") {

					var logtxt = "", currentQ = -1;
					//console.log(JSON.stringify(queries));

					var iterate = function() {

						currentQ++;
						if (currentQ < queries.length) {
					
							var q = queries[currentQ];
							//console.log(q);
							var words = breakApart(q, " ");
							if (words[0].toUpperCase() === "DROP") {

								if (execDrop) {
									dbase.query(q, {})
									.then((result) => {
										
										var txt = q + "\n\nQuery OK";
										if (typeof result !== "undefined") {
											txt = q + "\n\nQuery OK, result=" + JSON.stringify(result);
										}
										if (logtxt.length > 0) { logtxt += "\n\n"; }
										logtxt += txt;

										iterate();
									})
									.catch(() => {

										var txt = txt = q + "\n\nQuery ERROR";
										if (logtxt.length > 0) { logtxt += "\n\n"; }
										logtxt += txt;

										reject(logtxt);
									});
								}
								else {
									var txt = txt = q + "\n\nDROP Query IGNORED";
									if (logtxt.length > 0) { logtxt += "\n\n"; }
									logtxt += txt;

									iterate();
								}
							}
							else {
								dbase.query(q, {})
								.then((result) => {
									var words = breakApart(q, " ");
									switch (words[0].toUpperCase()) {

										case "SELECT": {
											var txt = q + "\n\n" + JSON.stringify(result);
											if (logtxt.length > 0) { logtxt += "\n\n"; }
											logtxt += txt;
											break;
										}
										
										case "INSERT": {
											var txt = q + "\n\nQuery OK, lastInsertId=" + result;
											if (logtxt.length > 0) { logtxt += "\n\n"; }
											logtxt += txt;
											break;
										}

										default: {
											var txt = txt = q + "\n\nQuery OK";
											if (typeof result !== "undefined") {
												txt = q + "\n\nQuery OK, result=" + JSON.stringify(result);
											}
											if (logtxt.length > 0) { logtxt += "\n\n"; }
											logtxt += txt;
											break;
										}
									}

									iterate();
								})
								.catch(() => {

									var txt = txt = q + "\n\nQuery ERROR";
									if (logtxt.length > 0) { logtxt += "\n\n"; }
									logtxt += txt;

									reject(logtxt);
								});
							}
						}
						else {
							resolve(logtxt);
						}
					};

					iterate();

				}
				else {
					reject();
				}

			}
		);
	}

};


// End of file: dbase.js
// ============================================================================