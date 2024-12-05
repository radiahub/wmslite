// ============================================================================
// Module      : theme.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2022
//               All rights reserved
//
// Application : Generic
// Description : Mobile device theme support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================
var theme = {

	initialized : false,

	// **************************************************************************
	// **************************************************************************
	//
	// UTILS
	//
	// **************************************************************************
	// **************************************************************************

	bgcolor: function(selector)
	{
		var bg_color = hex2color(rgb2hex(getCssValue(selector, "background-color")));
		return bg_color;
	},


	// **************************************************************************
	// **************************************************************************
	//
	// STATUS BAR
	//
	// **************************************************************************
	// **************************************************************************

	statusbar : {

		currentColor : "",

		fromHexColor : function(bg_color) 
		{
			return new Promise(
				(resolve, reject)=>{
					console.info("IN theme.statusbar.fromHexColor() bg_color='" + bg_color + "'");
					delay(200,function(){

						bg_color = hex2color(bg_color);
						var foreground = contrast(bg_color);
						console.log("foreground='" + foreground + "'");
						try {
							theme.statusbar.currentColor = bg_color;
							StatusBar.backgroundColorByHexString(bg_color);
							if (strcasecmp(foreground, "light") === 0) {
								StatusBar.styleLightContent();
							}
							else {
								StatusBar.styleDefault();
							}
							resolve();
						}
						catch(e) {
							//console.error("Runtime error in statusbar.fromHexColor()");
							reject();
						}

					});
				}
			);
		},

		fromCssSelector : function(selector)
		{
			return new Promise(
				(resolve, reject)=>{
					if (typeof selector === "undefined") { selector = "statusbar"; }
					//console.info("IN theme.statusbar.fromCssSelector() selector='" + selector + "'");
					theme.statusbar.fromHexColor(theme.bgcolor(selector))
					.then (()=>{
						//console.log("Resolved by theme.statusbar.fromHexColor()");
						resolve();
					})
					.catch(()=>{
						//console.error("Rejected by theme.statusbar.fromHexColor()");
						reject();
					});
				}
			);
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// NAVIGATION BAR
	//
	// **************************************************************************
	// **************************************************************************

	navigationbar : {

		currentColor : "",

		fromHexColor : function(bg_color) 
		{
			return new Promise(
				(resolve, reject)=>{
					console.info("IN theme.navigationbar.fromHexColor() bg_color='" + bg_color + "'");
					bg_color = hex2color(bg_color);
					var foreground = contrast(bg_color);
					console.log("foreground='" + foreground + "'");
					try {
						theme.navigationbar.currentColor = bg_color;
						if (strcasecmp(foreground, "light") === 0) {
							NavigationBar.backgroundColorByHexString(bg_color, false);		
						}
						else {
							NavigationBar.backgroundColorByHexString(bg_color, true);				
						}
						resolve();
					}
					catch(e) {
						reject();
					}

				}
			);
		},

		fromCssSelector : function(selector)
		{
			return new Promise(
				(resolve, reject)=>{
					//console.info("IN theme.navigationbar.fromCssSelector() selector='" + selector + "'");
					theme.navigationbar.fromHexColor(theme.bgcolor(selector))
					.then (()=>{
						//console.log("Resolved by theme.navigationbar.fromHexColor()");
						resolve();
					})
					.catch(()=>{
						//console.error("Rejected by theme.navigationbar.fromHexColor()");
						reject();
					});
				}
			);
		}

	},


	// **************************************************************************
	// **************************************************************************
	//
	// RUNTIME
	//
	// **************************************************************************
	// **************************************************************************

	get : function()
	{
		return new Promise(
			(resolve, reject)=>{
				//console.info("IN theme.get()");
				if (typeof AutoTheme !== "undefined") {
					AutoTheme.getTheme(function(isDarkMode) {
						if (isDarkMode) {
							resolve("dark");
						}
						else {
							resolve("light");
						}
					});
				}
				else {
					resolve("light");
				}
			}
		);
	},

	apply : function (themeID)
	{
		return new Promise(
			(resolve, reject)=>{
				//console.info("IN theme.apply() themeID='" + themeID + "'");

				var terminate = function() {
					//console.info("IN theme.apply()->terminate()");
					theme.initialized = true;
					if (typeof pages !== "undefined") {
						pages.onthemechanged(themeID)
						.then (()=>{ delay (100).then(()=>{ resolve(); }).catch(()=>{}); })
						.catch(()=>{ delay (100).then(()=>{ resolve(); }).catch(()=>{}); });
					}
					else {
						//console.warn("pages object is undefined");
						delay (100).then(()=>{ resolve(); }).catch(()=>{});
					}
				};

				var selector = (theme.initialized) ? "statusbar" : "splashbar";

				var applySelectorToStatusBar = function() {
					return new Promise(
						(yes, no)=>{
							
							console.info("IN theme.apply()->applySelectorToStatusBar()");
							/*
							console.log(selector);
							theme.statusbar.fromCssSelector(selector)
							.then (()=>{
								yes();
							})
							.catch(()=>{
								console.warn("Rejected by theme.statusbar.fromCssSelector()");
								no();
							});
							*/
							
							application.preference("statusbar")
							.then ((colors)=>{
								console.log(JSON.stringify(colors));
								console.log(colors[themeID]);
								theme.statusbar.fromHexColor(colors[themeID])
								.then (()=>{
									yes();
								})
								.catch(()=>{
									//console.warn("Rejected by theme.statusbar.fromCssSelector()");
									no();
								});
							})
							.catch(()=>{
								console.warn("Rejected by application.preference(statusbar)");
								no();
							});
							
						}
					);
				};

				var applySelectorToNavigationBar = function() {
					return new Promise(
						(yes, no)=>{
							console.info("IN theme.apply()->applySelectorToNavigationBar()");
							/*
							console.log(selector);
							theme.navigationbar.fromCssSelector(selector)
							.then (()=>{
								yes();
							})
							.catch(()=>{
								console.warn("Rejected by theme.navigationbar.fromCssSelector()");
								no();
							});
							*/
							application.preference("navigationbar")
							.then ((colors)=>{
								console.log(JSON.stringify(colors));
								console.log(colors[themeID]);
								theme.navigationbar.fromHexColor(colors[themeID])
								.then (()=>{
									yes();
								})
								.catch(()=>{
									//console.warn("Rejected by theme.navigationbar.fromCssSelector()");
									no();
								});
							})
							.catch(()=>{
								console.warn("Rejected by application.preference(navigationbar)");
								no();
							});
						}
					)
				};

				document.documentElement.className = "theme-" + themeID;

				applySelectorToStatusBar()
				.then (()=>{
					applySelectorToNavigationBar()
					.then (()=>{
						terminate();
					})
					.catch(()=>{
						terminate();
					});
				})
				.catch(()=>{
					terminate();
				});

			}
		);
	},


	// **************************************************************************
	// **************************************************************************
	//
	// RUNTIME EVENTS
	//
	// **************************************************************************
	// **************************************************************************

	onThemeChange : function(isDarkMode)
	{
		//console.info("IN theme.onThemeChange() isDarkMode=" + String(isDarkMode));
		var currentTheme = (isDarkMode) ? "dark" : "light";
		theme.apply(currentTheme)
		.then (()=>{
			//console.log("Resolved by theme.apply() currentTheme='" + currentTheme + "'");
		})
		.catch(()=>{ 
			//console.warn("Rejected by theme.apply() currentTheme='" + currentTheme + "'");
		});
	},


	// **************************************************************************
	// **************************************************************************
	//
	// INITIALIZATION
	//
	// **************************************************************************
	// **************************************************************************

	init : function()
	{
		if (typeof AutoTheme !== "undefined") {

			console.info("IN theme.init()");

			window.onThemeChange = function(isDarkMode) {
				theme.onThemeChange(isDarkMode);
			};

			AutoTheme.getTheme(function(isDarkMode) {
				theme.onThemeChange(isDarkMode);
			});

		}
	}

};




// End of file: theme.js
// ============================================================================