// ============================================================================
// Module      : application-lite.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Application support for Stand-alone Cordova application
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-Dec-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// ****************************************************************************
// ****************************************************************************
//
// application implementation
//
// ****************************************************************************
// ****************************************************************************

var application = {

	package_id : "",


	// **************************************************************************
	// **************************************************************************
	//
	// Read config.xml
	//
	// **************************************************************************
	// **************************************************************************

	// One preference key at a time
	//
	preference : function(name)
	{
		return new Promise(
			(resolve, reject)=>{
				//console.log("IN application.preference() name='" + name + "'");
				if (typeof CustomConfigParameters !== "undefined") {
					var paramkeyArray = [];
					paramkeyArray.push(name);
					try {
						CustomConfigParameters.get(
							(configData)=>{
								var result = configData[name];
								if (is_json(result)) { result = JSON.parse(result); }
								resolve(result);
							},
							()=>{
								reject();
							},
							paramkeyArray
						);
					}
					catch(e) {
						reject();
					}
				}
				else {
					reject();
				}
			}
		);
	},

	// A list of preference keys
	//
	preferences : function(namelist)
	{
		return new Promise(
			(resolve, reject)=>{

					var paramkeyArray = arrayOf(namelist);
					try {
						CustomConfigParameters.get(
							(configData)=>{
								resolve(configData);
							},
							()=>{
								reject();
							},
							paramkeyArray
						);
					}
					catch(e) {
						reject();
					}

			}
		);
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Temporary files
	//
	// **************************************************************************
	// **************************************************************************

	tmpfiles : {

		initialized: false,

		init: function(execDrop)
		{
			return new Promise(
				(resolve, reject)=>{
					if (typeof execDrop === "undefined") { execDrop = false; }
					//console.info("IN application.tmpfiles.init() execDrop=" + String(execDrop));
					if ((application.tmpfiles.initialized) && (!execDrop)) {
						//console.warn("application.tmpfiles already initialized");
						resolve();
					}
					else {
						//console.log("Building tmpfiles database table");
						var filename = "lib/sqlite/tmpfiles.sql";
						//console.log(filename);
						var queries = file2queries(filename);
						//console.log(queries);
						dbase.batch(queries, execDrop)
						.then((logtxt)=>{
							//console.log(logtxt);
							application.tmpfiles.initialized = true;
							resolve();
						})
						.catch(()=>{ 
							//console.error("Rejected by dbase.batch()");
							reject();
						});
					}
				}
			);
		},

		reg: function(localFileURI)
		{
			return new Promise(
				(resolve, reject)=>{
					//console.info("IN application.tmpfiles.reg() localFileURI='" + localFileURI + "'");
					
					var do_the_job = function() {
						//console.info("IN application.tmpfiles.reg()->do_the_job()");
						var fileKEY = window.btoa(localFileURI);
						var fname   = localFileURI.slice(localFileURI.lastIndexOf("/") + 1);

						var do_the_insert = function() {
							//console.info("IN application.tmpfiles.reg()->do_the_job()->do_the_insert()");
							var dummy = { 
								updated : datetime.sql(), 
								fileURI : fileKEY,
								fname   : fname
							};
							//console.log(JSON.stringify(dummy));
							dbase.insert("tmpfiles", dummy)
							.then (()=>{
								resolve();
							})
							.catch(()=>{
								//console.error("Rejected by dbase.insert(tmpfiles)");
								reject();
							});
						};

						dbase.locate("tmpfiles", { fileURI: fileKEY })
						.then ((row)=>{
							if (row !== null) {
								resolve();
							}
							else {
								do_the_insert();
							}
						})
						.catch(()=>{
							do_the_insert();
						});
					};

					application.tmpfiles.init(false)
					.then (()=>{
						//console.log("Resolved by application.tmpfiles.init()");
						do_the_job();
					})
					.catch(()=>{
						//console.error("Rejected by application.tmpfiles.init()");
						reject();
					});

				}
			);
		},

		clean: function()
		{
			return new Promise(
				(resolve, reject)=>{
					//console.info("IN application.tmpfiles.clean()");

					var do_the_job = function() {
						//console.info("IN application.tmpfiles.clean()->do_the_job()");

						var F = new filesystem();

						var clean_tmpfiles_table = function() {
							//console.info("IN application.tmpfiles.clean()->do_the_job()->clean_tmpfiles_table()");
							var q = "DELETE FROM tmpfiles";
							//console.log(q);
							dbase.query(q)
							.then (()=>{
								//console.log("Resolved by dbase.query()");
								resolve();
							})
							.catch(()=>{
								//console.error("Rejected by dbase.query(), force tmpfiles database reset");
								application.tmpfiles.init(true)
								.then (()=>{
									resolve();
								})
								.catch(()=>{
									//console.error("Rejected by application.tmpfiles.init(true)");
									reject();
								});
							});
						};

						var q = "SELECT * FROM tmpfiles";
						//console.log(q);
						dbase.rows(q)
						.then ((rows)=>{
							if (rows.length > 0) {

								var current = 0;

								var iterate = function() {
									var go_on = function() {
										current++;
										if (current >= rows.length) {
											clean_tmpfiles_table();
										}
										else {
											iterate();
										}
									};

									try {
										var filepath = window.atob(rows[current]["fileURI"]);
										//console.log(filepath);
										F.fileRemove(filepath)
										.then (()=>{
											//console.log("Resolved by F.fileRemove() filepath='" + filepath + "'");
											go_on();
										})
										.catch(()=>{
											//console.warn("Rejected by F.fileRemove() filepath='" + filepath + "'");
											go_on();
										});
									}
									catch(e) {
										//console.warn("Runtime exception in application.tmpfiles.clean()->do_the_job()");
										//console.warn(String(e));
										go_on();
									}

								};

								iterate();
							}
							else {
								//console.log("Nothing to do");
								resolve();
							}
						})
						.catch(()=>{
							//console.error("Rejected by dbase.rows()");
							reject();
						});
					};

					application.tmpfiles.init(false)
					.then (()=>{
						//console.log("Resolved by application.tmpfiles.init()");
						do_the_job();
					})
					.catch(()=>{
						//console.error("Rejected by application.tmpfiles.init()");
						reject();
					});

				}
			);
		},

		dump : function()
		{
			return new Promise(
				(resolve, reject)=>{
					//console.info("IN application.tmpfiles.dump()");

					var do_the_job = function() {
						//console.info("IN application.tmpfiles.dump()->do_the_job()");
						var result = [];
						var q = "SELECT * FROM tmpfiles";
						dbase.rows(q)
						.then ((rows)=>{
							for(var i = 0; i < rows.length; i++) {
								var row = clone(rows[i]);
								row["fileURI"] = window.atob(row["fileURI"]);
								result.push(row);
							}
							resolve(result);
						})
						.catch(()=>{
							//console.error("Rejected by dbase.rows()");
							reject();
						});
					};

					application.tmpfiles.init(false)
					.then (()=>{
						//console.log("Resolved by application.tmpfiles.init()");
						do_the_job();
					})
					.catch(()=>{
						//console.error("Rejected by application.tmpfiles.init()");
						reject();
					});

				}
			);
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// Runtime exit
	//
	// **************************************************************************
	// **************************************************************************

	mobileExitRequested : false,

	close_local_database_and_exit : function()
	{
		var exit_application = function() {
			setTimeout(navigator.app.exitApp, 100);
		};
		if (typeof dbase !== "undefined") {
			dbase.close()
			.then (()=>{ exit_application(); } )
			.catch(()=>{ exit_application(); } );
		}
		else {
			exit_application();
		}
	},

	mobileExit : function ()
  {
		application.mobileExitRequested = true;

		var terminate = function() {
			application.close_local_database_and_exit();
		};
		
		if (typeof echo !== "undefined") {
			if (! echo.showing()) {
				terminate();
			}
		}
		else {
			terminate();
		}

  },


	// **************************************************************************
	// **************************************************************************
	//
	// Backbutton navigation
	//
	// **************************************************************************
	// **************************************************************************

	back_button_callback : null,
	back_button_callback_enabled : true,

	reg_back_button_callback : function(f)
	{
		application.back_button_callback = f;
	},

	unreg_back_button_callback : function()
	{
		application.back_button_callback = null;
	},

	disable_back_button_callback : function()
	{
		application.back_button_callback_enabled = false;
	},

	enable_back_button_callback : function()
	{
		application.back_button_callback_enabled = true;
	},

	onbackbutton : function()
	{
		//console.info("IN application.onbackbutton()");

		//console.log(typeof pages);
		//console.log(typeof pages.onbackbutton);
		//console.log(application.back_button_callback_enabled);
		//console.log(typeof application.back_button_callback);
		//console.log(application.back_button_callback);

		if (application.back_button_callback_enabled === false) {
			return false;
		}
		try {
			if (echo.showing()) {
				echo.hide();
			}
			else if (typeof application.back_button_callback === "function") {
				application.back_button_callback();
			}
			else if ((typeof pages !== "undefined") && (typeof pages.onbackbutton === "function")) {
				//console.log("Calling pages.onbackbutton()");
				pages.onbackbutton();
			}
			else {
				application.mobileExit();
			}
		}
		catch(e) {
			//console.error("Runtime exception in application.onbackbutton()");
			//console.error(String(e));
			application.mobileExit();
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Access points
	//
	// **************************************************************************
	// **************************************************************************

	accesspoint : {

		// ap_by_url : URL used to call the application formatted as:
		//
		// http://radiahub.eu5.org/path/?m=[message_data]
		// <------ logical URL ------->|<--- message --->
		//              |
		//              +--> As registered in AndroidManifest.xml,
		//                   else it would not appear here anyway
		// where:
		// [message_data] = payload_encode(message)
		// message = { dataType:dataType, data:plainDataObject };
		//
		// ap_by_message : FCM message object structure
		// message = { dataType:dataType, data:plainDataObject };
		//
		ap_on_fresh_start : false, ap_by_message : null, ap_by_url : "",

		set : {

			on_fresh_start : function(trueOrFalse)
			{
				application.accesspoint.ap_on_fresh_start = trueOrFalse;
			},

			by_url : function(url)
			{
				//console.info("IN application.accesspoint.set.by_url()");
				//console.log(url);
				if (strlen(url) > 0) {
					application.accesspoint.ap_by_url = url;
				}
			},

			by_message : function(message)
			{
				//console.info("IN application.accesspoint.set.by_message()");
				//console.log(JSON.stringify(message));
				if (message !== null) {
					application.accesspoint.ap_by_message = message;
				}
			}
		},

		reset : function() 
		{
			application.accesspoint.ap_on_fresh_start = false;
			application.accesspoint.ap_by_url = "";
			application.accesspoint.ap_by_message = null;
		},

		open : function() 
		{
			//console.info("IN application.accesspoint.open()");
			return new Promise(
				(resolve, reject)=>{

					if (strlen(application.accesspoint.ap_by_url) > 0) {
						//console.log("Open by URL url='"+application.accesspoint.ap_by_url+"'");
						if (typeof webintents !== "undefined") {
							webintents.open(application.accesspoint.ap_by_url)
							.then (()=>{ 
								application.accesspoint.reset();
								resolve(); 
							})
							.catch(()=>{ 
								application.accesspoint.reset();
								reject(); 
							});
						}
						else {
							reject();
						}
					}
					else if (application.accesspoint.ap_by_message !== null) {
						/*
						//console.log("Open by message");
						//console.log(JSON.stringify(application.accesspoint.ap_by_message));
						*/
						if (typeof ipc !== "undefined") {
							ipc.open_accesspoint()
							.then (()=>{ 
								application.accesspoint.reset();
								resolve(); 
							})
							.catch(()=>{ 
								//console.warn("Rejected by ipc.open_accesspoint()");
								application.accesspoint.reset();
								reject(); 
							});
						}
						else {
							reject();
						}
					}
					else {
						application.accesspoint.reset();
						reject();
					}

				}
			);
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// Runtime events
	//
	// **************************************************************************
	// **************************************************************************

	onoffline_ : function (e)
  {
		//console.info("IN application.onoffline_()");
		if (typeof connect !== "undefined") {
			connect.toast.offline()
		}
		if (typeof application.onOffline === "function") {
			application.onOffline(e);
		}
  },

  ononline_ : function (e)
  {
		//console.info("IN application.ononline_()");
		if (typeof connect !== "undefined") {
			connect.toast.online()
		}
		if (typeof application.onOnline === "function") {
			application.onOnline(e);
		}
  },

  onpause_ : function (e)
  {
		//console.info("IN application.onpause_()");
		if (typeof application.onPause === "function") {
			application.onPause(e);
		}
  },

  onresume_ : function (e)
  {
		//console.info("IN application.onresume_()");
		//console.log(JSON.stringify(e));
		if (typeof application.onResume === "function") {
			application.onResume(e);
		}
  },


	// **************************************************************************
	// **************************************************************************
	//
	// Virtual keyboard
	//
	// **************************************************************************
	// **************************************************************************

	keyboard_will_show_callback : null,
	keyboard_did_show_callback  : null,
	keyboard_will_hide_callback : null,
	keyboard_did_hide_callback  : null,

	keyboardHeight : 0,

	keyboard_will_show : function(event)
	{
		//console.info("IN application.keyboard_will_show()");
		//console.log(JSON.stringify(event));
		//console.log(event.keyboardHeight);
		application.keyboardHeight = event.keyboardHeight;
		//console.log(application.keyboardHeight);
		if (typeof application.keyboard_will_show_callback === "function") {
			setTimeout(
				function() { 
					application.keyboard_will_show_callback(event);
				},
				100
			);
		}
	},

	keyboard_did_show : function(event)
	{
		//console.info("IN application.keyboard_did_show()");
		//console.log(JSON.stringify(event));
		//console.log(event.keyboardHeight);
		application.keyboardHeight = event.keyboardHeight;
		//console.log(application.keyboardHeight);
		if (typeof application.keyboard_did_show_callback === "function") {
			setTimeout(
				function() { 
					application.keyboard_did_show_callback(event);
				},
				100
			);
		}
	},

	keyboard_will_hide : function()
	{
		//console.info("IN application.keyboard_will_hide()");
		if (typeof application.keyboard_will_hide_callback === "function") {
			setTimeout(
				function() { 
					application.keyboard_will_hide_callback();
				},
				100
			);
		}
	},

	keyboard_did_hide : function()
	{
		//console.info("IN application.keyboard_did_hide()");
		if (typeof application.keyboard_did_hide_callback === "function") {
			setTimeout(
				function() { 
					application.keyboard_did_hide_callback();
				},
				100
			);
		}
	},

	// eventName: one of "keyboardWillShow", "keyboardDidShow",
	//                   "keyboardWillHide", "keyboardDidHide"
	//
	// F : function(event) {...}
	//
	reg_keyboard_event : function(eventName, F)
	{
		if (typeof F === "function") {
			switch (eventName) {
				case "keyboardWillShow": {
					application.keyboard_will_show_callback = F;
					break;
				}
				case "keyboardDidShow": {
					application.keyboard_did_show_callback = F;
					break;
				}
				case "keyboardWillHide": {
					application.keyboard_will_hide_callback = F;
					break;
				}
				case "keyboardDidHide": {
					application.keyboard_did_hide_callback = F;
					break;
				}
			}
		}
		else {
			application.unreg_keyboard_event(eventName);
		}
	},

	unreg_keyboard_event : function(eventName)
	{
		switch (eventName) {
			case "keyboardWillShow": {
				application.keyboard_will_show_callback = null;
				break;
			}
			case "keyboardDidShow": {
				application.keyboard_did_show_callback = null;
				break;
			}
			case "keyboardWillHide": {
				application.keyboard_will_hide_callback = null;
				break;
			}
			case "keyboardDidHide": {
				application.keyboard_did_hide_callback = null;
				break;
			}
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Media player
	//
	// **************************************************************************
	// **************************************************************************

	media : function (url)
	{
		//console.info("IN application.media() is_cordova=true url='" + url + "'");
		try {
			var audio = new Media(url, noop, noop);
			audio.play();
		}
		catch(err) {
			//console.error("Failed to play audio URL='" + url + "': " + err);
		}
	},


	// **************************************************************************
	// **************************************************************************
	//
	// Initialization
	//
	// **************************************************************************
	// **************************************************************************

	initDevice : function()
	{
		return new Promise(
			(resolve, reject)=>{
				//console.info("IN application.initDevice());

				document.addEventListener(
					"backbutton", 
					function (e) {
						e.stopPropagation();
						e.preventDefault();
						application.onbackbutton();
					}, 
					true
				);

				document.addEventListener("offline", application.onoffline_);
				document.addEventListener("online",  application.ononline_ );
				document.addEventListener("pause",   application.onpause_  );
				document.addEventListener("resume",  application.onresume_ );

				window.addEventListener('keyboardWillShow', application.keyboard_will_show);
				window.addEventListener('keyboardDidShow',  application.keyboard_did_show );
				window.addEventListener('keyboardWillHide', application.keyboard_will_hide);
				window.addEventListener('keyboardDidHide',  application.keyboard_did_hide );

					window.CacheClear(
						function() {
							//console.log("Resolved by window.CacheClear()");
							application.preference(["package_id"])
							.then ((data)=>{
								//console.log("Resolved by application.preferences()");
								//console.log(JSON.stringify(data));
								application.package_id = data;

								if (!connect.connected()) {
									connect.toast.offline();
								}

								theme.init();

								dbase.open()
								.then (()=>{
									//console.log("Resolved by dbase.open()");
									application.tmpfiles.clean()
									.then (()=>{
										//console.log("Resolved by application.tmpfiles.clean()");
										resolve();
									})
									.catch(()=>{
										//console.warn("Rejected by application.tmpfiles.clean()");
										resolve();
									});
								})
								.catch(()=>{
									//console.error("Rejected by dbase.open()");
									reject();
								});

							})
							.catch(()=>{
								//console.error("Rejected by application.preferences()");
								reject();
							});

						},
						function() {
							//console.error("Rejected by window.CacheClear()");
							reject();
						}
					);

			}
		);

	},

	onrun : function(callback)
	{
		application.initDevice()
		.then (()=>{
			//console.log("Resolved by application.initDevice()");
			callback()
			.then (()=>{ 
				console.log("Application runs normally");
			})
			.catch(()=>{
				//console.error("Rejected by callback()");
				application.mobileExit();
			});
		})
		.catch(()=>{
			application.mobileExit();
		});
	},

	run : function(callback)
	{
		document.addEventListener(
			'deviceready', 
			function() {
				if (typeof echo !== "undefined") {
					echo.init();
				}
				//console.info("IN application.run()");
				//wait.show();
				//console.log("After wait.show()");
				application.onrun(callback);
			},
			false
		);
	}

}




// End of file: application.js
// ============================================================================