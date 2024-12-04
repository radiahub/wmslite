// ============================================================================
// Module      : lib.js
// Version     : 1.0
//
// Author      : Denis Patrice <denispatrice@yahoo.com>
// Copyright   : Copyright (c) Denis Patrice Dipl.-Ing. 2011, 2012
//               All rights reserved
//
// Application : Generic
// Description : General purpose library
//
// Date+Time of change   By     Description
// --------------------- ------ ----------------------------------------------
// 12-May-24 00:00 WIT   Denis  Deployment V. 2024 "LEO MALET"
//
// ============================================================================

// Minify using https://javascript-minifier.com/
// Because of multiple regular expressions, not supported by jsmin.exe
//

if (typeof COUNTRY_ISO_2LTR === "undefined") {
	var COUNTRY_ISO_2LTR = "ID";
	var COUNTRY_NAME = "Indonesia";
}

if (typeof CURRENCY_FORMAT === "undefined") {
  var CURRENCY_FORMAT   = "IDR [amount]";
	var CURRENCY_ST_SHORT = "IDR";
	var CURRENCY_ISO_3LTR = "IDR";
  var CURRENCY_DECIMALS = 0;
}

if (typeof ST_PHONE_CTRY_CODE === "undefined") {
	var ST_PHONE_CTRY_CODE = "+62";
}

const thousandsSeparator = () => {

  try {
    let num = 1000;
    let numStr = num.toLocaleString();
    return numStr.slice(1,2);
  }
  catch(e) {
    return ".";
  }
};

const decimalsSeparator = () => {

  try {
    let num = 1.1;
    let numStr = num.toLocaleString();
    return numStr.slice(1, 2);
  }
  catch(e) {
    return ",";
  }
};


// ****************************************************************************
// ****************************************************************************
//
// DEFINITION AND CAST
//
// ****************************************************************************
// ****************************************************************************

const is_json = (jsonTest) => {
  try {
    var o = JSON.parse(jsonTest);
    if (o && typeof o === "object") {
      return true;
    }
  }
  catch (e) {}
  return false;
};

const is_object = (objTest, excludeArray) => {
	if (typeof excludeArray === "undefined") { excludeArray = false; }
	try {
		if (! excludeArray) {
			if ((typeof objTest === 'object') && (objTest !== null)) {
				return true;
			}
		}
		else {
			if ((typeof objTest === 'object') && (objTest !== null) && (! Array.isArray(objTest))) {
				return true;
			}
		}
	}
	catch (e) {}
  return false;
};

const is_base64 = (str) => {
  const notBase64 = /[^A-Z0-9+\/=]/i;
  const len = str.length;
  if (!len || len % 4 !== 0 || notBase64.test(str)) {
    return false;
  }
  const firstPaddingChar = str.indexOf('=');
  return firstPaddingChar === -1 ||
    firstPaddingChar === len - 1 ||
    (firstPaddingChar === len - 2 && str[len - 1] === '=');
}

const is_rgb = (color) => { // Something like '#RRGGBB' color value

	var dummy = color;
	if (dummy.slice(0,1) === "#") { dummy = dummy.slice(1); }

	var result = (dummy.length === 6);
	if (result) {
		var test = "#0123456789ABCDEF";
		color = color.toUpperCase();
		for (var i = 0; i < color.length; i++) {
			var p = test.indexOf(color.slice(i, i + 1));
			if (p < 0) {
				result = false;
				break;
			}
		}
	}

	return result;
}

const radians = (degrees) => {
	return degrees * Math.PI / 180;
};


// ****************************************************************************
// ****************************************************************************
//
// VALUE EVALUATION
//
// ****************************************************************************
// ****************************************************************************

var val = {

	isset : (variable) => {
	  try {
  	  if ((typeof variable === "undefined") || (variable === null)) {
    	  return false;
	    }
  	  else {
    	  return true;
    	}
	  }
  	catch(e) {
    	return false;
  	}
	},

	default : (cast) => {
		switch(cast.toLowerCase()) {
			case "str"  : case "string"  : { return ""; }
			case "int"  : case "integer" : { return parseInt("0"); }
			case "num"  : case "float"   : { return parseFloat("0.0"); }
			case "obj"  : case "object"  : { return {}; }
			case "bool" : case "boolean" : { return false; }
			case "null" : { return null; }
		}
	},

	str : (st, default_) => {
    if (typeof default_ === "undefined") { default_ = ""; }
		try {
			if (val.isset(st)) {
				return (String(st));
			}
			else {
				return default_;
			}
		}
		catch(err) {
			return default_;
		}
	},

	num : (stnum, cast, default_) => {

    if (typeof default_ === "undefined") { default_ = 0.0; }
		if (typeof cast === "undefined") { cast = "float"; }
		
    const return_zero = () => { 
			return (cast.toLowerCase() === "float") ? parseFloat("" + default_) : parseInt("" + default_); 
		};

		if (! val.isset(stnum)) {
			return return_zero(); 
		}
		else if (strlen(stnum) === 0) {
			return return_zero();
		}
		else if (! isNaN(stnum)) {
			if (cast.toUpperCase() === "FLOAT") {
				return parseFloat("" + stnum);
			}
			else {
				return parseInt("" + stnum);
			}
		}
		else {
			return return_zero();
		}
	},

	eval : (obj, cast) => {
		if (typeof cast === "undefined") { cast = "string"; }
		try {
			if (val.isset(obj)) { return obj; }
			return _default(cast);
		}
		catch(err) {
			return _default(cast);
		}
	},

	checkbox : (id, value) => {
		//console.log("IN val.checkbox()");
		if (typeof value !== "undefined") {
			value = String(value);
			let checked = ((value === "true") || (value === "1") || (value === "checked")) ? true : false;
			//console.log(checked);
			jQuery("#" + id).prop("checked", checked);
		}
		return (jQuery("#" + id).prop("checked") === true) ? true : false;
	},

	checkboxgroup: (name) => {
		// Reads the values of each group checkbox item
		var result = {};
		var selector = 'input[type=checkbox][name="' + name + '"]';
		//console.log(selector);
		jQuery(selector).each(function(){
			var id = jQuery(this).attr("id");
			//console.log(id);
			if (strlen(id) > 0) {
				var value = val.checkbox(id);
				result[id] = value;
			}
		});
		return result;
	},

	select : (id, value, get_caption) => {
		if (typeof get_caption === "undefined") { get_caption = false; }
		if (val.isset(value) && (value !== null)) { jQuery('#' + id).val(value).change(); }
		var value = "";
		if (get_caption) {
			value = jQuery('#' + id + ' option:selected').text();
		}
		else {
			value = jQuery('#' + id + ' option:selected').val();
		}
		return value;
	},

	selectclear : (id) => {
		//console.log("IN val.selectclear()", id);
		jQuery("#" + id).empty();
	},

	selectaddoption : (id, value, caption, selected) => {

		if (typeof selected === "undefined") { selected = false; }

		var html = '<option value="[value]">[caption]</option>';
		html = str_replace("[value]",   value,   html);
		html = str_replace("[caption]", caption, html);

		jQuery("#" + id).append(html);

		if (selected) {
			setTimeout(
				function() { val.select(id, value); },
				200
			);
		}

	},

	selectremoveoption : (id, value) => {
		jQuery("#" + id + " option[value='" + value + "']").remove();
	},

	// options: array of { value:value, caption:caption }
	//
	selectoptions : (id, options, value) => {
		//console.log("IN selectoptions() id='" + id + "'");
		//console.log(options);
		if (options.length > 0) {
			var htmlOption = '<option value="[value]">[caption]</option>';
			for (var i = 0; i < options.length; i++) {
				jQuery("#" + id).append(str_parse(htmlOption, options[i]));
			}
		}
		if (typeof value !== "undefined") {
			setTimeout(
				function() { val.select(id, value); },
				100
			);
		}
	},

	contenteditable : (id, value) => {
		//console.log("IN val.contenteditable()");
		//console.log(value);
		if (typeof value !== "undefined") {
			var buffer = str_replace("\n", "<br>", value);
			//console.log(buffer);
			jQuery("#" + id).html(buffer);
		}
		/*
		var result = jQuery("#" + id).text();
		//console.log(result);
		*/
		var result = jQuery("#" + id).html();
		result = htmlEntities.decode(result);
		//console.log(result);
		result = str_replace("<br>",   "\n", result);
		result = str_replace("<div>",  "\n", result);
		result = str_replace("</div>",  "",  result);
		result = str_replace("<p>",    "\n", result);
		result = str_replace("</p>",    "",  result);
		result = str_replace("<span>", "",   result);
		result = str_replace("</span>", "",  result);

		result = trim(result);
		return result;
	},

	radio : (name, value) => {

		if (val.isset(value)) {
			jQuery('input[type=radio][name="' + name + '"]').removeAttr('checked');
			jQuery('input[type=radio][name="' + name + '"][value="' + value + '"]').prop('checked', true);
		}
		return jQuery('input[type=radio][name="' + name + '"]:checked').val();
	},

	masked : function(itemID, cast) {

		switch(cast.toLowerCase()) {

			case "int" : case "integer" : {
				return val.num(jQuery("#" + itemID).cleanVal(), "integer");
			}
			case "num" : case "float" : {
				return val.num(jQuery("#" + itemID).cleanVal(), "float");
			}
			default : {
				return val.str(jQuery("#" + itemID).cleanVal());
			}
		}
	}
};

