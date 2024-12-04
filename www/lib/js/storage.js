// ============================================================================
// Module      : storage.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : Browser local storage support
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

function local_storage ()
{
	var that = this;
	this.can_local_storage = false;


	this._can_local_storage_ = function ()
	{
		try
		{
			var date = new Date;
			var uid  = String (date.getTime());
			if ('localStorage' in window && window['localStorage'] !== null) {
				localStorage.setItem ('uid', uid);
				var result = (localStorage.getItem ('uid') === uid);
				localStorage.removeItem ('uid');
				return result;
			}
		}
		catch (exception)
		{
			return false;
		}
		return false;
	};


	this.set = function(variable, value)
	{
		var result = false;
		if (that.can_local_storage) {
			try { 
				localStorage.setItem(variable,value);
				result = value;
			}
			catch(exception) {
				result = false;
			}
		}
		return result;
	};


	this.get = function(variable)
	{
		var result = null;
		if (that.can_local_storage) {
			try { 
				result = localStorage.getItem(variable); // Return null if the key does not exist
			}
			catch (exception) { 
				result = null;
			}
		}
		return result;
	};


	this.val = function(variable, value)
	{
		var result = false;
		if (that.can_local_storage) {
			if (typeof value !== "undefined") {
				try { 
					localStorage.setItem(variable,value);
					result = value;
				}
				catch(exception) {
				}
			}
			else {
				try { 
					result = localStorage.getItem(variable); 
					// result can be null here
				}
				catch (exception) { 
				}
			}
		}
		return result;
	};


	this.remove = function (variable)
	{
		if (that.can_local_storage) {
			try  { 
				localStorage.removeItem(variable); 
				return true; 
			}
			catch(exception) { 
				return false; 
			}
		}
		return false;
	};

	this.del = function (variable)
	{
		return that.remove(variable);
	};


	this.dump = function()
	{
		if (that.can_local_storage) {
			try  { 
				var txt = "";
				jQuery.each(localStorage, function(key,value){
				//console.log(strmatch("function",value));
				//console.log(key);
					if ((key !=="length") && (! strmatch("function",value))) {
						if (strlen(txt) > 0) { txt += "\n"; }
						txt += key + "\"=>\"" + value + "\"";
					}
				});
				return txt;
			}
			catch(exception) { 
				//console.error("Runtime exception in local_storage.dump()");
			}
		}
	};

	this.clear = function()
	{
		try  { 
			var arr = [];
			jQuery.each(localStorage, function(variable, value){
				arr.push(variable);
			});
			if (arr.length > 0) {
				for (var i = 0; i < arr.length; i++) {
					that.remove(variable);
				}
			}
		}
		catch(exception) { 
			//console.error("Runtime exception in local_storage.clear()");
		}
	};


	this.init = function()
	{
		if (that._can_local_storage_()) {
			that.can_local_storage = true;
		}
	};


	this.init();
}


var storage = new local_storage();


// End of file: storage.js
// ============================================================================