// rn : Resolve Null
//
function rn (value, default_value)
{
  if (typeof default_value === "undefined") { default_value = null; }
  var result = (! val.isset(value)) ? default_value : value;
  return result;
};

// rnull : Resolve Null, return empty string "" on undefined or NULL value
//
function rnull(value)
{
  var result = (! val.isset(value)) ? "" : String(value);
	return result;
}

function hex2a (hex) {
	hex = hex.toString(16);
	var str = '';
	for (var i = 0; i < hex.length; i += 2) {
		str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
	}
	return str;
}

function a2hex (str) {
	var arr=[];
	for (var i = 0, l = str.length; i < l; i++) {
		var hex = Number(str.charCodeAt(i)).toString(16);
		arr.push(hex.length > 1 && hex || "0" + hex);	
	}
	return arr.join(' ');
};

function chr (ascii)
{
  return String.fromCharCode ((96<= ascii && ascii <= 105) ? ascii-48 : ascii);
}

function asc (char)
{
	var str = String(char);
	return str.charCodeAt(0);
}


// ****************************************************************************
// ****************************************************************************
//
// VALUE FORMAT VERIFICATION
//
// ****************************************************************************
// ****************************************************************************

/*
 * Minimal verification of the format of a value
 *
 */
function verify(what, value)
{
  if (! val.isset(value)) { return false; }

  switch(what) {

    case "number" :
		{
      return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
      break;
    }

    case "email" :
		{
      value = trim(value);
      if((value === null)||(value==="")){
        return false;
      }
   		var at   = "@";
      var dot  = ".";
  		var lat  = value.indexOf(at);
      var lstr = value.length;
      if(value.indexOf(at)=== -1) {
        return false;
      }

  		if(value.indexOf(at)===-1 || value.indexOf(at)===0 || value.indexOf(at)===lstr) {
        return false;
      }

   		if(value.indexOf(dot)===-1 || value.indexOf(dot)===0 || value.indexOf(dot)===lstr){
        return false;
      }

      if(value.indexOf(at,(lat+1))!==-1){
 		    return false;
      }

      if(value.slice(lat-1, lat)===dot || value.slice(lat+1, lat+2)===dot){
        return false;
      }

  		if(value.indexOf(dot,(lat+2))===-1){
        return false;
      }

      if(value.indexOf(" ")!==-1){
        return false;
      }

      return true;
      break;
    }

    case "required":
		{
			var dummy = String(value);
			if (strlen(dummy) > 0) {
				dummy = trim(String(value));
				return(strlen(dummy) > 0);
			}
      break;
    }

    case "url" :
		{
      var dummy = trim(value);
      if(dummy.length > 0) {
        return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
      }
      return false;
      break;
    }
  }

	return false;
}


// ****************************************************************************
// ****************************************************************************
//
// FUNCTIONS
//
// ****************************************************************************
// ****************************************************************************

const noop = () => {};

const Resolve = function()
{
	return new Promise(
		(resolve, reject) => {
			setTimeout(()=>{ resolve(); }, 100);
		}
	);
}

const Reject = function()
{
	return new Promise(
		(resolve, reject) => {
			setTimeout(()=>{ reject(); }, 100);
		}
	);
}

const is_promise = function(F)
{
	//console.info("IN isPromise()");
	if (typeof F !== "function") {
		return false;
	}
	var str = F.toString();
	str = str_replace("\t", " ", str);
	str = str_replace("  ", " ", str);
	var needle = "return new Promise";
	return (str.indexOf(needle) >= 0);
};

// Compatible with "await delay(...)" from async JS function
//
// callback: function return new Promise()
//
// Example:
// delay(1000).then(()=>{...}).catch(()=>{})
// await(delay(1000));
//
const delay = function(milliseconds, callback)
{
	return new Promise(
		(resolve, reject) => {
			//console.info("IN delay()");
			if (typeof callback === "function") {
				if (is_promise(callback)) {
					setTimeout(
						function() {
							try {
								callback()
								.then((res)=>{
									//console.log("Resolved by delay()->callback() res='" + JSON.stringify(res) + "'");
									if (typeof res !== "undefined") {
										resolve(res);
									}
									else {
										resolve();
									}
								})
								.catch(()=>{
									//console.error("Rejected by delay()->callback()");
									reject(); //This is blocking
								});
							}
							catch(e) {
								//console.error("Runtime exception in delay()->callback()");
								reject(); //This is blocking
							}
						},
						milliseconds
					);
				}
				else {
					setTimeout(
						function() {
							var res = callback();
							if (typeof res !== "undefined") {
								resolve(res);
							}
							else {
								resolve();
							}
						},
						milliseconds
					);
				}
			}
			else {
				setTimeout(function(){ resolve(); }, milliseconds);
			}
		}
	);
};

const debounce = (function ()
{
  var timers = {};
  return function (callback, ms, eventID) {
    if (timers[eventID]) {
      clearTimeout (timers[eventID]);
    }
    timers[eventID] = setTimeout (callback, ms);
  };
}
)();


// ****************************************************************************
// ****************************************************************************
//
// OBJECTS
//
// ****************************************************************************
// ****************************************************************************

function objType(obj)
{
	//console.log("IN objType()");

	if (typeof obj === "undefined")	{
		return "undefined";
	}
	else if (typeof obj === "object")	{
		if (obj === null) {
			return "null";
		}
		else if (Array.isArray(obj)) {
			return "array";
		}
		else if (obj instanceof Date) {
			return "date";
		}
		else {
			return "object";
		}
	}
	else if (typeof obj === "boolean") {
		return "boolean";
	}
	else if (typeof obj === "number") {
		var st = String(obj);
		if (st.length > 0) {
			if (isNaN(obj)) {
				return "string";
			}
			else {
				if (obj && obj % 1 === 0) {
					return "integer";
				}
				else {
					return "float";
				}
			}
		}
		else {
			return "string";
		}
	}
	else if (typeof obj === "function") {
		return "function";
	}
	else if (is_json(obj)) {
		return "json_object";
	}
	else {
		return "string";
	}
}

function is_url(obj)
{
	//console.log("IN is_url()");
	var result = objType(obj);
	switch(result) {
		case "string": {
			return verify.url(obj);
			/*
			if (obj.indexOf("://") > 0) {
				return true;
			}
			*/
			break;
		}
	}
	return false;
}

function properties(obj)
{
	//console.log("IN properties()");
	var result = Object.getOwnPropertyNames(obj).filter(function (p) { return typeof obj[p] !== 'function'; });
	return result;
}

function methods(obj)
{
	//console.log("IN methods()");
	var result = Object.getOwnPropertyNames(obj).filter(function (p) { return typeof obj[p] === 'function'; });
	return result;
}


// ****************************************************************************
// ****************************************************************************
//
// STRINGS
//
// ****************************************************************************
// ****************************************************************************

var ST_ALPHA_UPPER     = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var ST_ALPHA_LOWER     = "abcdefghijklmnopqrstuvwxyz";
var ST_ALPHA           = ST_ALPHA_UPPER + ST_ALPHA_LOWER;
var ST_PUNCTUATION     = ".!:;,?-|\\/";
var ST_NUM             = "0123456789";
var ST_NUM_NON_NULL    = "123456789";
var ST_HEX             = ST_NUM + "ABCDEF";
var ST_ALPHANUM        = ST_ALPHA + ST_NUM + "_";
var ST_NUMBER          = ST_NUM + ".,+-";
var CURSOR_KEYCODES    = new Array (
	8,   // Backspace
	16,  // Shift
	17,  // Ctrl
	18,  // Alt
	19,  // Pause
	27,  // Esc
	33,  // PgUp
	34,  // PgDn,
	35,  // End
	36,  // Home
	37,  // Left
	38,  // Up
	39,  // Right
	40,  // Down
	45,  // Insert
	46,  // Del
	91,  // Windows
	112, // F1
	113, // F2
	114, // F3
	115, // F4
	116, // F5
	117, // F6
	118, // F7
	119, // F8
	120, // F9
	121, // F10
	122, // F11
	123, // F12
	145  // Scroll
);

const is_num = (st) => {
	//console.log("IN is_num() st='" + st + "'");
	if (strlen(st) > 0) {
		try {
			var result = /^\d+$/.test(st);
			//console.log(result);
			return result;
		}
		catch(e) {
			return false;
		}
	}
	else {
		return false;
	}
};

const is_alpha = (st) => {
	try {
		st = String(st);
		if (st.length > 0) {
			var regexp = /[a-z]/i;
			return regexp.test(st);
		}
		else {
			return false;
		}
	}
	catch(e) {
		return true;
	}
};

// Only implement if no native implementation is available
if (typeof Array.isArray === 'undefined') {
  Array.isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }
};

const is_array = (obj) => {
	try {
		return Array.isArray(obj);
	}
	catch(e) {
		return false;
	}
};

const strlen = (st) => {
	try {
		dummy = val.str(st);
		return dummy.length;
	}
	catch(ex) {
		return -1;
	}
};

const trim = (st) => {
	st = String(st);
	let result = st;
	try {
		if (strlen(result) > 0) {
			result = result.replace (/^\s+|\s+$/g, "");
		}
	}
	catch(e) {
		result = st;
	}
	return result;
};

const strtoupper = (st) => {
	try {
		dummy = String(st);
		return dummy.toUpperCase();
	}
	catch(ex) {
		return st;
	}
};

const strtolower = (st) => {
	try {
		dummy = String(st);
		return dummy.toLowerCase();
	}
	catch(ex) {
		return st;
	}
};

const str_replace = (find, replace, subject) => {

  if (strlen(subject) > 0) {
		subject = String(subject);
		replace = String(replace);
		find    = String(find);
		var escapeRegExp = function(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}
		return subject.replace(new RegExp(escapeRegExp(find), 'g'), replace);
	}

	return "";

};

const str_filter = (str, keep) => {
	var result = "";
	str = String(str);
	for (var i = 0; i < str.length; i++) {
		var c = str.slice(i, i + 1);
		if (keep.indexOf(c) >= 0) {
			result += c;
		}
	}
	return result;
};

const str_comp = (str1, str2) => {
	str1 = String(str1); str2 = String(str2);
	//console.log("IN str_cmp() str1='" + str1 + "' str2='" + str2 + "'");
	var result = ( ( str1 === str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
	//console.log(result);
  return result;  
}

const strcmp = (str1, str2) => { return str_comp(str1, str2); }


const str_casecmp = (str1, str2) => {
  return strcmp(str1.toUpperCase(), str2.toUpperCase());
};

const strcasecmp = (str1, str2) => { return str_casecmp(str1, str2); }


const str_match = (st1,st2) => {

	st1 = String(st1); st1=trim(st1);
	st2 = String(st2); st2=trim(st2);

	if ((st1.length > 0) && (st2.length > 0)) {
		var len = Math.min(st1.length,st2.length);
		var s1  = st1.slice(0,len); s1 = s1.toUpperCase();
		var s2  = st2.slice(0,len); s2 = s2.toUpperCase();
		//console.log("'" + s1 + "','" + s2 + "'");
		return (s1 === s2);
	}
	else {
		return (st1 === st2);
	}
}

const strmatch = (str1, str2) => { return str_match(str1, str2); }


const str_like = (haystack, needle) => {
	if (String(haystack).toUpperCase().indexOf(String(needle).toUpperCase()) >= 0) {
		return true;
	}
	return false;
};


const str_parse = (st, obj) => {
  var result = st;
  for (var i in obj) {
		var key = "[" + i + "]";
		result = str_replace (key, obj[i], result);
	}
  return result;
};

const str_concat = (char, len) => {
  var st = "";
  for (var i = 0; i < len; i++) {
    st += char;
  }
  return st;
};

const str_chunks = (str, len) => {
  const numChunks = Math.ceil(str.length / len);
  const chunks = new Array(numChunks);
  for (let i = 0, o = 0; i < numChunks; ++i, o += len) {
    chunks[i] = str.slice(o, len);
  }
  return chunks;
};

const str_pad = (str, char, len, side) => {
	str = str.toString();
  if (str.length > len) {
    switch(side.toUpperCase()) {
      case "LEFT": {
        return str.slice(str.length - len);
      }
      case "RIGHT": {
        return str.slice(0, len);
      }
    }    
  }
  else if (str.length < len) {
    var missed = len - str.length;
    var pad = str_concat(char, missed);
    switch(side.toUpperCase()) {
      case "LEFT": {
        return "" + pad + str;
      }
      case "RIGHT": {
        return "" + str + pad;
      }
    }    
  }
  else {
    return str;
  }
};

const str_unpad = (str, side) => {

  switch(side.toUpperCase()) {
    case "LEFT": {
      var char = str.slice(0, 1);
      for (var i = 0; i < str.length; i++) {
        if (str[i] !== char) {
          return str.slice(i);
        }
      }
    }
    case "RIGHT": {
      var char = str.slice(str.length - 1);
      for (var i = (str.length -1); i >= 0; i--) {
        if (str[i] !== char) {
          return str.slice(0, i + 1);
        }
      }
    }
  }
  return str;
};

const str_section = (st, stStart, stEnd) => {
	var p = st.indexOf(stStart) + strlen(stStart);
	var q = st.indexOf(stEnd, p);
	var result = st.slice(p, q);
	return result;
}

const str_erase_section = (st, stStart, stEnd) => {
	var result = "";
	var p = st.indexOf(stStart);
	var q = st.indexOf(stEnd, p) + strlen(stEnd);
	result = st.slice(0, p) + st.slice(q);
	return result;
};

const str_insert = (what, into, position) => {
  if (position > 0) {
    if (position >= into.length) {
      return into + what;
    }
    return into.slice (0, position) + what + into.slice (position);
  }
  return what + into;
}

function strip_column (st)
{
	if (st.slice(st.length - 1) === ";") {
		st = st.slice(0, st.length - 1);
	}
	return st;
}

function strip_line_comments(str, comment_prefix) 
{
  var stripped = "";
  var arr = breakApart(str,"\n");
  for (var i = 0; i < arr.length; i++) {
    var line = arr[i];
    var p = line.indexOf(comment_prefix);
    line = (p > 0) ? line.slice(0, p) : (p === 0) ? "" : line;
		if (line.length > 0) {
			if (stripped.length > 0) { stripped += "\n"; }
			stripped += line;
		}
  }
  return stripped;
}

function strip_multiline_comments(str, comment_start, comment_end) 
{
  var stripped = str;
  var p = stripped.indexOf(comment_start);
  while (p >= 0) {
    var q = stripped.indexOf(comment_end, p);
    stripped = (q > p) ? stripped.slice(0, p) + stripped.slice (q + comment_end.length) : stripped.slice(0, p);
    p = stripped.indexOf(comment_start);
  }
  return stripped;
}

function strip_variable_placeholders(str, variable_start, variable_end) 
{
	if (typeof variable_end   === "undefined") { variable_end   = "]"; }
	if (typeof variable_start === "undefined") { variable_start = "["; }
  var stripped = str;
  var p = stripped.indexOf(variable_start);
  while (p >= 0) {
    var q = stripped.indexOf(variable_end, p);
    stripped = (q > p) ? stripped.slice(0, p) + stripped.slice (q + comment_end.length) : stripped.slice(0, p);
    p = stripped.indexOf(variable_start);
  }
  return stripped;
}

function strip_comments(st)
{
  var result = strip_line_comments(st,"//");
  result = strip_multiline_comments(result,"/*","*/");
  result = strip_multiline_comments(result,"<!--","-->");
	return result ;
}

function strip_sql_comments(st)
{
  return strip_line_comments(st,"--");
}

function strip_empty_lines(st)
{
  var stripped = "";
  var arr = breakApart(st,"\n");
  for (var i = 0; i < arr.length; i++) {
    var line = trim(arr[i]);
    if (line.length > 0) {
      if (stripped.length > 0) { stripped += "\n"; }
      stripped += line;
    }
  }
  return stripped;
}

function htmlText(st)
{
	//console.info("IN htmlText() st='" + st + "'");
  let tmp = document.createElement("DIV");
  tmp.innerHTML = st;
  return tmp.textContent || tmp.innerText || "";
}


// ****************************************************************************
// ****************************************************************************
//
// PARSE
//
// ****************************************************************************
// ****************************************************************************

function evaluate (st, variable, del)
{
	if (typeof del === "undefined") { del = "\""; }

	//console.log("IN evaluate()");
	//console.log(st);
	//console.log(variable);
	//console.log(del);

  var evaluateResult = "";
  if (st.length > 0) {
    let pos = st.indexOf (variable);
    if (pos >= 0) {
      let tmp   = st.slice (pos + variable.length);
      let l     = tmp.length;
      let invar = 0;
      for (var i = 0; i < l; i++) {
        let c = tmp.slice (i, i + 1);
        if (c === del) {
          if (invar === 1) {
            return evaluateResult;
          }
          else {
            invar = 1;
          }
        }
        else {
          if (invar === 1) {
            evaluateResult += c;
          }
        }
      }
    }
  }
  return evaluateResult;
}


// ****************************************************************************
// ****************************************************************************
//
// PAYLOAD UTILS
//
// ****************************************************************************
// ****************************************************************************

const payload_encode = (data) => {
	return window.btoa(JSON.stringify(data));
}

const payload_decode = (encoded) => {
	return (is_base64(encoded)) ? JSON.parse(window.atob(encoded)) : JSON.parse(encoded);
}

function baseUrl (url)
{
	var result = url;
	var p = result.indexOf("?");
	if (p > 0) {
		result = result.slice(0, p);
	}
	else if (p === 0) {
		result = "";
	}
	return result;
}

function parseUrl (url)
{
	var do_the_job = function(str) {
		var res = {};
		var arr = breakApart(str, "&");
		for (var i = 0; i < arr.length; i++) {
			var st = arr[i];
			var q = st.indexOf("=");
			if (q > 0) {
				var variable = trim(st.slice(0, q));
				if (strlen(variable) > 0) {
					var value = st.slice(q + 1);
					res[variable] = value;
				}
			}
		}
		return res;
	};

	var p = url.indexOf("?");
	if (p >= 0) {
		var str = url.slice(p + 1);
		if (strlen(str) > 0) {
			return do_the_job(str);
		}
	}
	else {
		return do_the_job(url);
	}

	return {};
}

function evalUrl (url, variable)
{
	var arr = parseUrl(url);
	for (var key in arr) {
		if (key === variable) {
			return arr[key];
		}
	}
	return null;
}

/*
 * Checks if an objet or array is structured as a given description
 * 
 * const arr       : array/object
 * const structure : array of field identifiers 
 * const strict    : boolean, true = exactly same field structure
 * 
 * Return boolean true if the structure comparaison is positive
 *
 */
function structured (arr, structure, strict)
{
	if (typeof strict !== "boolean") { strict = false; }
	
	/* Test all structure fields are declared */
	for (var i = 0; i < structure.length; i++) {
		var field = structure[i];
		//console.log(field);
		//console.log(typeof arr[field]);
		if (typeof arr[field] === "undefined") {
			return false;
		}
	}
	/* Test all array fields are defined in structure */
	if (strict) {
		for (var field in arr) {
			//console.log(field);
			var p = structure.indexOf(field);
			//console.log(p);
			if (p < 0) {
				return false;
			}
		}
	}
	return true;
}


// ****************************************************************************
// ****************************************************************************
//
// FORMAT
//
// ****************************************************************************
// ****************************************************************************

/*
 * Applies a pattern to replace the elements of a string
 * 
 * const string pattern : pattern to apply
 * const string str     : string to reformat
 * const string placer  : placeholder character 
 * 
 * pattern syntax:
 * 1. 1 char of the pattern matches 1 char of the string, until the string
 *    end is reached, or the pattern end is reached
 * 2. Char placeholder is set by default to ?,  another char can be passed
 *    as parameter, any other character is used in the result
 * 
 * Example:
 * pattern("???-???-", "1234567890") would return "123-456-7890"
 * 
 */
const str_pattern = (pattern, str, placer) => {

  if (typeof placer === "undefined") { placer = "?"; }
  
  var result = "";
  var strpos = 0;

  var no_of_placeholders = 0;
  for (var i = 0; i < pattern.length; i++) {
    var c = pattern.slice(i, i + 1);
    if (c === placer) {
      no_of_placeholders++;
    }
  }

  for (var i = 0; i < pattern.length; i++) {
    var c = pattern.slice(i, i + 1);
    if (c === placer) {
      if (strpos < str.length) {
        result += str.slice(strpos, strpos + 1);
        strpos++;
      }
      else {
        break;
      }
    }
     else {
      result += c;        
    }
  }

  if ((no_of_placeholders < str.length) && (strpos < str.length)) {
    result += str.slice(strpos);
  }

  return result;
}

/*
 * Formats a number.
 * 
 * IMPORTANT! THE GIVEN NUMBER IS SUPPOSED TO BE NOT-FORMATTED OR FORMATTED
 *            AS OF "INTEGER.DECIMALS""
 * 
 * const float  number        : number to format
 * const int    decimals      : number of decimals to apply
 * const string dec_point     : value of the decimal point
 * const string thousands_sep : value of the thousands separator
 * 
 * Returns string
 *
 */
function insert_th_sep (st, thousands_sep)
{
  var result = "";

  if (st.length === 0) {
    return result;
  }

  var dum = 0;
  for (var i = st.length - 1; i >= 0; i--) {
    if ((result.length > 0) && (dum === 0)) {
      result = thousands_sep + result;
    }
    var c = st.slice (i, i + 1);
    result = c + result;
    dum++;
    if (dum > 2) {
      dum = 0;
    }
  }

  return result;
}

function nowrap(st)
{
  st = str_replace(" ","&nbsp;",st);
  st = str_replace("-","&#8209;",st);
  return st;
}

function number_format (number, decimals, dec_point, thousands_sep, keep_zero)
{
	//alert("IN number_format() N=" + number);
  if (typeof keep_zero === "undefined") {
    keep_zero = true;
  }
  
  if (typeof thousands_sep === "undefined") {
  	thousands_sep = '.';
  }
  
  if (typeof dec_point === "undefined") {
  	dec_point = ',';
  }
  
  if (typeof decimals === "undefined") {
  	decimals = 0;
  }
  
  number = String(number);
  if (number.length === 0) {
    return "";
  }

	try {
		var dummy = parseFloat(number);
		if (! keep_zero && (dummy === 0.0)) {
			return "";
		}
	}
	catch(e) {
		return "";
	}

  var arr = breakApart (number, '.');
  var cnt = arr.length;
  switch (cnt) {

    case 1 : {
      arr [ 0 ] = insert_th_sep (arr [ 0 ], thousands_sep);
      arr [ 1 ] = str_concat ('0', decimals);
      break;
    }

    case 2 : {
      arr [ 0 ] = insert_th_sep (arr [ 0 ], thousands_sep);
      if (arr [ 1 ].length > decimals) {
        arr [ 1 ] = arr [ 1 ].slice (0, decimals);
      }
      else {
        for (var i = 0; i < 99; i++) {
          if (arr [ 1 ].length >= decimals) {
            break;
          }
          arr [ 1 ] += '0';
        }
      }
      break;
    }

  }

  if (decimals > 0) {
    number = arr [ 0 ] + dec_point + arr [ 1 ];
  }
  else {
    number = arr [ 0 ];
  }
  return number;
}

function floatstr(n, decimals)
{
	return number_format(n, decimals, ",", ".", true);
}

function number_locale(n, decimals)
{
  if (typeof decimals === "undefined") { decimals = 0; }
  var N = new Number(n);
  return N.toLocaleString(undefined,{maximumFractionDigits:decimals});
}

function money_locale(n)
{
  var N = new Number(n);
  return str_replace("[amount]", N.toLocaleString(undefined,{maximumFractionDigits:CURRENCY_DECIMALS}), CURRENCY_FORMAT);
}

function money(n)
{
  var N = new Number(n);
	return N.toLocaleString(undefined,{maximumFractionDigits:CURRENCY_DECIMALS});
}

function comprehensive_seconds (secs, short)
{
  if (typeof short === "undefined") {
    short = true;
  }

  var result = "";

	var days = Math.floor (secs / (24 * 3600));
	secs = secs - (days * 24 * 3600);
	var hours = Math.floor (secs / 3600);
	secs = secs - (hours * 3600);
	var minutes = Math.floor (secs / 60);
	secs = secs - (minutes * 60);

  var labelDays    = (days    > 1) ? "days"    : "day"   ;
  var labelHours   = (hours   > 1) ? "hours"   : "hour"  ;
  var labelMinutes = (minutes > 1) ? "minutes" : "minute";
  var labelSeconds = (secs    > 1) ? "seconds" : "second";

  if (short) {
    labelDays    = "d";
    labelHours   = "h";
    labelMinutes = "m";
    labelSeconds = "s";
  }

  if (days > 0) {
    result = "" + days + labelDays + " " + hours + labelHours + " " + minutes + labelMinutes + " " + secs + labelSeconds;
  }
  else {
    if (hours > 0) {
      result = "" + hours + labelHours + " " + minutes + labelMinutes + " " + secs + labelSeconds;
    }
    else {
      if (minutes > 0) {
        result = "" + minutes + labelMinutes + " " + secs + labelSeconds;
      }
      else {
        result = "" + secs + labelSeconds;
      }
    }
  }

  return result;
}

function comprehensive_filesize (bytes)
{
  var result = "";

  bytes = parseInt (String(bytes));

  if (bytes > 1073741824) {   // GB
    var q = Math.floor (bytes / 1073741824);
    var r = bytes - q;
    r = "" + r;
    r = r.slice (0, 1);
    result = q + "." + r + " GB";
  }
  else if (bytes > 1048576) {      // MB
    var q = Math.floor (bytes / 1048576);
    var r = bytes - q;
    r = "" + r;
    r = r.slice (0, 1);
    result = q + "." + r + " MB";
  }
  else if (bytes > 1024) {         // KB
    var q = Math.floor (bytes / 1024);
    var r = bytes - q;
    r = "" + r;
    r = r.slice (0, 1);
    result = q + "." + r + " KB";
  }
	else {
	  result = bytes + " B";
	}

  return result;
}

// Returns HTML-equivalent Hex string
//
function parseToHtmlHex(str) {
	var res = [];
	for (let c of str) {
    let n = c.codePointAt(0).toString(16);
		res.push(n);
	}
	var html = "";
	for (var i = 0; i < res.length; i++) {
		if (("" + String(res[i]) == "d") || ("" + String(res[i]) == "0xD")) {
			html += "<br>";
		}
		else {
			html += "&#x" + res[i] + ";";
		}
	}

	html = str_replace("&#x3c;&#x2f;&#x64;&#x69;&#x76;&#x3e;","",html); // </div>
	html = str_replace("&#x3c;&#x64;&#x69;&#x76;&#x3e;","<br>",html);   // <div>
	return html;
}

function stripHtmlHex(str) 
{
	//console.log("IN stripHtmlHex() str='" + str + "'");
	str = str_replace("<br>","&#x0D;",str);
	var arr = breakApart(str,";");
	var res = "";
	for (var i = 0; i < arr.length; i++) {
		var hex = arr[i]; hex = hex.slice(3);
		if (strlen(hex) === 2) {
			res += String.fromCharCode(parseInt(hex,16));
		}
	}
	return res;
}


// ****************************************************************************
// ****************************************************************************
//
// RANDOMIZE
//
// ****************************************************************************
// ****************************************************************************

const rand_hex_str = (len) => {
	var text = "";
	var possible = "ABCDEF0123456789";
  for(var i=0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
  return text;
};

const rand_num_str = (len)=> {
	var firstPossible = "123456789";
  var text = firstPossible.charAt(Math.floor(Math.random() * firstPossible.length));
	var possible = "0123456789";
  for(var i=0; i < len - 1; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
  return text;
};

const rand_alpha_str = (len) => {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(var i=0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
  return text;
};

const unique_id = () => {
	// is (in theory) not really unique, though...
	// should return a 12-digits code
	// /
	return String(Math.round(new Date().getTime()));
};

const uniqueid = ()=>{
	return unique_id();
};

function createUniqueShortID (tablename, fieldname, maxlen, maxcount)
{
	if (typeof maxcount === "undefined") { maxcount = 5000; }
	//console.log("IN createUniqueShortID() tablename='" + tablename + "' fieldname='" + fieldname + "' maxlen=" + maxlen + " maxcount=" + maxcount);
	return new Promise(
		(resolve,reject)=>{

			var id = rand_num_str(maxlen), count = 0;
			var iterate = function() {
				var go_on = function() {
					count++;
					if (count < maxcount) {
						id = rand_num_str(maxlen);
						iterate();
					}
					else {
						reject ();
					}
				};
				//console.log("IN createUniqueShortID()->iterate() id='" + id + "'");
				var locator = {}; locator[fieldname] = id;
				//console.log(JSON.stringify(locator));
				xdbref.locate("radiahub", tablename, locator)
				.then ((row)=>{
					if (row === null) {
						//console.log("valid id='" + id + "'");
						resolve(id);
					}
					else {
						go_on();
					}
				})
				.catch(()=>{
					//console.log("Rejected by xdbref.locate(" + tablename + ")")
					go_on();
				});
			};

			iterate();
		}
	);
};

function generateUUID() 
{ // Public Domain/MIT
	var d = new Date().getTime();//Timestamp
	var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16;//random number between 0 and 16
			if(d > 0){//Use timestamp until depleted
					r = (d + r)%16 | 0;
					d = Math.floor(d/16);
			} else {//Use microseconds since page-load if supported
					r = (d2 + r)%16 | 0;
					d2 = Math.floor(d2/16);
			}
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
};


// ****************************************************************************
// ****************************************************************************
//
// ARRAYS
//
// ****************************************************************************
// ****************************************************************************

// Does NOT trim key values, number of returned values limited to max
// max <= 0 : all values are returned (no number limitation)
//
const breakApart = (str, delimiter, max) => {

	//console.log("IN breakApart()");

	var result = new Array();
	
	if (typeof max === "undefined") { max= 0; }
	if (Array.isArray(str)) { return str; }

	//console.log("IN breakApart() str='" + str + "'");

	var st = String(str), count = 0;
	var p = st.indexOf(delimiter);

	//console.log(st, p);

	while ((p >= 0) && (st.length > 0)) {

		if (p === 0) {
			result.push("");
			if (st.length > 1) {
				st = st.slice(1);
			}
			else {
				st = "";
				break;
			}
		}
		else {
			var key = st.slice(0, p);
			if (max <= 0) {
				result.push(key);
			}
			else {
				if (count < max - 1) {
					result.push(key);
					count++;
				}
				else {
					st = "";
					break;
				}
			}

			if (p < st.length - 1) {
				st = st.slice(p + 1);
			}
			else {
				st = "";
				break;
			}
		}

		p = st.indexOf(delimiter);
	}

	if (st.length > 0) {
		result.push(st);
	}

	return result;
}

// DOES trim key values, does not limit the number of returned values
//
const arrayOf = (st, delimiter) => {

	if (is_array(st)) {
		return st;
	}

	if (typeof delimiter === "undefined") { delimiter = ","; }

	var result = [];

	if (typeof st === "string") {
  	var dummy = breakApart (st, delimiter);
  	for (var i = 0; i < dummy.length; i++) {
  		var dumdum = trim(dummy[i]);
  		if (dumdum.length > 0) {
				result.push(dumdum);
  		}
  	}
  }
	else {
		result = [];
		result.push(String(st));
	}

  return result;
};

// DOES trim key values, does not limit the number of returned values
// Alias for arrayOf
//
const array_of = (st, delimiter) => {

	if (typeof delimiter === "undefined") { delimiter = ","; }
	return arrayOf(st, delimiter);
};

const arrvalue = function (arr, key)
{
	var result = null;
	try {
		if (val.isset(arr[key])) {
			return arr[key];
		}
	}
	catch(e) {
		result = null;
	}
	return result;
};

/**
 * This function will accept two objects as arguments and return the deeply merged object result.
 * @param  {object} targetObject objects containing the properties to be merged with source.
 * @param  {object} sourceObject objects containing the properties you want to apply.
 * @return {object} return the deeply merged object result
 */
function deepMerge(targetObject = {}, sourceObject = {}) 
{
  // clone the source and target objects to avoid the mutation
  const copyTargetObject = JSON.parse(JSON.stringify(targetObject));
  const copySourceObject = JSON.parse(JSON.stringify(sourceObject));
  // Iterating through all the keys of source object
  Object.keys(copySourceObject).forEach((key) => {
    if (typeof copySourceObject[key] === "object" && !Array.isArray(copySourceObject[key])) {
      // If property has nested object, call the function recursively
      copyTargetObject[key] = deepMerge(
        copyTargetObject[key],
        copySourceObject[key]
      );
    } else {
      // else merge the object source to target
      copyTargetObject[key] = copySourceObject[key];
    }
  });
  return copyTargetObject;
}

// Clone an object
//
function clone (obj) { 
	if (Array.isArray(obj)) {
		return Object.assign([], obj);
	}
	else {
		return Object.assign({}, obj);
		//return deepMerge({}, obj);
	}
};


// ****************************************************************************
// ****************************************************************************
//
// VIEWPORT
//
// ****************************************************************************
// ****************************************************************************

function decimal(num, dec)
{
	if (typeof dec === "undefined") { dec = 2; }
	if (isNaN(num)) {
		return null;
	}
	var coef = 10 ** dec;
	return Math.round((num + Number.EPSILON) * coef) / coef;
}

function geometry()
{
	var orientation = (window.innerWidth > window.innerHeight) ? "landscape" : "portrait";
	var result = { orientation: orientation };

	result["screenWidth" ] = screen.width ;
	result["screenHeight"] = screen.height;
	result["windowWidth" ] = window.innerWidth ;
	result["windowHeight"] = window.innerHeight;

	result["screenRatioWidth" ] = decimal((screen.width  / window.innerWidth),  3);
	result["screenRatioHeight"] = decimal((screen.height / window.innerHeight), 3);

	if (! DOMExists("geometry_div")) {
		var html = "<div id='geometry_div' style='position:absolute; height:1in; width:1in; left:-100%; top:-100%;'></div>";
		jQuery(document.body).append(html);
	}

	var devicePixelRatio = window.devicePixelRatio || 1;
	result["devicePixelRatio"] = devicePixelRatio;

	var dpi_x = document.getElementById('geometry_div').offsetWidth  * devicePixelRatio;
	var dpi_y = document.getElementById('geometry_div').offsetHeight * devicePixelRatio;
	var ppi_x = document.getElementById('geometry_div').offsetWidth ; // dpi_x / devicePixelRatio
	var ppi_y = document.getElementById('geometry_div').offsetHeight; // dpi_y / devicePixelRatio

	result["inch_to_device_px"] = "1 inch = " + dpi_x + " device_px";
	result["inch_to_css_px"] = "1 inch = " + ppi_x + " css_px";
	result["inch_to_dp"] = "1 inch = 160 dp";

	var dp_ratio = (dpi_x / devicePixelRatio) / 160;
	var px_ratio = (dp_ratio > 0) ? (1 / dp_ratio) : 1;

	result["dp_ratio"] = dp_ratio;
	result["dp_to_css_px"] = "1 dp = " + decimal(dp_ratio, 3) + " css_px";
	result["px_ratio"] = px_ratio;
	result["css_px_to_dp"] = "1 css_px = " + decimal(px_ratio, 3) + " dp";
	var numW = window.innerWidth * px_ratio, numH = window.innerHeight * px_ratio;
	result["window_to_DP"] = "windowWidth = " + decimal(numW, 3) + " dp, windowHeight = " + decimal(numH, 3) + " dp";

	return result;
};


// ****************************************************************************
// ****************************************************************************
//
// DOM
//
// ****************************************************************************
// ****************************************************************************

const vw2px = function(value)
{
	value = "" + value;
	if (value.indexOf("vw") > 0) {
		value = Math.round(parseInt(document.body.clientWidth) * parseInt(value) / 100);
	}
	else {
		value = parseInt(value);
	}
	return value;
};

const vh2px = function(value)
{
	console.log("IN vh2px() value='" + value + "'");
	value = "" + value;
	console.log(window.innerHeight);
	if (value.indexOf("vh") > 0) {
		//value = Math.round(parseInt(document.body.clientHeight) * parseInt(value) / 100);
		value = Math.round(parseInt(window.innerHeight) * parseInt(value) / 100);
	}
	else {
		value = parseInt(value);
	}
	console.log(value);
	return value;
};


const DOMExists = function(domID) {
  return (document.getElementById(domID) === null) ? false : true;
}

const DOMElement = function(obj) {
	return obj instanceof Element;
};


jQuery.fn.redraw = function(){
	return jQuery(this).each(function(){
		this.style.display = "none";
		this.offsetHeight;
		this.style.display = "block";
	});
};


const DOMRedraw = function(domElement, completed) {
	//console.log(typeof domElement);
	//console.log(domElement);
	if (typeof domElement === "string") { 
		//console.log("Resolve domElement");
		domElement = document.getElementById(domElement); 
	}
	//console.log("I AM HERE IN DOMRedraw()");
	//console.log(domElement);
	jQuery(domElement).redraw();
	if (typeof completed === "function") {
		//console.log("Before calling completed()");
		completed();
	}

	/*
	var n = document.createTextNode(' ');
	var disp = domElement.style.display;
	domElement.appendChild(n);
	domElement.style.display = 'none';
	setTimeout(
		function(){
			domElement.style.display = disp;
			n.parentNode.removeChild(n);
			if (typeof completed === "function") {
				completed();
			}
		},
		100
	);
	*/
};

const getScreenCordinates = function (obj) {
	if (typeof obj === "string") { obj = document.getElementById(obj); }
  var p = {};
  p.x = obj.offsetLeft;
  p.y = obj.offsetTop;
  while (obj.offsetParent) {
    p.x = p.x + obj.offsetParent.offsetLeft;
    p.y = p.y + obj.offsetParent.offsetTop - obj.offsetParent.scrollTop;
    if (obj == document.getElementsByTagName("body")[0]) {
      break;
    }
    else {
      obj = obj.offsetParent;
    }
  }
  return p;
}

function textWidth (text, container)
{
  var calc = '<span style="padding:0px;margin:0px;display:none;">' + text + '</span>';
	var selector = (typeof container === "string")? "#"+container :'body';
  jQuery(selector).append(calc);
  var width = jQuery(selector).find('span:last').width();
  jQuery(selector).find('span:last').remove();
  return width;
}

function makeFakeCssDiv (className)
{
  var elt = document.createElement('div');
  jQuery(elt).hide();
  if (typeof className !== "undefined") { elt.className = className };
  document.body.appendChild(elt);
  return elt;
}

function dropFakeCssDiv (elt)
{
  document.body.removeChild(elt);
}

function css (classname, property)
{
	//console.log("IN css() classname='" + classname + "' property='" + property + "'");
	jQuery("#P_FOR_CSS").removeClass(classname).addClass(classname);
	var result = jQuery("#P_FOR_CSS").css(property);
	//console.log(result);
	jQuery("#P_FOR_CSS").removeClass(classname);
	return result;
}

function getCssValue (classname, property)
{
	return css (classname, property);
}

function getCssVariable(eltID, variableName)
{
	if (variableName.slice(0,2) !== "--") { variableName = "--" + variableName; }
	//console.log(variableName);
	//console.info("IN getCssVariable() variableName='" + variableName + "'");
	return getComputedStyle(document.getElementById(eltID)).getPropertyValue(variableName);
}

// Example:
// 
// var x = getCssComputedValue("--bg-surface-text");
// console.log(x);
//
function getCssComputedValue (variableName)
{
	var style = getComputedStyle(document.body)
	return style.getPropertyValue(variableName);
}

function getPixelSizeFromCssValue (cssValue)
{
  var result = 0;
  var arr = breakApart (cssValue, " ");
  for (var i = 0; i < arr.length; i++) {
    var dum = arr [ i ];
    dum = dum.toLowerCase ();
    var p = dum.indexOf ("px");
    if (p >= 0) {
      result = parseInt (dum.slice (0, p));
    }
  }
  return result;
}

function holo (hexcolor)
{
	//console.log(hexcolor);
	if (hexcolor.slice(0, 1) === "#") {
		hexcolor = hexcolor.slice(1);
	}
	//console.log(hexcolor);
  var r = parseInt (hexcolor.slice(0, 2), 16);
	//console.log(r);
  var g = parseInt (hexcolor.slice(2, 4), 16);
	//console.log(g);
  var b = parseInt (hexcolor.slice(4), 16);
	//console.log(b);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	//console.log(yiq);
  return (yiq <= 128) ? 'dark' : 'light';
}

function contrast (hexcolor)
{
	switch(holo (hexcolor)) {
		case "dark"  : return "light";
		case "light" :
		default      : return "dark";
	}
}

/*
 * Computes the HEX value from an RGB array as returned by jQuery
 *
 * const string rgb : rgb string as returned by jQuery,
 *                    ex: "rgb(128,0,128)"
 *
 * example: var color = rgb2hex($('#myElement').css('background-color'));
 * 
 * Returns string HEX value
 *
 */
function rgb2hex(rgb)
{
	//console.log(rgb);
	var str = rgb;
	str = str_replace("rgb", "", str);
	str = str_replace("(", "", str);
	str = str_replace(")", "", str);
	str = trim(str);
	//console.log("str='" + str + "'");

	var dumrgb = breakApart(str,",");
	for (var i = 0; i < dumrgb.length; i++) {
		dumrgb[i] = trim(dumrgb[i]);
		//console.log("'" + dumrgb[i] + "'");
		//console.log(parseInt(dumrgb[i],10).toString(16));
	}
	//console.log(JSON.stringify(dumrgb));

	var is_transparent = function() {
		if (dumrgb.length >= 4) {
			for (var i = 0; i < dumrgb.length; i++) {
				var tmp = parseInt(dumrgb[i]);
				//console.log(tmp);
				if (tmp !== 0) {
					return false;
				}
			}
			return true;
		}
		else {
			return false;
		}
	};

	if (is_transparent()) {
		return ("transparent");
	}
	else {
		return  "#" + 
					 ("0" + parseInt(dumrgb[0],10).toString(16)).slice(-2) +
					 ("0" + parseInt(dumrgb[1],10).toString(16)).slice(-2) +
					 ("0" + parseInt(dumrgb[2],10).toString(16)).slice(-2);
	}
}

function hex2color(hex)
{
	if (hex.slice(0,1) !== "#") { hex = "#" + hex; }
	return hex;
}

function hex2rgb (hex)
{
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var rgb= result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
	if (rgb !== null) {
		result = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
	}
	return result;
}

/*
 * Computes RGBA string value for a color
 * 
 * const string color  : color value, expressed as one of following formats:
 *                       "#999999","rgb(r,g,b)","rgba(r,g,b,o)",
 *                       or "bg-xxx","fg-xxx" to match CSS color definitions
 * const string opacity: Opacity to set
 * 
 * Returns string, best attempt to format color into RGBA string
 * 
 */
function rgba (color,opacity)
{
	if (color.indexOf("rgba") === 0) {
		if (typeof opacity !== "undefined") {
			return (color.lastIndexOf(",") > 0) ? (color.slice(0,color.lastIndexOf(","))+","+opacity+")") : color;
		}
		else {
			return color;
		}
	}
	if (typeof opacity === "undefined") { opacity = 1; }
	if (color.slice(0,1) === ".") { color = color.slice(1); } // This is to handle "class" names returned like ".fg-blue", etc.
	var st_rgba = "" ;
	if (color.slice(0,1) === "#") {
		color = hex2rgb (color) ;
	}
	if (color.indexOf("rgb") >= 0) { 
		st_rgba = str_replace ("rgb","rgba",color); 
	}
	if (color.indexOf ("bg-") >= 0) {
		var st = css(color,"background-color");
		if (st.indexOf("rgba") < 0) {st_rgba = str_replace("rgb","rgba",st);}
	}
	if (color.indexOf ("fg-") >= 0) {
		var st = css(color,"color");
		if (st.indexOf("rgba") < 0) {st_rgba = str_replace("rgb","rgba",st);}
	}
	return st_rgba.slice(st_rgba,st_rgba.length-1) + ","+opacity +")" ;
}

/*
 * canvasID: DOM identifier of the canvasID
 * fontSize in pixels, please
 * x,y: top, left corner
 * 
 */
const textOut = (canvasID, text, fontType, fontSize, color, opacity, x, y) => {
	var ctx = document.getElementById(canvasID).getContext("2d");
	ctx.fillStyle = rgba(color,opacity);
  ctx.font = fontSize  + "px " + fontType;
	ctx.textBaseline = "top";
  ctx.fillText(text,x,y);
}

const htmlEntities = {

	encode : (str) => {
	  str = str_replace("\r", "", str);
	  str = str_replace("\n", "<br>", str);
  	str = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		return str_replace(" ", "&nbsp;", str);
	},

	decode : (str) => {
    str = str.replace(/<br>/gi,   '\n');
    str = str.replace(/&amp;/gi,  '&' );
    str = str.replace(/&lt;/gi,   '<' );
    str = str.replace(/&gt;/gi,   '>' );
    str = str.replace(/&nbsp;/gi, ' ' );
		return str;
	}
};

if (typeof isTouchSupported === "undefined") {
	var isTouchSupported = ('ontouchstart' in window);
}

function scrollbarWidth()
{
  var outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.width = "100px";
  outer.style.msOverflowStyle = "scrollbar";
  document.body.appendChild(outer);
  var widthNoScroll = outer.offsetWidth;
  outer.style.overflow = "scroll";
  var inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);
  var widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  return widthNoScroll - widthWithScroll;
}

// Works for editable DIV
//
function move_cursor_to_end (element) 
{
	if (typeof element === "string") { element = document.getElementById(element); }
	var range, selection;
	if (document.createRange) {
		range = document.createRange();
		range.selectNodeContents(element);
    range.collapse(false);
		selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
	}
	else if (document.selection) {
		range = document.body.createTextRange();
		range.moveToElementText(element);
		range.collapse(false);
		range.select();
	}
}

// Works for input, textarea
//
function input_selection_start(eltId)
{
	var element = document.getElementById(eltId);
	return element.selectionStart;
}

function input_selection_end(eltId)
{
	var element = document.getElementById(eltId);
	return element.selectionEnd;
}

function input_cursor_to_pos(eltId, pos)
{
	var element = document.getElementById(eltId);
	element.focus();
	element.setSelectionRange(pos, pos);
}

function input_cursor_to_end(eltId)
{
	var element = document.getElementById(eltId);
	var len = strlen(element.value);
	input_cursor_to_pos(eltId, len);
}

// May works for editable DIV
//
function insertTextAtCursor(text) 
{
  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  }
	else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
}


// ****************************************************************************
// ****************************************************************************
//
// PLUGINS
//
// ****************************************************************************
// ****************************************************************************

function plugin(pluginID, filepath)
{
	return new Promise(
		(resolve,reject)=>{
			
		//console.log("IN plugin() pluginID='" + pluginID + "' filepath='" + filepath + "'");

			var success = function() {
				var P = new window[pluginID];
				resolve (P);
			};

			if (typeof window[pluginID] === "undefined") {
				//console.log("Loading plugin...");
				jQuery.getScript(filepath)
				.done(function() {
					//console.log("OK");
					success();
				})
				.fail(function() {
					//console.log("Runtime Exception in jQuery.getScript() plugin ID='" + pluginID + "'");
					reject();
				});
			}
			else {
				//console.log("Plugin already loaded");
				success();
			}

		}
	);
}


// End of file: lib.js
// ============================================================================